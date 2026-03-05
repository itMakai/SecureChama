from uuid import uuid4

from django.db.models import Count, Sum
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .auth_serializers import CustomTokenObtainPairSerializer
from .mixins import SaccoScopedQuerysetMixin
from .models import (
    AuditLog,
    GuarantorRelationship,
    Loan,
    LoanRepayment,
    MemberProfile,
    RiskScore,
    Sacco,
    SaccoJoinRequest,
    SavingsAccount,
    SavingsTransaction,
    User,
)
from .permissions import HasAnyRole, IsPlatformAdmin
from .serializers import (
    AuditLogSerializer,
    GuarantorRelationshipSerializer,
    LoanRepaymentSerializer,
    LoanSerializer,
    MemberProfileSerializer,
    MemberRegistrationSerializer,
    PublicSaccoSerializer,
    RiskScoreSerializer,
    SaccoJoinRequestSerializer,
    SaccoSerializer,
    SavingsAccountSerializer,
    SavingsTransactionSerializer,
)
from .services.risk_engine import RiskEngine


def write_audit_log(request, action, obj):
    sacco = getattr(obj, "sacco", None)
    if sacco is None:
        if hasattr(obj, "loan"):
            sacco = obj.loan.sacco
        elif hasattr(obj, "savings_account"):
            sacco = obj.savings_account.sacco
    if sacco is None and request.user.sacco_id:
        sacco = request.user.sacco

    if sacco is None:
        return

    AuditLog.objects.create(
        user=request.user if request.user.is_authenticated else None,
        sacco=sacco,
        action=action,
        object_type=obj.__class__.__name__,
        object_id=str(obj.pk),
        ip_address=request.META.get("REMOTE_ADDR"),
    )


class RolePermission(HasAnyRole):
    allowed_roles = {"platform_admin", "sacco_admin", "loan_officer", "member"}


class StaffPermission(HasAnyRole):
    allowed_roles = {"platform_admin", "sacco_admin", "loan_officer"}


class AdminPermission(HasAnyRole):
    allowed_roles = {"platform_admin", "sacco_admin"}


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class SaccoViewSet(viewsets.ModelViewSet):
    queryset = Sacco.objects.all()
    serializer_class = SaccoSerializer

    def get_permissions(self):
        if self.action == "public":
            return [AllowAny()]
        if self.action in {"join"}:
            return [IsAuthenticated(), RolePermission()]
        return [IsAuthenticated(), IsPlatformAdmin()]

    def get_serializer_class(self):
        if self.action == "public":
            return PublicSaccoSerializer
        return super().get_serializer_class()

    @action(detail=False, methods=["get"], url_path="public")
    def public(self, request):
        saccos = Sacco.objects.filter(is_active=True).order_by("name")
        serializer = self.get_serializer(saccos, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def join(self, request, pk=None):
        sacco = self.get_object()
        user = request.user

        if user.sacco_id is not None:
            return Response(
                {"error": "User already belongs to a sacco."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        existing = SaccoJoinRequest.objects.filter(user=user, status="pending").first()
        if existing:
            return Response(
                {"error": "You already have a pending join request."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        join_request = SaccoJoinRequest.objects.create(user=user, sacco=sacco)
        write_audit_log(request, "join_request_created", join_request)
        return Response({"status": "Join request submitted"}, status=status.HTTP_201_CREATED)


class JoinRequestViewSet(SaccoScopedQuerysetMixin, viewsets.ModelViewSet):
    queryset = SaccoJoinRequest.objects.select_related("sacco", "user", "reviewed_by")
    serializer_class = SaccoJoinRequestSerializer
    permission_classes = [IsAuthenticated, StaffPermission]
    sacco_filter_path = "sacco"
    filterset_fields = ["status", "sacco"]
    ordering_fields = ["created_at", "reviewed_at"]
    search_fields = ["user__username", "user__email", "sacco__name"]

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, AdminPermission])
    def approve(self, request, pk=None):
        join_request = self.get_object()
        try:
            join_request.approve(request.user)
        except ValueError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        write_audit_log(request, "join_request_approved", join_request)
        return Response({"status": "Join request approved"})

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, AdminPermission])
    def reject(self, request, pk=None):
        join_request = self.get_object()
        try:
            join_request.reject(request.user)
        except ValueError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        write_audit_log(request, "join_request_rejected", join_request)
        return Response({"status": "Join request rejected"})


class MemberProfileViewSet(SaccoScopedQuerysetMixin, viewsets.ModelViewSet):
    queryset = MemberProfile.objects.select_related("user", "sacco")
    serializer_class = MemberProfileSerializer
    permission_classes = [IsAuthenticated, RolePermission]
    filterset_fields = ["risk_band", "status", "employment_type"]
    ordering_fields = ["join_date", "monthly_income", "created_at"]
    search_fields = ["user__username", "user__membership_number", "user__email", "user__name"]

    @action(detail=False, methods=["post"], permission_classes=[AllowAny], url_path="register")
    def register(self, request):
        serializer = MemberRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        email = payload["email"].lower().strip()
        if User.objects.filter(email=email).exists():
            return Response(
                {"error": "A user with this email already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            sacco = Sacco.objects.get(id=payload["sacco"], is_active=True)
        except Sacco.DoesNotExist:
            return Response(
                {"error": "Invalid SACCO selected."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        username_base = email.split("@")[0][:20] or "member"
        username = f"{username_base}_{uuid4().hex[:6]}"
        membership_number = f"M-{uuid4().hex[:8].upper()}"
        password = payload.get("password") or uuid4().hex

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            name=payload["name"].strip(),
            membership_number=membership_number,
            phone_number=payload["phone_number"],
            role="member",
            sacco=sacco,
        )

        profile = MemberProfile.objects.create(
            user=user,
            sacco=sacco,
            join_date=timezone.now().date(),
            employment_type=payload.get("employment_type", ""),
            monthly_income=payload.get("monthly_income"),
        )
        write_audit_log(request, "member_registered", profile)

        return Response(
            {
                "message": "Registration submitted successfully.",
                "username": username,
                "membership_number": membership_number,
            },
            status=status.HTTP_201_CREATED,
        )


class SavingsAccountViewSet(SaccoScopedQuerysetMixin, viewsets.ModelViewSet):
    queryset = SavingsAccount.objects.select_related("member", "member__user", "sacco")
    serializer_class = SavingsAccountSerializer
    permission_classes = [IsAuthenticated, RolePermission]

    def perform_create(self, serializer):
        super().perform_create(serializer)
        write_audit_log(self.request, "savings_account_created", serializer.instance)


class SavingsTransactionViewSet(SaccoScopedQuerysetMixin, viewsets.ModelViewSet):
    queryset = SavingsTransaction.objects.select_related("savings_account", "savings_account__sacco")
    serializer_class = SavingsTransactionSerializer
    permission_classes = [IsAuthenticated, RolePermission]
    sacco_filter_path = "savings_account__sacco"
    filterset_fields = ["transaction_type", "created_at", "savings_account"]
    ordering_fields = ["created_at", "amount"]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
        write_audit_log(self.request, "savings_transaction_created", serializer.instance)


class LoanViewSet(SaccoScopedQuerysetMixin, viewsets.ModelViewSet):
    queryset = Loan.objects.select_related("member", "member__user", "sacco", "approved_by")
    serializer_class = LoanSerializer
    permission_classes = [IsAuthenticated, RolePermission]
    filterset_fields = ["status", "member", "created_at"]
    ordering_fields = ["created_at", "principal_amount", "interest_rate"]
    search_fields = ["member__user__username", "member__user__membership_number", "purpose"]

    def perform_create(self, serializer):
        super().perform_create(serializer)
        write_audit_log(self.request, "loan_application_created", serializer.instance)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, StaffPermission])
    def approve(self, request, pk=None):
        loan = self.get_object()
        if request.user.role not in {"sacco_admin", "loan_officer", "platform_admin"}:
            return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)

        try:
            loan.approve(request.user)
            if loan.status == "approved":
                loan.status = "active"
                loan.disbursed_at = timezone.now()
                loan.save()
        except ValueError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        write_audit_log(request, "loan_approved", loan)
        return Response({"status": "Loan approved"})

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, StaffPermission])
    def assign_guarantor(self, request, pk=None):
        loan = self.get_object()
        guarantor_id = request.data.get("guarantor")
        guaranteed_amount = request.data.get("guaranteed_amount")

        if not guarantor_id or not guaranteed_amount:
            return Response(
                {"error": "guarantor and guaranteed_amount are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            guarantor = MemberProfile.objects.get(id=guarantor_id, sacco=loan.sacco)
        except MemberProfile.DoesNotExist:
            return Response({"error": "Guarantor not found in this sacco."}, status=status.HTTP_404_NOT_FOUND)

        relationship, created = GuarantorRelationship.objects.get_or_create(
            loan=loan,
            guarantor=guarantor,
            defaults={"guaranteed_amount": guaranteed_amount},
        )
        if not created:
            relationship.guaranteed_amount = guaranteed_amount
            relationship.save()

        write_audit_log(request, "loan_guarantor_assigned", relationship)
        return Response({"status": "Guarantor assigned"})


class LoanRepaymentViewSet(SaccoScopedQuerysetMixin, viewsets.ModelViewSet):
    queryset = LoanRepayment.objects.select_related("loan", "loan__sacco", "recorded_by")
    serializer_class = LoanRepaymentSerializer
    permission_classes = [IsAuthenticated, StaffPermission]
    sacco_filter_path = "loan__sacco"
    filterset_fields = ["loan", "payment_date", "recorded_by"]
    ordering_fields = ["payment_date", "created_at", "amount_paid"]

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)
        write_audit_log(self.request, "loan_repayment_recorded", serializer.instance)
        RiskEngine.calculate(serializer.instance.loan.member)


class GuarantorRelationshipViewSet(SaccoScopedQuerysetMixin, viewsets.ModelViewSet):
    queryset = GuarantorRelationship.objects.select_related("loan", "loan__sacco", "guarantor", "guarantor__user")
    serializer_class = GuarantorRelationshipSerializer
    permission_classes = [IsAuthenticated, StaffPermission]
    sacco_filter_path = "loan__sacco"
    filterset_fields = ["loan", "guarantor"]
    ordering_fields = ["created_at", "guaranteed_amount"]

    def perform_create(self, serializer):
        serializer.save()
        write_audit_log(self.request, "guarantor_relationship_created", serializer.instance)
        RiskEngine.calculate(serializer.instance.loan.member)

    @action(detail=False, methods=["get"], url_path="exposure")
    def exposure(self, request):
        qs = self.filter_queryset(self.get_queryset())
        rows = (
            qs.values("guarantor", "guarantor__user__name")
            .annotate(total_exposure=Sum("guaranteed_amount"), guaranteed_loans=Count("loan"))
            .order_by("-total_exposure")
        )
        return Response(list(rows))


class RiskScoreViewSet(SaccoScopedQuerysetMixin, viewsets.ReadOnlyModelViewSet):
    queryset = RiskScore.objects.select_related("member", "member__user", "sacco").prefetch_related("factors")
    serializer_class = RiskScoreSerializer
    permission_classes = [IsAuthenticated, StaffPermission]
    filterset_fields = ["member", "risk_band", "calculated_at"]
    ordering_fields = ["calculated_at", "score_value"]
    search_fields = ["member__user__username", "member__user__membership_number"]

    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated, StaffPermission])
    def recalculate_member(self, request):
        member_id = request.data.get("member")
        if not member_id:
            return Response({"error": "member is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            member = MemberProfile.objects.get(id=member_id)
        except MemberProfile.DoesNotExist:
            return Response({"error": "Member profile not found"}, status=status.HTTP_404_NOT_FOUND)

        if request.user.role != "platform_admin" and member.sacco_id != request.user.sacco_id:
            return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        score = RiskEngine.calculate(member)
        write_audit_log(request, "risk_recalculated", score)
        return Response(RiskScoreSerializer(score).data, status=status.HTTP_201_CREATED)


class AuditLogViewSet(SaccoScopedQuerysetMixin, viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.select_related("user", "sacco")
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated, StaffPermission]
    filterset_fields = ["sacco", "action", "object_type", "timestamp"]
    ordering_fields = ["timestamp"]
    search_fields = ["action", "object_type", "object_id", "user__username"]


class AnalyticsOverviewView(APIView):
    permission_classes = [IsAuthenticated, RolePermission]

    def get(self, request):
        member_qs = MemberProfile.objects.all()
        savings_qs = SavingsAccount.objects.all()
        loan_qs = Loan.objects.all()
        guarantor_qs = GuarantorRelationship.objects.all()
        risk_qs = RiskScore.objects.all()

        if request.user.role != "platform_admin":
            if not request.user.sacco_id:
                return Response(
                    {
                        "total_members": 0,
                        "total_savings": 0,
                        "active_loans": 0,
                        "portfolio_risk": 0,
                        "avg_risk_score": 0,
                        "high_risk_members": 0,
                        "default_probability": 0,
                        "guarantor_exposure_total": 0,
                        "savings_growth": [],
                    }
                )

            member_qs = member_qs.filter(sacco=request.user.sacco)
            savings_qs = savings_qs.filter(sacco=request.user.sacco)
            loan_qs = loan_qs.filter(sacco=request.user.sacco)
            guarantor_qs = guarantor_qs.filter(loan__sacco=request.user.sacco)
            risk_qs = risk_qs.filter(sacco=request.user.sacco)

        total_members = member_qs.count()
        total_savings = savings_qs.aggregate(total=Sum("current_balance"))["total"] or 0
        active_loans = loan_qs.filter(status="active").count()

        defaulted_loans = loan_qs.filter(status="defaulted").count()
        portfolio_base = active_loans + defaulted_loans
        portfolio_risk = round((defaulted_loans / portfolio_base) * 100, 2) if portfolio_base else 0

        latest_scores_map = {}
        for score in risk_qs.order_by("member_id", "-calculated_at"):
            if score.member_id not in latest_scores_map:
                latest_scores_map[score.member_id] = score
        latest_scores = list(latest_scores_map.values())
        avg_risk_score = (
            sum(score.score_value for score in latest_scores) / len(latest_scores)
            if latest_scores
            else 0
        )
        high_risk_members = sum(1 for score in latest_scores if score.risk_band == "high")
        default_probability = round((high_risk_members / total_members) * 100, 2) if total_members else 0
        guarantor_exposure_total = guarantor_qs.aggregate(total=Sum("guaranteed_amount"))["total"] or 0

        savings_growth_rows = (
            SavingsTransaction.objects.filter(
                savings_account__in=savings_qs.values("id"),
                transaction_type="deposit",
            )
            .values("created_at__year", "created_at__month")
            .annotate(amount=Sum("amount"))
            .order_by("created_at__year", "created_at__month")
        )
        savings_growth = [
            {
                "month": f'{row["created_at__year"]}-{row["created_at__month"]:02d}',
                "amount": row["amount"] or 0,
            }
            for row in savings_growth_rows
        ]

        exposure_concentration = list(
            guarantor_qs.values("guarantor_id", "guarantor__user__name")
            .annotate(exposure=Sum("guaranteed_amount"))
            .order_by("-exposure")[:10]
        )
        loan_status_distribution = list(
            loan_qs.values("status")
            .annotate(count=Count("id"))
            .order_by("status")
        )
        risk_band_distribution = [
            {"risk_band": "low", "count": sum(1 for score in latest_scores if score.risk_band == "low")},
            {"risk_band": "medium", "count": sum(1 for score in latest_scores if score.risk_band == "medium")},
            {"risk_band": "high", "count": sum(1 for score in latest_scores if score.risk_band == "high")},
        ]
        guarantor_network = list(
            guarantor_qs.values(
                "guarantor__user__name",
                "loan__member__user__name",
                "guaranteed_amount",
            )[:120]
        )

        return Response(
            {
                "total_members": total_members,
                "total_savings": total_savings,
                "active_loans": active_loans,
                "portfolio_risk": portfolio_risk,
                "avg_risk_score": round(avg_risk_score, 2) if avg_risk_score else 0,
                "high_risk_members": high_risk_members,
                "default_probability": default_probability,
                "guarantor_exposure_total": guarantor_exposure_total,
                "savings_growth": savings_growth,
                "exposure_concentration": exposure_concentration,
                "loan_status_distribution": loan_status_distribution,
                "risk_band_distribution": risk_band_distribution,
                "guarantor_network": guarantor_network,
            }
        )

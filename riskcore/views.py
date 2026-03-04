from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from django.db.models import Sum
from .models import Sacco, MemberProfile, SavingsAccount, SavingsTransaction, Loan, User, SaccoJoinRequest
from .serializers import (
    SaccoSerializer,
    MemberProfileSerializer,
    SavingsAccountSerializer,
    SavingsTransactionSerializer,
    LoanSerializer
)
from .permissions import IsPlatformAdmin
from .mixins import SaccoScopedQuerysetMixin
from rest_framework_simplejwt.views import TokenObtainPairView
from .auth_serializers import CustomTokenObtainPairSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from uuid import uuid4


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class SaccoViewSet(viewsets.ModelViewSet):
    queryset = Sacco.objects.all()
    serializer_class = SaccoSerializer

    def get_permissions(self):
        if self.action == "public":
            return [AllowAny()]
        if self.action == "join":
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsPlatformAdmin()]

    @action(detail=False, methods=["get"], url_path="public")
    def public(self, request):
        saccos = Sacco.objects.filter(is_active=True)
        serializer = SaccoSerializer(saccos, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def join(self, request, pk=None):
        sacco = self.get_object()
        user = request.user

        if user.sacco is not None:
            return Response(
                {"error": "User already belongs to a sacco."},
                status=status.HTTP_400_BAD_REQUEST
            )

        SaccoJoinRequest.objects.create(
            user=user,
            sacco=sacco
        )

        return Response({"status": "Join request submitted"})



class MemberProfileViewSet(SaccoScopedQuerysetMixin, viewsets.ModelViewSet):
    queryset = MemberProfile.objects.all()
    serializer_class = MemberProfileSerializer
    permission_classes = [IsAuthenticated]
    
    filterset_fields = ['risk_band', 'status']
    ordering_fields = ['join_date']
    search_fields = ['user__username', 'user__membership_number']

    @action(detail=False, methods=["post"], permission_classes=[AllowAny], url_path="register")
    def register(self, request):
        name = (request.data.get("name") or "").strip()
        email = (request.data.get("email") or "").strip().lower()
        sacco_id = request.data.get("sacco")

        if not name or not email or not sacco_id:
            return Response(
                {"error": "name, email and sacco are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            sacco = Sacco.objects.get(id=sacco_id, is_active=True)
        except Sacco.DoesNotExist:
            return Response(
                {"error": "Invalid SACCO selected."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {"error": "A user with this email already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        username_base = email.split("@")[0][:20] or "member"
        username = f"{username_base}_{uuid4().hex[:6]}"
        membership_number = f"M-{uuid4().hex[:8].upper()}"
        temp_password = uuid4().hex

        user = User.objects.create_user(
            username=username,
            email=email,
            password=temp_password,
            name=name,
            membership_number=membership_number,
            phone_number=request.data.get("phone_number", "N/A"),
            role="member",
            sacco=sacco,
        )

        MemberProfile.objects.create(
            user=user,
            sacco=sacco,
            join_date=timezone.now().date(),
        )

        return Response(
            {
                "message": "Registration submitted successfully.",
                "username": username,
                "membership_number": membership_number,
            },
            status=status.HTTP_201_CREATED,
        )


class SavingsAccountViewSet(SaccoScopedQuerysetMixin, viewsets.ModelViewSet):
    queryset = SavingsAccount.objects.all()
    serializer_class = SavingsAccountSerializer
    permission_classes = [IsAuthenticated]


class SavingsTransactionViewSet(SaccoScopedQuerysetMixin, viewsets.ModelViewSet):
    queryset = SavingsTransaction.objects.all()
    serializer_class = SavingsTransactionSerializer
    permission_classes = [IsAuthenticated]
    
    filterset_fields = ['transaction_type', 'created_at']
    ordering_fields = ['created_at', 'amount']


class LoanViewSet(SaccoScopedQuerysetMixin, viewsets.ModelViewSet):
    queryset = Loan.objects.all()
    serializer_class = LoanSerializer
    permission_classes = [IsAuthenticated]

    filterset_fields = ['status', 'member', 'created_at']
    ordering_fields = ['created_at', 'principal_amount']
    search_fields = ['member__user__username']

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        loan = self.get_object()

        if request.user.role not in ["sacco_admin", "loan_officer"]:
            return Response({"error": "Not authorized"}, status=403)

        loan.approve(request.user)
        return Response({"status": "Loan approved"})


class AnalyticsOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        member_qs = MemberProfile.objects.all()
        savings_qs = SavingsAccount.objects.all()
        loan_qs = Loan.objects.all()

        if request.user.role != "platform_admin":
            if not request.user.sacco_id:
                return Response(
                    {
                        "total_members": 0,
                        "total_savings": 0,
                        "active_loans": 0,
                        "portfolio_risk": 0,
                    }
                )

            member_qs = member_qs.filter(sacco=request.user.sacco)
            savings_qs = savings_qs.filter(sacco=request.user.sacco)
            loan_qs = loan_qs.filter(sacco=request.user.sacco)

        total_members = member_qs.count()
        total_savings = savings_qs.aggregate(total=Sum("current_balance"))["total"] or 0
        active_loans = loan_qs.filter(status="active").count()

        defaulted_loans = loan_qs.filter(status="defaulted").count()
        portfolio_base = active_loans + defaulted_loans
        portfolio_risk = round((defaulted_loans / portfolio_base) * 100, 2) if portfolio_base else 0

        return Response(
            {
                "total_members": total_members,
                "total_savings": total_savings,
                "active_loans": active_loans,
                "portfolio_risk": portfolio_risk,
            }
        )
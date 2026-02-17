from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Sacco, MemberProfile, SavingsAccount, SavingsTransaction, Loan
from .serializers import (
    SaccoSerializer,
    MemberProfileSerializer,
    SavingsAccountSerializer,
    SavingsTransactionSerializer,
    LoanSerializer
)
from .permissions import IsPlatformAdmin
from .services.risk_engine import RiskEngine
from .mixins import SaccoScopedQuerysetMixin
from rest_framework_simplejwt.views import TokenObtainPairView
from .auth_serializers import CustomTokenObtainPairSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class SaccoViewSet(viewsets.ModelViewSet):
    queryset = Sacco.objects.all()
    serializer_class = SaccoSerializer
    permission_classes = [IsAuthenticated, IsPlatformAdmin]


class MemberProfileViewSet(SaccoScopedQuerysetMixin, viewsets.ModelViewSet):
    queryset = MemberProfile.objects.all()
    serializer_class = MemberProfileSerializer
    permission_classes = [IsAuthenticated]
    
    filterset_fields = ['risk_band', 'status']
    ordering_fields = ['join_date']
    search_fields = ['user__username', 'user__membership_number']


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
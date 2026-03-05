from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import (
    AuditLogViewSet,
    SaccoViewSet,
    JoinRequestViewSet,
    MemberProfileViewSet,
    SavingsAccountViewSet,
    SavingsTransactionViewSet,
    LoanViewSet,
    LoanRepaymentViewSet,
    GuarantorRelationshipViewSet,
    RiskScoreViewSet,
    AnalyticsOverviewView,
)

router = DefaultRouter()
router.register(r'saccos', SaccoViewSet)
router.register(r'join-requests', JoinRequestViewSet)
router.register(r'members', MemberProfileViewSet)
router.register(r'savings-accounts', SavingsAccountViewSet)
router.register(r'savings-transactions', SavingsTransactionViewSet)
router.register(r'loans', LoanViewSet)
router.register(r'loan-repayments', LoanRepaymentViewSet)
router.register(r'guarantor-relationships', GuarantorRelationshipViewSet)
router.register(r'risk-scores', RiskScoreViewSet)
router.register(r'audit-logs', AuditLogViewSet)

urlpatterns = router.urls
urlpatterns += [
    path('analytics/overview/', AnalyticsOverviewView.as_view(), name='analytics-overview'),
]

from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import (
    SaccoViewSet,
    MemberProfileViewSet,
    SavingsAccountViewSet,
    SavingsTransactionViewSet,
    LoanViewSet,
    AnalyticsOverviewView,
)

router = DefaultRouter()
router.register(r'saccos', SaccoViewSet)
router.register(r'members', MemberProfileViewSet)
router.register(r'savings-accounts', SavingsAccountViewSet)
router.register(r'savings-transactions', SavingsTransactionViewSet)
router.register(r'loans', LoanViewSet)

urlpatterns = router.urls
urlpatterns += [
    path('analytics/overview/', AnalyticsOverviewView.as_view(), name='analytics-overview'),
]

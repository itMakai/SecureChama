from rest_framework.routers import DefaultRouter
from .views import (
    SaccoViewSet,
    MemberProfileViewSet,
    SavingsAccountViewSet,
    SavingsTransactionViewSet,
    LoanViewSet
)

router = DefaultRouter()
router.register(r'saccos', SaccoViewSet)
router.register(r'members', MemberProfileViewSet)
router.register(r'savings-accounts', SavingsAccountViewSet)
router.register(r'savings-transactions', SavingsTransactionViewSet)
router.register(r'loans', LoanViewSet)

urlpatterns = router.urls

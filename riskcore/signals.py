from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import GuarantorRelationship, SavingsTransaction
from .services.risk_engine import RiskEngine
from .models import LoanRepayment

@receiver(post_save, sender=LoanRepayment)
def recalc_risk_on_repayment(sender, instance, created, **kwargs):
    if created:
        RiskEngine.calculate(instance.loan.member)


@receiver(post_save, sender=SavingsTransaction)
def recalc_risk_on_savings(sender, instance, created, **kwargs):
    if created:
        RiskEngine.calculate(instance.savings_account.member)


@receiver(post_save, sender=GuarantorRelationship)
def recalc_risk_on_guarantor_change(sender, instance, created, **kwargs):
    if created:
        RiskEngine.calculate(instance.guarantor)
        RiskEngine.calculate(instance.loan.member)

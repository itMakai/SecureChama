from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import transaction
from .models import SavingsTransaction, SavingsAccount
from .services.risk_engine import RiskEngine
from .models import LoanRepayment, Loan

@receiver(post_save, sender=SavingsTransaction)
def update_savings_balance(sender, instance, created, **kwargs):
    if not created:
        return

    account = instance.savings_account

    with transaction.atomic():
        if instance.transaction_type == "deposit":
            account.current_balance += instance.amount
        elif instance.transaction_type == "withdrawal":
            account.current_balance -= instance.amount

        account.save()

@receiver(post_save, sender=LoanRepayment)
def recalc_risk_on_repayment(sender, instance, created, **kwargs):
    if created:
        RiskEngine.calculate(instance.loan.member)


@receiver(post_save, sender=SavingsTransaction)
def recalc_risk_on_savings(sender, instance, created, **kwargs):
    if created:
        RiskEngine.calculate(instance.savings_account.member)
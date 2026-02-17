from decimal import Decimal
from django.db.models import Sum
from riskcore.models import (
    SavingsTransaction,
    Loan,
    LoanRepayment,
    RiskScore,
    RiskFactorSnapshot
)


class RiskEngine:

    @staticmethod
    def calculate(member):

        # -----------------------------
        # Savings consistency score
        # -----------------------------
        deposits = SavingsTransaction.objects.filter(
            savings_account__member=member,
            transaction_type="deposit"
        ).count()

        savings_score = min(deposits * 5, 100)

        # -----------------------------
        # Repayment behavior score
        # -----------------------------
        loans = Loan.objects.filter(member=member)

        repayment_score = 100

        for loan in loans:
            total_paid = LoanRepayment.objects.filter(
                loan=loan
            ).aggregate(total=Sum("amount_paid"))["total"] or Decimal(0)

            if total_paid < loan.principal_amount:
                repayment_score -= 20

        repayment_score = max(repayment_score, 0)

        # -----------------------------
        # Debt-to-income ratio
        # -----------------------------
        active_loans = loans.filter(status="active").aggregate(
            total=Sum("principal_amount")
        )["total"] or Decimal(0)

        if member.monthly_income:
            dti = (active_loans / member.monthly_income) * 100
        else:
            dti = Decimal(100)

        # -----------------------------
        # Guarantor exposure
        # -----------------------------
        guarantor_loans = member.loans.count()
        guarantor_score = max(100 - (guarantor_loans * 10), 0)

        # -----------------------------
        # Final score
        # -----------------------------
        final_score = int(
            (savings_score * 0.3) +
            (repayment_score * 0.3) +
            (guarantor_score * 0.2) +
            (max(0, 100 - dti) * 0.2)
        )

        risk_band = "low"
        if final_score < 40:
            risk_band = "high"
        elif final_score < 70:
            risk_band = "medium"

        risk_score = RiskScore.objects.create(
            member=member,
            sacco=member.sacco,
            score_value=final_score,
            risk_band=risk_band,
            model_version="v1"
        )

        RiskFactorSnapshot.objects.create(
            risk_score=risk_score,
            savings_consistency_score=savings_score,
            repayment_behavior_score=repayment_score,
            guarantor_exposure_score=guarantor_score,
            debt_to_income_ratio=dti,
        )

        return risk_score

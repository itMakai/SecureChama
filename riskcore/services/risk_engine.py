from decimal import Decimal
from django.db.models import Sum
from riskcore.models import (
    GuarantorRelationship,
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
            dti = (active_loans / member.monthly_income) * Decimal(100)
        else:
            dti = Decimal(100)

        # -----------------------------
        # Guarantor exposure
        # -----------------------------
        guarantor_exposure = GuarantorRelationship.objects.filter(
            guarantor=member
        ).aggregate(total=Sum("guaranteed_amount"))["total"] or Decimal(0)
        guarantor_score = max(100 - int(guarantor_exposure / Decimal(10000)), 0)

        # -----------------------------
        # Final score
        # -----------------------------
        safe_dti_component = max(0.0, 100.0 - float(dti))
        final_score = int(
            (float(savings_score) * 0.3) +
            (float(repayment_score) * 0.3) +
            (float(guarantor_score) * 0.2) +
            (safe_dti_component * 0.2)
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

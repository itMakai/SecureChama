from rest_framework import serializers
from django.db.models import Sum
from .models import (
    Sacco, MemberProfile,
    SavingsAccount, SavingsTransaction,
    Loan
)


class SaccoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sacco
        fields = "__all__"


class MemberProfileSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="user.name", read_only=True)
    membership_number = serializers.CharField(source="user.membership_number", read_only=True)
    total_savings = serializers.SerializerMethodField()
    risk_score = serializers.SerializerMethodField()

    class Meta:
        model = MemberProfile
        fields = "__all__"

    def get_total_savings(self, obj):
        total = obj.savings_accounts.aggregate(total=Sum("current_balance"))["total"]
        return total or 0

    def get_risk_score(self, obj):
        latest = obj.risk_scores.order_by("-calculated_at").first()
        return latest.score_value if latest else None


class SavingsAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavingsAccount
        fields = "__all__"


class SavingsTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavingsTransaction
        fields = "__all__"

    def validate(self, data):
        account = data['savings_account']
        amount = data['amount']
        tx_type = data['transaction_type']

        if amount <= 0:
            raise serializers.ValidationError("Amount must be positive.")

        if tx_type == "withdrawal" and account.current_balance < amount:
            raise serializers.ValidationError("Insufficient balance.")

        return data

class LoanSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source="member.user.name", read_only=True)
    amount = serializers.DecimalField(source="principal_amount", max_digits=14, decimal_places=2, read_only=True)

    class Meta:
        model = Loan
        fields = "__all__"

    def validate_principal_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Loan principal must be positive.")
        return value

    def validate_interest_rate(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Interest rate must be between 0 and 100.")
        return value

    def validate_term_months(self, value):
        if value <= 0 or value > 120:
            raise serializers.ValidationError("Loan term must be between 1 and 120 months.")
        return value

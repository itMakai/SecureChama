from rest_framework import serializers
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
    class Meta:
        model = MemberProfile
        fields = "__all__"


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

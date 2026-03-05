from django.db.models import Sum
from rest_framework import serializers

from .models import (
    AuditLog,
    GuarantorRelationship,
    Loan,
    LoanRepayment,
    MemberProfile,
    RiskFactorSnapshot,
    RiskScore,
    Sacco,
    SaccoJoinRequest,
    SavingsAccount,
    SavingsTransaction,
    User,
)


class SaccoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sacco
        fields = "__all__"


class PublicSaccoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sacco
        fields = [
            "id",
            "name",
            "description",
            "benefits",
            "membership_requirements",
            "terms_of_service",
            "base_interest_rate",
            "is_active",
        ]


class MemberProfileSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="user.name", read_only=True)
    membership_number = serializers.CharField(source="user.membership_number", read_only=True)
    phone_number = serializers.CharField(source="user.phone_number", read_only=True)
    account_status = serializers.CharField(source="status", read_only=True)
    total_savings = serializers.SerializerMethodField()
    risk_score = serializers.SerializerMethodField()
    guarantor_exposure = serializers.SerializerMethodField()
    debt_to_income_ratio = serializers.SerializerMethodField()

    class Meta:
        model = MemberProfile
        fields = "__all__"

    def get_total_savings(self, obj):
        total = obj.savings_accounts.aggregate(total=Sum("current_balance"))["total"]
        return total or 0

    def get_risk_score(self, obj):
        latest = obj.risk_scores.order_by("-calculated_at").first()
        return latest.score_value if latest else None

    def get_guarantor_exposure(self, obj):
        return obj.total_guaranteed_exposure()

    def get_debt_to_income_ratio(self, obj):
        return obj.debt_to_income_ratio


class MemberRegistrationSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    phone_number = serializers.CharField(max_length=20)
    sacco = serializers.IntegerField()
    employment_type = serializers.CharField(max_length=100, required=False, allow_blank=True)
    monthly_income = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
    password = serializers.CharField(min_length=8, required=False, write_only=True)


class SavingsAccountSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source="member.user.name", read_only=True)

    class Meta:
        model = SavingsAccount
        fields = "__all__"


class SavingsTransactionSerializer(serializers.ModelSerializer):
    sacco = serializers.SerializerMethodField()

    class Meta:
        model = SavingsTransaction
        fields = "__all__"
        read_only_fields = ["created_by"]

    def get_sacco(self, obj):
        return obj.savings_account.sacco_id

    def validate(self, data):
        account = data["savings_account"]
        amount = data["amount"]
        tx_type = data["transaction_type"]

        if amount <= 0:
            raise serializers.ValidationError("Amount must be positive.")

        if tx_type == "withdrawal" and account.current_balance < amount:
            raise serializers.ValidationError("Insufficient balance.")

        return data


class LoanSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source="member.user.name", read_only=True)
    amount = serializers.DecimalField(source="principal_amount", max_digits=14, decimal_places=2, read_only=True)
    guarantor_count = serializers.IntegerField(source="guarantors.count", read_only=True)

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


class LoanRepaymentSerializer(serializers.ModelSerializer):
    sacco = serializers.SerializerMethodField()

    class Meta:
        model = LoanRepayment
        fields = "__all__"
        read_only_fields = ["recorded_by"]

    def get_sacco(self, obj):
        return obj.loan.sacco_id

    def validate_amount_paid(self, value):
        if value <= 0:
            raise serializers.ValidationError("Repayment amount must be positive.")
        return value


class GuarantorRelationshipSerializer(serializers.ModelSerializer):
    sacco = serializers.SerializerMethodField()
    guarantor_member_name = serializers.CharField(source="guarantor.user.name", read_only=True)

    class Meta:
        model = GuarantorRelationship
        fields = "__all__"

    def get_sacco(self, obj):
        return obj.loan.sacco_id


class RiskFactorSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiskFactorSnapshot
        fields = "__all__"


class RiskScoreSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source="member.user.name", read_only=True)
    factors = RiskFactorSnapshotSerializer(read_only=True)

    class Meta:
        model = RiskScore
        fields = "__all__"


class SaccoJoinRequestSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.name", read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)
    sacco_name = serializers.CharField(source="sacco.name", read_only=True)

    class Meta:
        model = SaccoJoinRequest
        fields = "__all__"


class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = "__all__"


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "name", "role", "sacco", "membership_number", "phone_number"]

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
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


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ("username", "email", "name", "role", "sacco", "is_staff", "is_active")
    list_filter = ("role", "sacco", "is_staff", "is_superuser", "is_active")
    search_fields = ("username", "email", "name", "membership_number", "phone_number")

    fieldsets = UserAdmin.fieldsets + (
        ("SecureChama Info", {
            "fields": ("name", "membership_number", "phone_number", "sacco", "role")
        }),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ("SecureChama Info", {
            "fields": ("name", "membership_number", "phone_number", "sacco", "role")
        }),
    )


@admin.register(Sacco)
class SaccoAdmin(admin.ModelAdmin):
    list_display = ("name", "registration_number", "subscription_plan", "is_active", "created_at")
    list_filter = ("subscription_plan", "is_active")
    search_fields = ("name", "registration_number", "contact_email")


@admin.register(SaccoJoinRequest)
class SaccoJoinRequestAdmin(admin.ModelAdmin):
    list_display = ("user", "sacco", "status", "reviewed_by", "created_at")
    list_filter = ("status", "sacco")
    search_fields = ("user__username", "user__email", "sacco__name")


@admin.register(MemberProfile)
class MemberProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "sacco", "risk_band", "status", "join_date")
    list_filter = ("risk_band", "status", "sacco")
    search_fields = ("user__username", "user__membership_number", "user__email")


@admin.register(SavingsAccount)
class SavingsAccountAdmin(admin.ModelAdmin):
    list_display = ("account_number", "member", "sacco", "current_balance", "created_at")
    list_filter = ("sacco",)
    search_fields = ("account_number", "member__user__username", "member__user__membership_number")


@admin.register(SavingsTransaction)
class SavingsTransactionAdmin(admin.ModelAdmin):
    list_display = ("savings_account", "transaction_type", "amount", "reference", "created_at")
    list_filter = ("transaction_type", "created_at")
    search_fields = ("savings_account__account_number", "reference")


@admin.register(Loan)
class LoanAdmin(admin.ModelAdmin):
    list_display = ("id", "member", "sacco", "principal_amount", "interest_rate", "status", "created_at")
    list_filter = ("status", "sacco")
    search_fields = ("member__user__username", "member__user__membership_number")


@admin.register(LoanRepayment)
class LoanRepaymentAdmin(admin.ModelAdmin):
    list_display = ("loan", "amount_paid", "payment_date", "recorded_by", "created_at")
    list_filter = ("payment_date",)
    search_fields = ("loan__member__user__username",)


@admin.register(GuarantorRelationship)
class GuarantorRelationshipAdmin(admin.ModelAdmin):
    list_display = ("loan", "guarantor", "guaranteed_amount", "created_at")
    list_filter = ("created_at",)
    search_fields = ("guarantor__user__username", "loan__member__user__username")


@admin.register(RiskScore)
class RiskScoreAdmin(admin.ModelAdmin):
    list_display = ("member", "sacco", "score_value", "risk_band", "model_version", "calculated_at")
    list_filter = ("risk_band", "model_version", "sacco")
    search_fields = ("member__user__username",)


@admin.register(RiskFactorSnapshot)
class RiskFactorSnapshotAdmin(admin.ModelAdmin):
    list_display = (
        "risk_score",
        "savings_consistency_score",
        "repayment_behavior_score",
        "guarantor_exposure_score",
        "debt_to_income_ratio",
    )


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("user", "sacco", "action", "object_type", "object_id", "ip_address", "timestamp")
    list_filter = ("sacco", "object_type", "timestamp")
    search_fields = ("user__username", "action", "object_type", "object_id")
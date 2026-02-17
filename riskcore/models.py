from django.db import models
from django.contrib.auth.models import AbstractUser


# =====================================================
# PLATFORM DOMAIN
# =====================================================

class Sacco(models.Model):
    name = models.CharField(max_length=255)
    registration_number = models.CharField(max_length=100, unique=True)
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=20)
    address = models.TextField(blank=True)

    subscription_plan = models.CharField(max_length=100, default="basic")
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


# =====================================================
# IDENTITY DOMAIN
# =====================================================

class User(AbstractUser):

    sacco = models.ForeignKey(
        Sacco,
        on_delete=models.CASCADE,
        related_name="users",
        null=True,
        blank=True
    )

    name = models.CharField(max_length=255)
    membership_number = models.CharField(max_length=50)
    phone_number = models.CharField(max_length=20)

    ROLE_CHOICES = (
        ('platform_admin', 'Platform Admin'),
        ('sacco_admin', 'SACCO Admin'),
        ('loan_officer', 'Loan Officer'),
        ('member', 'Member'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')

    REQUIRED_FIELDS = ['email', 'name', 'membership_number', 'phone_number']

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['sacco', 'membership_number'],
                name='unique_membership_per_sacco'
            )
        ]

    def __str__(self):
        return f"{self.username} ({self.role})"


class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    sacco = models.ForeignKey(Sacco, on_delete=models.CASCADE)

    action = models.CharField(max_length=255)
    object_type = models.CharField(max_length=100)
    object_id = models.CharField(max_length=100)

    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.action} by {self.user}"


# =====================================================
# MEMBER FINANCIAL PROFILE
# =====================================================

class MemberProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="member_profile")
    sacco = models.ForeignKey(Sacco, on_delete=models.CASCADE, related_name="members")

    employment_type = models.CharField(max_length=100, blank=True)
    monthly_income = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    join_date = models.DateField()
    credit_limit = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    RISK_BAND_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    )

    risk_band = models.CharField(max_length=20, choices=RISK_BAND_CHOICES, default='medium')

    STATUS_CHOICES = (
        ('active', 'Active'),
        ('suspended', 'Suspended'),
        ('blacklisted', 'Blacklisted'),
    )

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')

    created_at = models.DateTimeField(auto_now_add=True)
    
    def total_guaranteed_exposure(self):
        from django.db.models import Sum
        from .models import GuarantorRelationship

        total = GuarantorRelationship.objects.filter(
        guarantor=self
         ).aggregate(total=Sum("guaranteed_amount"))["total"]

        return total or 0
    

    def __str__(self):
        return f"Profile: {self.user.username}"


# =====================================================
# SAVINGS DOMAIN
# =====================================================

class SavingsAccount(models.Model):
    member = models.ForeignKey(MemberProfile, on_delete=models.CASCADE, related_name="savings_accounts")
    sacco = models.ForeignKey(Sacco, on_delete=models.CASCADE)

    account_number = models.CharField(max_length=100)
    current_balance = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['sacco', 'account_number'],
                name='unique_account_per_sacco'
            )
        ]

    def __str__(self):
        return self.account_number


class SavingsTransaction(models.Model):

    TRANSACTION_TYPES = (
        ('deposit', 'Deposit'),
        ('withdrawal', 'Withdrawal'),
    )

    savings_account = models.ForeignKey(
        SavingsAccount,
        on_delete=models.CASCADE,
        related_name="transactions"
    )

    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    reference = models.CharField(max_length=255, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.transaction_type} - {self.amount}"


# =====================================================
# CREDIT DOMAIN
# =====================================================

class Loan(models.Model):

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('defaulted', 'Defaulted'),
    )

    member = models.ForeignKey(MemberProfile, on_delete=models.CASCADE, related_name="loans")
    sacco = models.ForeignKey(Sacco, on_delete=models.CASCADE)

    principal_amount = models.DecimalField(max_digits=14, decimal_places=2)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2)
    term_months = models.IntegerField()

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    disbursed_at = models.DateTimeField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    
    def approve(self, approved_by):
        if self.status != "pending":
            raise ValueError("Only pending loans can be approved.")

        self.status = "approved"
        self.save()

    def __str__(self):
        return f"Loan {self.id} - {self.member.user.username}"


class LoanRepayment(models.Model):
    loan = models.ForeignKey(Loan, on_delete=models.CASCADE, related_name="repayments")

    amount_paid = models.DecimalField(max_digits=14, decimal_places=2)
    payment_date = models.DateField()

    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Repayment {self.amount_paid}"


class GuarantorRelationship(models.Model):
    loan = models.ForeignKey(Loan, on_delete=models.CASCADE, related_name="guarantors")
    guarantor = models.ForeignKey(MemberProfile, on_delete=models.CASCADE)

    guaranteed_amount = models.DecimalField(max_digits=14, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.guarantor.user.username} guarantees {self.loan.id}"


# =====================================================
# RISK INTELLIGENCE DOMAIN
# =====================================================

class RiskScore(models.Model):
    member = models.ForeignKey(MemberProfile, on_delete=models.CASCADE, related_name="risk_scores")
    sacco = models.ForeignKey(Sacco, on_delete=models.CASCADE)

    score_value = models.IntegerField()
    risk_band = models.CharField(max_length=20)

    model_version = models.CharField(max_length=50)
    calculated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.member.user.username} - {self.score_value}"


class RiskFactorSnapshot(models.Model):
    risk_score = models.OneToOneField(RiskScore, on_delete=models.CASCADE, related_name="factors")

    savings_consistency_score = models.DecimalField(max_digits=5, decimal_places=2)
    repayment_behavior_score = models.DecimalField(max_digits=5, decimal_places=2)
    guarantor_exposure_score = models.DecimalField(max_digits=5, decimal_places=2)
    debt_to_income_ratio = models.DecimalField(max_digits=5, decimal_places=2)

    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Factors for {self.risk_score.member.user.username}"

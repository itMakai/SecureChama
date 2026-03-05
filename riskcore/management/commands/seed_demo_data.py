import csv
from decimal import Decimal
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.dateparse import parse_date

from riskcore.models import (
    GuarantorRelationship,
    Loan,
    LoanRepayment,
    MemberProfile,
    RiskFactorSnapshot,
    RiskScore,
    Sacco,
    SavingsAccount,
    SavingsTransaction,
    User,
)
from riskcore.services.risk_engine import RiskEngine


class Command(BaseCommand):
    help = "Seed SACCO demo data from CSV files in data/demo."

    def add_arguments(self, parser):
        parser.add_argument(
            "--csv-dir",
            default=str(Path(settings.BASE_DIR) / "data" / "demo"),
            help="Directory containing demo CSV files.",
        )
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete existing riskcore transactional demo records before seeding.",
        )

    def read_csv(self, csv_path):
        with open(csv_path, "r", encoding="utf-8") as f:
            return list(csv.DictReader(f))

    def bool_value(self, raw):
        return str(raw).strip().lower() in {"1", "true", "yes", "y"}

    @transaction.atomic
    def handle(self, *args, **options):
        csv_dir = Path(options["csv_dir"])
        if not csv_dir.exists():
            raise FileNotFoundError(f"CSV directory not found: {csv_dir}")

        if not options["reset"] and (
            Sacco.objects.exists() or User.objects.exclude(is_superuser=True).exists() or MemberProfile.objects.exists()
        ):
            self.stdout.write(
                self.style.WARNING(
                    "Existing data detected. Re-run with --reset to avoid duplicate transactional records."
                )
            )
            return

        if options["reset"]:
            self.stdout.write("Resetting existing demo records...")
            GuarantorRelationship.objects.all().delete()
            LoanRepayment.objects.all().delete()
            SavingsTransaction.objects.all().delete()
            Loan.objects.all().delete()
            SavingsAccount.objects.all().delete()
            RiskFactorSnapshot.objects.all().delete()
            RiskScore.objects.all().delete()
            MemberProfile.objects.all().delete()
            User.objects.filter(is_superuser=False).delete()
            Sacco.objects.all().delete()

        sacco_map = {}
        member_map = {}
        account_map = {}
        loan_map = {}
        user_map = {}

        self.stdout.write("Loading SACCOs...")
        for row in self.read_csv(csv_dir / "saccos.csv"):
            sacco, _ = Sacco.objects.update_or_create(
                registration_number=row["registration_number"],
                defaults={
                    "name": row["name"],
                    "contact_email": row["contact_email"],
                    "contact_phone": row["contact_phone"],
                    "address": row["address"],
                    "description": row["description"],
                    "benefits": row["benefits"],
                    "membership_requirements": row["membership_requirements"],
                    "terms_of_service": row["terms_of_service"],
                    "base_interest_rate": row["base_interest_rate"],
                    "subscription_plan": row["subscription_plan"],
                    "is_active": self.bool_value(row["is_active"]),
                },
            )
            sacco_map[sacco.registration_number] = sacco

        platform_admin, _ = User.objects.update_or_create(
            username="platform_admin_demo",
            defaults={
                "email": "platform-admin@securechama.demo",
                "name": "Platform Administrator",
                "phone_number": "+254700000000",
                "membership_number": "PLATFORM-ADMIN-001",
                "role": "platform_admin",
                "sacco": None,
                "is_staff": True,
            },
        )
        platform_admin.set_password("DemoPass123")
        platform_admin.save()
        user_map[platform_admin.username] = platform_admin

        self.stdout.write("Loading SACCO admins and loan officers...")
        for row in self.read_csv(csv_dir / "officers.csv"):
            sacco = sacco_map[row["sacco_registration_number"]]
            user, _ = User.objects.update_or_create(
                username=row["username"],
                defaults={
                    "email": row["email"],
                    "name": row["name"],
                    "phone_number": row["phone_number"],
                    "membership_number": row["membership_number"],
                    "role": row["role"],
                    "sacco": sacco,
                },
            )
            user.set_password(row["password"])
            user.save()
            user_map[user.username] = user

        self.stdout.write("Loading members and profiles...")
        for row in self.read_csv(csv_dir / "members.csv"):
            sacco = sacco_map[row["sacco_registration_number"]]
            user, _ = User.objects.update_or_create(
                username=row["username"],
                defaults={
                    "email": row["email"],
                    "name": row["name"],
                    "phone_number": row["phone_number"],
                    "membership_number": row["membership_number"],
                    "role": "member",
                    "sacco": sacco,
                },
            )
            user.set_password(row["password"])
            user.save()

            profile, _ = MemberProfile.objects.update_or_create(
                user=user,
                defaults={
                    "sacco": sacco,
                    "employment_type": row["employment_type"],
                    "monthly_income": Decimal(row["monthly_income"]) if row["monthly_income"] else None,
                    "join_date": parse_date(row["join_date"]),
                    "status": row["status"],
                },
            )
            member_map[user.username] = profile
            user_map[user.username] = user

        self.stdout.write("Loading savings accounts...")
        for row in self.read_csv(csv_dir / "savings_accounts.csv"):
            member = member_map[row["username"]]
            sacco = sacco_map[row["sacco_registration_number"]]
            account, _ = SavingsAccount.objects.get_or_create(
                account_number=row["account_number"],
                sacco=sacco,
                defaults={"member": member, "current_balance": 0},
            )
            if account.member_id != member.id:
                account.member = member
                account.save(update_fields=["member"])
            account_map[account.account_number] = account

        self.stdout.write("Loading savings transactions...")
        for row in self.read_csv(csv_dir / "savings_transactions.csv"):
            account = account_map[row["account_number"]]
            created_by = user_map.get(row["created_by_username"])
            SavingsTransaction.objects.create(
                savings_account=account,
                transaction_type=row["transaction_type"],
                amount=Decimal(row["amount"]),
                reference=row["reference"],
                created_by=created_by,
            )

        self.stdout.write("Loading loans...")
        for row in self.read_csv(csv_dir / "loans.csv"):
            member = member_map[row["username"]]
            approved_by = user_map.get(row["approved_by_username"]) if row["approved_by_username"] else None
            loan = Loan.objects.create(
                member=member,
                sacco=sacco_map[row["sacco_registration_number"]],
                principal_amount=Decimal(row["principal_amount"]),
                interest_rate=Decimal(row["interest_rate"]),
                term_months=int(row["term_months"]),
                status=row["status"],
                purpose=row["purpose"],
                repayment_frequency=row["repayment_frequency"],
                approved_by=approved_by,
                due_date=parse_date(row["due_date"]),
            )
            loan_map[row["loan_ref"]] = loan

        self.stdout.write("Loading guarantor network...")
        for row in self.read_csv(csv_dir / "guarantor_relationships.csv"):
            loan = loan_map[row["loan_ref"]]
            guarantor = member_map[row["guarantor_username"]]
            GuarantorRelationship.objects.get_or_create(
                loan=loan,
                guarantor=guarantor,
                defaults={"guaranteed_amount": Decimal(row["guaranteed_amount"])},
            )

        self.stdout.write("Loading loan repayments...")
        for row in self.read_csv(csv_dir / "loan_repayments.csv"):
            LoanRepayment.objects.create(
                loan=loan_map[row["loan_ref"]],
                amount_paid=Decimal(row["amount_paid"]),
                payment_date=parse_date(row["payment_date"]),
                recorded_by=user_map.get(row["recorded_by_username"]),
            )

        self.stdout.write("Computing risk snapshots...")
        RiskFactorSnapshot.objects.all().delete()
        RiskScore.objects.all().delete()
        for member in MemberProfile.objects.select_related("sacco"):
            latest = RiskEngine.calculate(member)
            member.risk_band = latest.risk_band
            member.save(update_fields=["risk_band"])

        total_members = MemberProfile.objects.count()
        total_loans = Loan.objects.count()
        total_exposure = sum(float(member.total_guaranteed_exposure()) for member in MemberProfile.objects.all())
        total_saccos = Sacco.objects.count()

        self.stdout.write(self.style.SUCCESS("Demo seed completed."))
        self.stdout.write(
            f"Summary: saccos={total_saccos}, members={total_members}, loans={total_loans}, guarantor_exposure={total_exposure:.2f}"
        )

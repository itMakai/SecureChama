SecureChama addresses this “collateral mismatch” by introducing an AI-powered Digital Guarantor
Score that replaces risky physical guarantors with a privacy-safe analysis of behavioural trust.
Rather than relying on cumbersome government integrations, the solution utilizes a consented on
device SMS parser to securely scan existing transaction histories, instantly verifying reliability based
on utility bills, school fees, and savings patterns. To ensure safety and regulatory compliance, the
system operates as a “Loan Officer Copilot” rather than a fully autonomous lender; it provides risk
reports and recommended decisions, allowing high scorers (80–100) to access instant loans up to KSh
250,000 while reducing guarantor requirements for others. Crucially, every decision is delivered with
a clear explanation in  English, ensuring that the AI remains transparent and accessible
to every member.

## Demo CSV Data + Seed Script

This repository now includes CSV-backed demo datasets under `data/demo/`:

- `saccos.csv`
- `officers.csv`
- `members.csv`
- `savings_accounts.csv`
- `savings_transactions.csv`
- `loans.csv`
- `guarantor_relationships.csv`
- `loan_repayments.csv`

Seed all SACCO demo data (including computed risk snapshots) with:

```bash
.\env\Scripts\python.exe manage.py migrate
.\env\Scripts\python.exe manage.py seed_demo_data --reset
```

Demo login accounts:

- Platform admin: `platform_admin_demo` / `DemoPass123`
- SACCO admins: `admin_sc_001`, `admin_sc_002`, `admin_sc_003` / `DemoPass123`
- Loan officers: `officer_sc_001`, `officer_sc_002`, `officer_sc_003` / `DemoPass123`
- Members: see `data/demo/members.csv` (all use `DemoPass123`)

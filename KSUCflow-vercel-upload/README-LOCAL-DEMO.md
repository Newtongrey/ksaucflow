# KSUCflow Local Demo Mode

This branch switches the demo away from Supabase. It is intended for demonstrations only and is not production authentication.

## Demo accounts
- Administrator: `admin@ksuc.ac.ke` / `DemoAdmin123!`
- Staff: `finance.demo@ksuc.ac.ke` / `DemoStaff123!`
- Staff: `registry.demo@ksuc.ac.ke` / `DemoStaff123!`
- Department Head: `ict.demo@ksuc.ac.ke` / `DemoStaff123!`

## Staff onboarding
1. Sign in through **Admin Portal**.
2. Create a profile with the individual form, or use **Download CSV template** and upload a CSV for bulk import.
3. The CSV requires `full_name,email,department,role`. Optional fields are `staff_number,job_title,demo_password`.
4. Duplicate emails and invalid rows are skipped and reported.
5. Search, edit, deactivate/reactivate profiles, and export the directory from the admin portal.

## Important limitations
- Profiles and demo passwords are stored in the current browser's localStorage. They do not sync to another computer or browser.
- Do not enter real staff passwords, personal information, or confidential institutional documents.
- Browser localStorage is not secure account storage. Do not use this mode for real staff or production workflows.
- Production `main` is unchanged; these changes are isolated to the `local-demo-mode` branch.
- Before institutional hosting, replace demo authentication/storage with server-side authentication and a shared database approved by the institution.

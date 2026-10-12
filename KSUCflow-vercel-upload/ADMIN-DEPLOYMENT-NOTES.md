# KSUCflow admin deployment notes

## Included in this feature branch

- KSUCflow maroon staff-login styling.
- Admin report selector with date filters and CSV export.
- User invitation, department/role updates, and account deactivation controls.
- A server-side Vercel function at `/api/admin-users`; privileged keys are not shipped to the browser.

## Required Vercel environment variables

Open **Vercel → ksaucflow → Settings → Environment Variables** and add the following for the **Preview** environment first:

- `SUPABASE_URL`: the KSUCflow Supabase project URL.
- `SUPABASE_ANON_KEY`: the public/anon key for that project.
- `SUPABASE_SERVICE_ROLE_KEY`: the Supabase service-role secret key.

Use the correct Vercel secret/environment variable field for the service-role key. Never put it in `supabase-config.js`, HTML, JavaScript committed to GitHub, or a client-side environment variable. Do not paste it into chat. After saving the variables, redeploy the feature preview.

The existing browser configuration uses a publishable key. The API uses the server-only service-role key only after validating the caller's bearer token and checking that the caller's database profile has the Administrator role.

## Database expectations

The API expects these existing Supabase tables and columns:

- `profiles`: `id` (same UUID as the Supabase Auth user), `full_name`, `department_id`, `role`.
- `departments`: `id`, `name`.

Account invitation upserts the profile after Supabase Auth creates the invited user. If your profile table uses different column names, adjust the API before enabling the feature. Test with a non-production account first. The API blocks self-demotion and prevents demoting or deactivating the last Administrator.

## Reports: current scope and limitation

- **User profile directory** reads profile data from Supabase.
- **Document register** and **activity log** currently read this browser's local storage. The page explicitly labels these as browser-local snapshots.
- Those document and activity reports are not yet institution-wide. Do not treat them as a complete official register until the document workflow is migrated to shared Supabase tables and the staff portal is updated to read/write those tables.

## Safe rollout

1. Deploy this feature branch as a Vercel Preview.
2. Set the three server-side environment variables for Preview and redeploy.
3. Sign in with an administrator account and test an invitation using a test email.
4. Verify that the new Auth user and profile are created, then test a role/department update and account deactivation with a test account.
5. Test report date filters and open the CSV in a spreadsheet.
6. Only promote to Production after all tests pass.

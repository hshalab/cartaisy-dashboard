# Dashboard Release Checklist

## Current state:

- Dashboard release readiness was not previously documented in a repo-level checklist.
- Verified commands include `npm run build`, `npm run dev`, `npm run start`, `npm run test:api`, and `npm run generate:api`.
- No CI workflow or environment example file was found during the audit.
- The dashboard currently includes settings, Shopify connection, store branding/logo upload, app-builder modules, homescreen preview, and admin onboarding token pages.

## Target state:

Before release, verify:

- Pre-release checks: dependencies installed, build passes, relevant manual dashboard flows checked, and no unrelated files are included.
- Environment variables: backend API URL, auth/session URLs, MongoDB connection, Shopify API credentials, email provider credentials, and any analytics settings are configured in deployment without exposing secret values in frontend code.
- Auth/session: login, token cookie handling, backend profile verification, protected dashboard redirects, and signout behavior.
- Store context: every dashboard route uses the authenticated store context and respects role permissions.
- Backend API compatibility: generated/direct backend calls match deployed backend endpoints and response shapes.
- Shopify: connect, callback, status, collections, disconnect, and backend-mediated tenant-safe operations where applicable.
- Merchant onboarding: token creation, token expiry/revocation, email delivery if enabled, signup token validation, store creation, first-user role, and post-signup login.
- Branding/theme configuration: logo upload/remove, current branding fetch, and any mobile-consumed theme fields.
- Home module publishing/editor checks: module create/edit/reorder/visibility, collection reference selection, homescreen preview, backend/mobile contract compatibility, and validation of store-owned Shopify references.
- Build/status workflow: preview/build/release handoff if implemented in future; currently verify homescreen preview only.
- Rollback notes: identify the deployed version, environment variables changed, database migrations/manual scripts, and any generated API client changes before release.

## Known gaps:

- Do not assume any feature or behavior described above is implemented unless verified in the current code.
- Dedicated build request, app-store submission, release status, and rollback automation were not found in the audited files.
- No CI workflow was found.
- No env example file was found; deployments must be checked without exposing secrets.
- Current Shopify and branding flows include direct dashboard/backend API calls that need security review before major release changes.

## Related docs/issues:

- Testing: `docs/TESTING.md`.
- Status: `docs/STATUS.md`.
- Architecture: `docs/ARCHITECTURE.md`.
- Onboarding: `docs/DASHBOARD_ONBOARDING_FLOW.md`.
- Home modules: `docs/HOME_MODULE_EDITOR_CONTRACT.md`.
- Shared context: backend repo `docs/cartaisy/README.md`.
- GitHub issue: `#2`.

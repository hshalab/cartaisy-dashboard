# Dashboard Onboarding Flow

## Current state:

- Dashboard signup is invitation-only.
- Master-admin access to onboarding token management is implemented in `app/dashboard/admin/onboarding/page.tsx` using a hard-coded master admin email list.
- Onboarding tokens are stored in `models/OnboardingToken.ts` with `pending`, `used`, `expired`, and `revoked` statuses.
- `app/api/admin/onboarding-tokens/route.ts` can list, create, expire, and revoke onboarding tokens for master admins.
- `app/api/admin/send-onboarding-email/route.ts` can send onboarding emails through `sendOnboardingEmail`.
- `/signup?token=...` validates token status through `app/api/auth/validate-token/route.ts`, pre-fills email/store name when available, then submits to `app/api/auth/signup/route.ts`.
- Signup creates a `Store`, creates the first `User` as `super_admin`, marks the token as used, and redirects the user toward login/dashboard.
- Store setup currently continues through dashboard settings: Shopify connection, store info/settings, logo upload, sync status, plan/usage, and app-builder pages.

## Target state:

- MVP onboarding should guide merchants through:
  1. Receive invite/onboarding link.
  2. Validate link and create owner account.
  3. Create or confirm store identity.
  4. Connect Shopify.
  5. Confirm store setup/status readiness.
  6. Configure branding/theme fields required by mobile.
  7. Configure home modules and Shopify collection/product references.
  8. Preview the mobile home screen.
  9. Enter build/release handoff when that workflow exists.
- Required merchant information should include owner email, store name, Shopify shop domain, branding assets, currency/timezone from Shopify, and module content/references.
- Admin visibility should show whether a merchant is ready for MVP release, not just whether they can log in.

## Known gaps:

- Do not assume this exists unless verified in code.
- A single guided setup checklist or canonical readiness model was not found.
- Token master-admin authorization is implemented with hard-coded email lists in audited files; operational ownership should be reviewed before expansion.
- Shopify connection exists, but backend-mediated tenant-safe Shopify operation is a target guardrail that needs verification against current code.
- Branding/theme setup beyond logo, timezone, and currency was not verified.
- Product picker was not identified.
- Preview exists; build/release handoff was not identified.
- Email delivery depends on provider configuration; no env example was found.

## Related docs/issues:

- Dashboard entrypoint: `CARTAISY_CONTEXT.md`.
- Architecture: `docs/ARCHITECTURE.md`.
- Status: `docs/STATUS.md`.
- Release checklist: `docs/RELEASE_CHECKLIST.md`.
- Shared context: backend repo `docs/cartaisy/README.md`.
- GitHub issue: `#2`.

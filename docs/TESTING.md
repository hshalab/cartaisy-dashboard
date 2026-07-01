# Dashboard Testing

## Current state:

- Package manager: npm, verified by `package-lock.json`.
- Common commands from `package.json`:
  - `npm run dev`: starts Next dev server on port 3002.
  - `npm run build`: runs `next build`.
  - `npm run start`: runs `next start`.
  - `npm run test:api`: runs `ts-node scripts/test-api.ts`.
  - `npm run generate:api`: runs `orval`.
- Lint command: not present in `package.json`.
- Typecheck command: not present in `package.json`; TypeScript is configured in `tsconfig.json`, but no standalone typecheck script was found.
- Test command: no general `test` script was found. `test:api` exists and expects a development server at `http://localhost:3000` according to `scripts/test-api.ts`, while `npm run dev` uses port 3002.
- Build command: `npm run build`.
- CI behavior: no `.github` workflows or other CI config were found during the audit.

## Target state:

- Every dashboard PR should run the smallest relevant validation commands and document what was run.
- High-risk dashboard changes should include explicit validation for auth/session behavior, store scoping, Shopify access, module reference validation, and mobile-preview compatibility.
- Package scripts should eventually expose consistent lint, typecheck, test, and build commands.
- API test scripts should align with the actual dev server port or accept a configurable base URL.

## Known gaps:

- Do not assume any feature or behavior described above is implemented unless verified in the current code.
- No repo-level lint/typecheck/unit/e2e command was found.
- No CI workflow was found.
- `test:api` may require manual setup and currently references port 3000, while the dev script starts on port 3002. Future work should either update `scripts/test-api.ts` to default to `http://localhost:3002`, make it read a `BASE_URL` environment variable, or document running it with `BASE_URL=http://localhost:3002`.
- Docs-only PRs do not need runtime validation unless they modify executable files.

## Required validation before PR:

- For docs-only changes: inspect `git diff --stat` and `git diff --name-only` to confirm only docs/context files changed.
- For behavior changes: run `npm run build` at minimum, plus any relevant manual checks for affected routes.
- For auth/store/Shopify/module publishing changes: verify tenant/store scoping manually and request human review.
- For generated API changes: verify `npm run generate:api` output and backend API compatibility.

## Related docs/issues:

- Dashboard status: `docs/STATUS.md`.
- Release checklist: `docs/RELEASE_CHECKLIST.md`.
- GitHub issue: `#2`.

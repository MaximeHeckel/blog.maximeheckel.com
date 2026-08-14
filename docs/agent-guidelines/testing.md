# Testing Conventions

## When to add tests

Add or update tests when behavior changes, a bug is fixed, or existing coverage can reasonably exercise a regression. Content-only changes and purely mechanical refactors generally do not need new tests. Do not prompt the operator before adding clearly useful coverage. If meaningful automation is impractical, explain the limitation in the final report.

## Unit and component tests

- Use Vitest and Testing Library.
- Place component tests in an adjacent `__tests__/` directory and name them `*.spec.tsx`; use `*.spec.ts` for non-React modules.
- Test user-visible behavior rather than implementation details.
- Prefer accessible queries such as `getByRole`, `getByLabelText`, and `getByText`. Use `getByTestId` only when semantic queries are impractical.
- Use `waitFor` only for behavior that is actually asynchronous.
- Import through the public/barrel export when testing the public component contract.

## End-to-end tests

Cypress tests live in `cypress/e2e/` and cover cross-page behavior such as navigation, search, and metadata. Run the relevant spec for a focused change; use the full browser suite when the risk warrants it.

## Commands

```bash
pnpm test:watch
pnpm test:run
pnpm cy:open
pnpm cy:run
```

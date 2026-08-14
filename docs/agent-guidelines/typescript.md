# TypeScript and Code Conventions

- Strict mode is enabled. Prefer precise types and avoid `any` unless an external boundary makes it unavoidable.
- Prefix intentionally unused variables with `_`.
- Do not add `console.log`; handle errors appropriately or remove debugging output.
- Follow the import grouping used nearby: external packages, design-system and headless-UI packages, project aliases, then relative imports.
- Define explicit prop interfaces for public React components. Keep local implementation types close to their usage.
- Use `useId()` rather than unstable or random generated IDs in React components.
- Follow the enforced Oxc lint and Oxfmt output rather than manually maintaining a conflicting style.

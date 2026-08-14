# Design Tokens and Styling

These rules apply to UI and style files. They do not require utility modules, scripts, configuration, or tests to adopt component styling patterns.

- Use `styled()` from `@maximeheckel/design-system` where it matches the surrounding component.
- Prefer existing CSS custom properties for colors, spacing, typography, radii, and other design values, such as `var(--space-4)`, `var(--text-primary)`, and `var(--border-radius-1)`.
- Avoid introducing arbitrary colors or spacing when a semantic or scale token already represents the intended value.
- Use `oklch()` and relative color syntax when manipulating token colors or transparency.
- Separate substantial or shared styles into `ComponentName.styles.tsx`; small, self-contained components may remain in one file when that is clearer.
- Follow established nearby patterns before introducing a new token or visual convention.

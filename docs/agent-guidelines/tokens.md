# Design Tokens and Styling

These rules apply to UI and style files. They do not require utility modules, scripts, configuration, or tests to adopt component styling patterns.

- Use `styled()` from `styled-system/jsx` for styled elements and their variants. Keep their styles in the existing `.styles.tsx` files.
- Use the `css` prop for static overrides. Put values computed at runtime in inline styles or pass them to extracted styles through CSS custom properties.
- Prefer existing CSS custom properties for colors, spacing, typography, radii, and other design values, such as `var(--space-4)`, `var(--text-primary)`, and `var(--border-radius-1)`.
- Avoid introducing arbitrary colors or spacing when a semantic or scale token already represents the intended value.
- Use `oklch()` and relative color syntax when manipulating token colors or transparency.
- Separate substantial or shared styles into `ComponentName.styles.tsx`; small, self-contained components may remain in one file when that is clearer.
- Follow established nearby patterns before introducing a new token or visual convention.

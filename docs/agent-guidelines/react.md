# React Component Conventions

These rules apply to React components and MDX widgets, not to every TypeScript file.

## Component structure

Use a single `.tsx` file for small, self-contained components. For non-trivial reusable components, prefer a directory containing the component, an `index.tsx` barrel export, and a separate `ComponentName.styles.tsx` when styles are substantial. Add `types.ts` only when shared or complex types benefit from separation. Follow the surrounding code when extending an existing feature.

Define explicit prop interfaces for public components. Use `useId()` when a component must generate an accessible element ID.

## MDX widgets

Interactive article components live in `core/components/MDX/Widgets/`. Keep widget-specific React components, GLSL shaders, and Sandpack snippets together. Register a new widget in `core/components/MDX/MDXComponents.tsx`, normally with a dynamic import, before using it in MDX.

Consider server-side rendering constraints, reduced motion, accessibility, and a usable fallback for WebGL experiences.

## Animation

Use `motion/react` and respect reduced-motion preferences. Prefer transitions that clarify state changes over decorative animation.

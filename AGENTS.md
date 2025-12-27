# Agent Guidelines

> This document provides context for AI coding assistants working on this codebase.

## Project Overview

A personal blog built with Next.js featuring interactive articles about web development, shaders, and 3D graphics. The blog emphasizes rich interactive experiences through custom MDX widgets, WebGL visualizations, and code playgrounds.

**Live site:** https://blog.maximeheckel.com

## Tech Stack

| Category        | Technology                                                      |
| --------------- | --------------------------------------------------------------- |
| Framework       | Next.js 15 (Pages Router)                                       |
| UI              | React 19, @maximeheckel/design-system                           |
| Headless UI     | @base-ui/react (Select, Dialog, etc.)                           |
| Styling         | Stitches (via design-system), CSS custom properties             |
| Animation       | Motion library (framer-motion successor)                        |
| 3D/WebGL        | Three.js, @react-three/fiber, @react-three/drei, postprocessing |
| Content         | MDX with next-mdx-remote                                        |
| Testing         | Vitest + Testing Library, Cypress for E2E                       |
| Package Manager | pnpm                                                            |

## Directory Structure

```
├── core/
│   ├── components/     # Reusable UI components
│   ├── features/       # Feature-specific components (BlogPost, IndexSection)
│   └── hooks/          # Custom React hooks
├── pages/              # Next.js pages (NOT app router)
├── content/            # MDX blog posts
├── lib/                # Utilities, config, rehype plugins
├── types/              # TypeScript type definitions
├── scripts/            # Build scripts (RSS, sitemap, OG images)
├── cypress/            # E2E tests
└── public/             # Static assets
```

## Detailed Rules

Context-specific coding guidelines are located in `.cursor/rules/`:

| Rule File        | Description                                        | Applied To             |
| ---------------- | -------------------------------------------------- | ---------------------- |
| `general.mdc`    | Links to this document (entry point)               | Always                 |
| `react.mdc`      | Component conventions, MDX widgets, animations     | `*.ts`, `*.tsx`        |
| `tokens.mdc`     | Design tokens, styling patterns, CSS variables     | `*.ts`, `*.tsx`        |
| `typescript.mdc` | TypeScript conventions, import order, ESLint rules | `*.ts`, `*.tsx`        |
| `testing.mdc`    | Vitest, Testing Library, Cypress patterns          | `*.spec.*`, `cypress/` |

## Scripts

| Command                 | Purpose                  |
| ----------------------- | ------------------------ |
| `pnpm dev`              | Start development server |
| `pnpm build`            | Production build         |
| `pnpm lint`             | Run ESLint               |
| `pnpm type-check`       | TypeScript validation    |
| `pnpm format`           | Format with Prettier     |
| `pnpm generate:og`      | Generate OG images       |
| `pnpm generate:rss`     | Generate RSS feed        |
| `pnpm generate:sitemap` | Generate sitemap         |

## Important Notes

- **Pages Router**: This project uses Next.js Pages Router, NOT App Router
- **SSG**: Blog posts are statically generated at build time
- **Design System**: Most base components come from `@maximeheckel/design-system`
- **Headless UI**: Use `@base-ui/react` for accessible primitives (Select, Dialog, etc.)
- **No console.log**: Use proper error handling or remove debug statements
- `@maximeheckel/design-system` codebase can be found at https://github.com/maximeheckel/design-system. The repository is public.

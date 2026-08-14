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

Tool-neutral, context-specific coding guidelines are located in `docs/agent-guidelines/`. These Markdown files are the canonical source for every coding agent.

| Guide                                                  | Description                                      | Applies to                   |
| ------------------------------------------------------ | ------------------------------------------------ | ---------------------------- |
| [`react.md`](docs/agent-guidelines/react.md)           | Component conventions, MDX widgets, animations   | React components and widgets |
| [`tokens.md`](docs/agent-guidelines/tokens.md)         | Design tokens, styling patterns, CSS variables   | UI and style files           |
| [`typescript.md`](docs/agent-guidelines/typescript.md) | TypeScript conventions, import order, lint rules | TypeScript files             |
| [`testing.md`](docs/agent-guidelines/testing.md)       | Vitest, Testing Library, Cypress patterns        | Tests and behavior changes   |

Before editing, inspect the repository for more deeply nested `AGENTS.md` files; their instructions take precedence within their directory.

## Setup

- Use Node.js `24.19.x` and pnpm `11.9.x` (Corepack is recommended).
- Install dependencies with `pnpm install --frozen-lockfile`.
- The normal lint, type-check, unit-test, and build workflows must not require production credentials.

## Content Authoring

Follow [`docs/agent-guidelines/create-article.md`](docs/agent-guidelines/create-article.md) when creating a blog post with the correct filename and MDX frontmatter.

## Scripts

| Command                 | Purpose                     |
| ----------------------- | --------------------------- |
| `pnpm dev`              | Start development server    |
| `pnpm build`            | Production build            |
| `pnpm lint`             | Run ESLint                  |
| `pnpm type-check`       | TypeScript validation       |
| `pnpm check-format`     | Check formatting with Oxfmt |
| `pnpm format`           | Format with Oxfmt           |
| `pnpm generate:og`      | Generate OG images          |
| `pnpm generate:rss`     | Generate RSS feed           |
| `pnpm generate:sitemap` | Generate sitemap            |

## Important Notes

- **Pages Router**: This project uses Next.js Pages Router, NOT App Router
- **SSG**: Blog posts are statically generated at build time
- **Design System**: Most base components come from `@maximeheckel/design-system`
- **Headless UI**: Use `@base-ui/react` for accessible primitives (Select, Dialog, etc.)
- **No console.log**: Use proper error handling or remove debug statements
- `@maximeheckel/design-system` codebase can be found at https://github.com/maximeheckel/design-system. The repository is public.

## Definition of Done

- Keep changes scoped to the requested behavior and avoid unrelated generated or formatting diffs.
- Add or update tests when behavior changes or a bug is fixed and the behavior can be tested reasonably. Do not stop to ask whether obvious regression coverage is wanted.
- Run the most relevant targeted checks, plus formatting, linting, and type checking for code changes. Run a production build for routing, MDX, configuration, dependency, or build-pipeline changes.
- Capture a screenshot for perceptible UI changes.
- Never commit secrets, local environment files, caches, or build artifacts.
- Report the exact validation commands and their outcomes.

## Commits and Pull Requests

- Commit only the files belonging to the requested change, using a concise imperative commit subject.
- Include required generated outputs in the same commit as their source change; do not commit incidental output from local checks.
- Pull request titles should describe the user-visible or developer-facing outcome.
- Pull request bodies should contain `Summary` and `Testing` sections. List exact commands, disclose skipped or environment-limited checks, and include screenshots for visual changes.

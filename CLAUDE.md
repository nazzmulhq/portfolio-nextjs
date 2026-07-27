# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Static export build → outputs to ./out
npm run start    # Serve the production build
npm run lint     # next lint (ESLint flat config + Prettier)
```

There is no test suite. `npm install` requires `legacy-peer-deps=true` (set in `.npmrc`) because of React 19 peer-dependency conflicts.

## Architecture

Single-developer portfolio site. Next.js 16 (App Router) + React 19 + Tailwind CSS v4, statically exported.

- **`output: "export"` in [next.config.ts](next.config.ts)** — the whole site builds to static HTML in `./out` and is deployed to Netlify (`https://nazmulhaque.netlify.app`). Consequences: no server runtime at deploy time, no SSR/ISR, no API routes, no `next/image` optimization server. Every page must be statically renderable; pages set `export const dynamic = "force-static"`. `basePath` is read from `NEXT_PUBLIC_BASE_PATH` env at build time.
- **`src/proxy.ts`** is a no-op middleware-style file (not active Next.js middleware) kept for reference; static export does not run middleware.

### Routing & pages

- **`src/app/page.tsx`** — the home page. Composes the portfolio from section components in [src/components/home/](src/components/home/) (`Home`, `Skills`, `Experience`, `Education`, `Works`, plus `NavBar`/`NavBarMobile`). Renders inside a fixed "glass terminal" frame with an ambient animated background.
- **`src/app/(doc)/`** — route group for standalone project/doc pages: `/cv`, `/quickdb`, `/quick-cicd`. Each is its own SEO-optimized landing page.
- SEO is a primary concern: `layout.tsx` holds global metadata, and pages emit JSON-LD structured data (`Person`, `SoftwareApplication`) via inline `<script type="application/ld+json">`. `robots.ts`, `sitemap.ts`, and `manifest.ts` are all `force-static` route handlers. **When adding a new doc page, add its URL to [src/app/sitemap.ts](src/app/sitemap.ts).**

### Content is data-driven

- **[src/components/home/data.ts](src/components/home/data.ts)** is the single source of truth for portfolio content (bio, skills, experience, education, works). Edit this file to update site content rather than touching the section components.
- **[src/components/doc/index.jsx](src/components/doc/index.jsx)** is a generic renderer for doc pages: it maps over a `data` array and switches on `item.type` (`"basic"` | `"list"` | `"tabs"`) to render cards, code blocks (via `ReactCodeBlocks`), and embedded videos. Doc pages pass their content array to this component instead of hand-writing markup.

### Styling, theming & animation

- Tailwind v4 (PostCSS plugin, no `tailwind.config.js`). Everything lives in **[src/app/globals.css](src/app/globals.css)**.
- **Theming is token-based.** Semantic CSS variables (`--canvas`, `--surface`, `--fg`, `--muted`, `--line`, `--accent`, `--glow`, …) are defined for dark (`:root`) and light (`:root[data-theme="light"]` + a `prefers-color-scheme: light` block for the system default). They are exposed to Tailwind via `@theme inline` so utilities like `bg-surface`, `text-fg`, `text-muted`, `border-line`, `text-accent` re-resolve live on theme flip. **Use these tokens, not literal `slate-*`/`white`/`emerald-*` classes** — hardcoded colors break light mode and the single-accent (emerald/teal) consistency across all pages.
- Theme is chosen by system preference by default; a manual override is persisted to `localStorage` under `theme` and applied as `data-theme` on `<html>` by an inline no-FOUC script in [layout.tsx](src/app/layout.tsx). [ThemeToggle.tsx](src/components/ThemeToggle.tsx) flips it; doc pages mount it via [DocThemeToggle.tsx](src/components/DocThemeToggle.tsx).
- **Shared component utilities** keep markup lean and consistent: `.glass`, `.glass-card`, `.rail` (hover accent rail), `.eyebrow`, `.chip`, `.btn-accent`/`.btn-ghost`, `.sheen` (hover sweep), `.text-gradient`, `.aurora` + `.aurora-grid` (themed ambient background). Prefer these over re-deriving long class strings.
- **Animation is CSS scroll-driven** (`animation-timeline: view()/scroll()`) for performance — compositor-only, no JS. Reveal classes: `.reveal`, `.reveal-left/right`, `.reveal-scale`, `.reveal-blur`; a `[data-stagger]` parent staggers its children by a `--i` index var; `.scroll-progress` (top bar) and `.scrub-out`/`.parallax` use the scroll timeline. All gated behind `@supports` (visible fallback) and disabled under `prefers-reduced-motion`. Hover lifts on `.glass-card` use the `translate` longhand so they compose with `transform`-based reveals instead of being overridden.
- **GSAP & @gsap/react**: `gsap` and `@gsap/react` are installed for complex UI animations and scroll triggers. Official GSAP skills are configured in `.agents/skills/` and `.claude/skills/`.
- [src/components/ScrollAnimate.tsx](src/components/ScrollAnimate.tsx) is the legacy JS IntersectionObserver reveal wrapper — superseded by the CSS reveal classes; no longer used.

### Conventions

- Path aliases (see [tsconfig.json](tsconfig.json)): `@src/*`, `@components/*`, `@public/*`. Note some files import via relative paths (`../../../components/...`); both styles exist.
- Section/page components are React Server Components by default; only files needing hooks/interactivity (e.g. `ScrollAnimate`, `InfiniteCounter`, `doc/index.jsx`) carry `"use client"`.
- `src/components/PdfGenerator.tsx.disabled` is intentionally disabled (the `.disabled` extension keeps it out of the build); don't re-enable without reason.
- ESLint uses a flat config ([eslint.config.mjs](eslint.config.mjs)) extending Airbnb + Next + Prettier; formatting is enforced via `eslint-plugin-prettier` ([.prettierrc.js](.prettierrc.js)).
</content>
</invoke>

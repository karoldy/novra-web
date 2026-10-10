# AGENTS.md

Guidance for Claude Code and other coding agents working in this repository.

## Project Overview

- **App**: Novra Web
- **Stack**: React 19, TypeScript 6, Vite 8, Tailwind CSS 4, shadcn (Base UI, `base-nova` style)
- **Package manager**: pnpm 12.3.4 (pinned via `packageManager`, run through corepack)
- **Node**: ^20.19 || ≥22.12 (required by Vite 8)

## Common Commands

```bash
pnpm dev              # Start dev server → http://localhost:5173
pnpm lint             # ESLint
pnpm exec tsc -b      # TypeScript type-check
pnpm build            # Type-check + production build → dist/
pnpm preview          # Preview production build
pnpm exec prettier --check .   # Formatting check
pnpm storybook        # Storybook dev server → http://localhost:6006
pnpm build-storybook  # Static Storybook → storybook-static/
pnpm test             # Run component tests once (Vitest, headless Chromium)
pnpm test:watch       # Vitest watch mode
```

## Project Structure

```
src/
├── components/ui/    # shadcn components (generated, see below)
├── lib/utils.ts      # `cn`, configured with the custom typography sizes
├── tokens/           # design tokens (typography variant names)
├── i18n/             # i18next setup + resources/{sc,tc,en}.ts
├── index.css         # Tailwind entry + shadcn theme variables (light/dark)
├── App.tsx
└── main.tsx
public/               # Static assets served at /
components.json       # shadcn CLI config
```

### Path Alias

`@/` → `src/`, configured in `vite.config.ts`, `tsconfig.json` and `tsconfig.app.json`. Keep all three in sync. Do not add `baseUrl` (deprecated in TypeScript 6).

## UI: shadcn + Tailwind

- **Add components with the CLI**, don't hand-write them:
  ```bash
  pnpm dlx shadcn@latest add <component>
  ```
- Components are built on **Base UI** (`@base-ui/react`), not Radix. When reading shadcn docs or examples, use the Base UI variant — Radix APIs (`asChild`, `@radix-ui/*` imports) do not apply.
- Class merging uses `cn` from `@/lib/utils` (backed by the official `cn` package, which replaces `clsx` + `tailwind-merge`). Don't add `clsx` or `tailwind-merge`.
- **Always import `cn` from `@/lib/utils`, never from `'cn'`** — the local one registers the typography sizes; the bare package treats `text-body1` as a color and drops it next to `text-primary`. ESLint enforces this. The shadcn CLI generates `from 'cn'`: change it after `shadcn add`.
- Icons: `lucide-react`.
- Fonts: Noto Sans (Latin), Noto Sans TC, Noto Sans SC — self-hosted Fontsource variable fonts loaded by `unplugin-fonts` (`Unfonts` in `vite.config.ts`, `import 'unfonts.css'` in `src/main.tsx` and `.storybook/preview.tsx`). The `--font-sans` stack in `src/index.css` sets the fallback order. To add a font, install its `@fontsource(-variable)/*` package and list it in `Unfonts`; don't `@import` fonts in CSS. Font files are emitted to `assets/fonts/` and never inlined.
- Tailwind v4 is configured CSS-first: there is **no `tailwind.config.js`**. Theme tokens and dark mode live in `src/index.css` (`@theme inline`, `:root`, `.dark`). Use theme colors (`bg-primary`, `text-muted-foreground`, …) rather than hardcoded values.

### Brand / Logo

- `src/components/logo.tsx`: `<Logo variant="horizontal" | "vertical">` — the Central Yards logo. Source files: `src/assets/logo/*.svg`, imported as components.
- Color and size come from `className`: shapes use `currentColor`, so set the color with `text-*`; set the size with `h-*` (horizontal, width follows the aspect ratio) or `size-*` (vertical). Defaults: `h-6.5 w-auto` (136×26) and `size-40` (160×160).
- It has `role="img"` + `aria-label="Central Yards"`; pass `title={null}` when decorative.

### SVG imports

- `import Icon from '@/assets/….svg?react'` gives a React component (`vite-plugin-svgr`, options in `svgr.config.ts`). Without `?react` you get the file URL.
- `svgr.config.ts` strips the root `width`/`height` (size via className) and rewrites every `id` / `url(#…)` / `href="#…"` to a per-instance `useId()` prefix. Figma exports use fixed mask/clip ids; without this, a hidden copy of the same SVG breaks the visible one.
- For single-color icons, export from Figma with `fill="currentColor"` so `text-*` sets the color.

### Typography

- Text styles follow the AA Library Figma spec: `heading1–2`, `subtitle1–3`, `body1–3`, `button1–2`, `icon-button`, `link`, `tab-highlight`, `tab-default`, `input-title`, `input-placeholder`, `label1–3`, `number1–3`.
- Figma "Highlight" styles are not variants: use the base variant with `weight="semibold"`, e.g. `<Typography variant="body1" weight="semibold">`.
- Use `<Typography variant="…">` (`src/components/ui/typography.tsx`) or the matching `text-<variant>` utility. Each utility sets size, line height (120%), letter spacing and weight. Don't use `text-sm`/`text-lg` etc. for app text.
- Sizes are rem (1rem = 16px) except `number1–3`, which are fixed px per the spec.
- Headings/subtitles render `h1`–`h5` by default; pass `render={<p />}` etc. to change the tag and keep heading levels sequential (a11y tests fail on skipped levels).
- To add or change a style, update **both** `src/tokens/typography.ts` (names) and the `@theme` typography block in `src/index.css` (values), then the expectations in `src/stories/typography.stories.tsx`.
- Components in `src/components/ui/` may be edited to fit the project, but keep edits minimal so they can be compared against upstream.
- ESLint turns off `react-refresh/only-export-components` for `src/components/ui/**`, because shadcn files export variants (e.g. `buttonVariants`) alongside components. Put app components elsewhere so the rule still applies to them.

### shadcn Skill & MCP

- **Skills** (installed via `npx skills add`, pinned in `skills-lock.json`):
  - `shadcn` (`shadcn/ui`) — project-aware rules and CLI workflow; loads automatically when working with components.
  - `migrate-radix-to-base` (`shadcn/ui`) — only relevant when porting Radix-based code or examples to Base UI.
  - `tailwind-css` (`paulrberg/agent-skills`) — Tailwind v4 styling conventions; project conventions take precedence.
  - Skill files live in the root `skills/` directory. `.agents/skills` and `.claude/skills` are symlinks to it, so every agent reads the same copy. Add new skills under `skills/`, never inside the symlinked directories.
  - These are vendored upstream files: don't edit them. Update with `npx skills update`. They are excluded from Prettier and ESLint.
- **MCP** (`.mcp.json`): the `shadcn` server lets agents browse, search and view registry items. Set up with `pnpm dlx shadcn@latest mcp init --client claude`.

## i18n

- `i18next` + `react-i18next`, set up in `src/i18n/index.ts` (imported by `src/main.tsx` and `.storybook/preview.tsx`).
- Locales (`SUPPORTED_LOCALES`): `sc` (Simplified Chinese, **`DEFAULT_LOCALE`**), `tc` (Traditional Chinese), `en`. The user's choice is saved in `localStorage` (`LOCALE_STORAGE_KEY` = `locale`) and restored on load; if storage is unavailable it falls back to the default.
- Strings live in `src/i18n/resources/{sc,tc,en}.ts` as nested objects grouped by feature (`app.title`, `locale.label`). `sc` is the source: its shape is `TranslationResource`, which types `t()` keys (`src/i18n/i18next.d.ts`) and the other locales (`export const tc: TranslationResource`), so a missing, extra or misspelled key fails `tsc`.
- Use `const { t } = useTranslation()`; no hard-coded UI text in components.
- `<html lang>` follows the locale via `applyDocumentLang` (`sc` → `zh-CN`, `tc` → `zh-Hant`, `en` → `en`). `src/index.css` uses `:lang()` to put the matching CJK font first: SC and TC share code points but draw many characters differently. For mixed content, mark the snippet with `lang="zh-CN"` / `lang="zh-Hant"`.
- Storybook has a language switcher in the toolbar; pin a story with `globals: { locale: 'tc' }`.

## Storybook

- Storybook 10 with `@storybook/react-vite`; addons: `addon-docs`, `addon-a11y`. Config in `.storybook/`.
- It reuses `vite.config.ts` (Tailwind plugin, `@/` alias). `.storybook/preview.tsx` imports `src/index.css` so theme tokens apply.
- Stories live in `src/stories/` (e.g. `src/stories/button.stories.tsx`) and import components via the `@/` alias. Use CSF3 with `satisfies Meta<typeof Component>`.
- Story titles: `UI/<Name>` for `src/components/ui`, otherwise mirror the folder.
- Stories are centered by default (`layout: 'centered'` in `.storybook/preview.tsx`). Use `parameters: { layout: 'fullscreen' }` for page-level stories (layouts, headers, sidebars).
- Check the a11y panel for new components; fix violations rather than disabling rules.

### Component Tests

- `@storybook/addon-vitest` runs **every story as a test** in headless Chromium (Vitest browser mode + Playwright). Config: `test.projects` in `vite.config.ts`.
- Each story is checked for: rendering without errors, its `play` function, and a11y (`parameters.a11y.test: 'error'` in `.storybook/preview.tsx` — violations fail the test).
- Write interaction tests as `play` functions using `expect` / `fn` from `storybook/test` and the `canvas` / `userEvent` passed into `play`. See `src/stories/button.stories.tsx`.
- Prefer accessible queries (`getByRole`, `getByLabelText`) over test IDs.
- Chromium needs OS libraries. On a fresh Ubuntu/Debian machine run once (requires sudo): `sudo pnpm exec playwright install-deps chromium`.

## Code Style

- TypeScript `strict` is on in both `tsconfig.app.json` and `tsconfig.node.json`. Don't use `any` — prefer `unknown` with type guards; don't loosen compiler options to silence errors.
- Prettier (`prettier.config.js`): single quotes, semicolons, trailing commas, 100-char lines.
- The shadcn CLI generates double-quoted code; run Prettier on new files (lint-staged also does this on commit).

## Git Conventions

- **Commit format**: `type(scope): subject`, enforced by commitlint (`commitlint.config.js`).
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `revert`, `build`, `ci`
  - Scope is **required** and lowercase; no trailing period; header ≤ 100 chars.
- **Hooks** (husky):
  - `pre-commit` → lint-staged (`eslint --fix` + `prettier --write` on staged files)
  - `commit-msg` → commitlint
- Don't bypass hooks with `--no-verify`.

## Release

Versioning and `CHANGELOG.md` are generated by `commit-and-tag-version` from commit history:

```bash
pnpm release            # infer bump from commits
pnpm release:patch      # or force patch / minor / major
pnpm release:minor
pnpm release:major
```

This bumps `package.json`, updates `CHANGELOG.md`, commits and tags. It does not push.

## Working Practices

1. **Keep changes scoped** — only modify files relevant to the task.
2. **Verify after edits** — run `pnpm exec tsc -b` and `pnpm lint`; run `pnpm build` for config or dependency changes.
3. **Don't revert unrelated changes** — respect the user's working state.
4. **Reuse before creating** — check `src/components/ui/` and add shadcn components before building custom ones.

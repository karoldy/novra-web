# AGENTS.md

Guidance for Claude Code and other coding agents working in this repository.

## Project Overview

- **App**: AAHK ZWIS CMS
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
├── lib/utils.ts      # re-exports `cn` from the `cn` package
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
- Icons: `lucide-react`. Font: Geist (`@fontsource-variable/geist`).
- Tailwind v4 is configured CSS-first: there is **no `tailwind.config.js`**. Theme tokens and dark mode live in `src/index.css` (`@theme inline`, `:root`, `.dark`). Use theme colors (`bg-primary`, `text-muted-foreground`, …) rather than hardcoded values.
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

## Storybook

- Storybook 10 with `@storybook/react-vite`; addons: `addon-docs`, `addon-a11y`. Config in `.storybook/`.
- It reuses `vite.config.ts` (Tailwind plugin, `@/` alias). `.storybook/preview.tsx` imports `src/index.css` so theme tokens apply.
- Co-locate stories next to the component: `button.tsx` → `button.stories.tsx`. Use CSF3 with `satisfies Meta<typeof Component>`.
- Story titles: `UI/<Name>` for `src/components/ui`, otherwise mirror the folder.
- Check the a11y panel for new components; fix violations rather than disabling rules.

### Component Tests

- `@storybook/addon-vitest` runs **every story as a test** in headless Chromium (Vitest browser mode + Playwright). Config: `test.projects` in `vite.config.ts`.
- Each story is checked for: rendering without errors, its `play` function, and a11y (`parameters.a11y.test: 'error'` in `.storybook/preview.tsx` — violations fail the test).
- Write interaction tests as `play` functions using `expect` / `fn` from `storybook/test` and the `canvas` / `userEvent` passed into `play`. See `src/components/ui/button.stories.tsx`.
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

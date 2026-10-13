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
├── components/
│   ├── ui/           # atoms: shadcn components + base primitives (Button, Typography, Stack, Spinner, Pagination, Table)
│   ├── molecules/    # small compositions of atoms (Logo, FilterChip, PaginationBar, DataTable)
│   └── organisms/    # larger sections built from molecules/atoms (headers, sidebars, forms)
├── lib/utils.ts      # `cn`, configured with the custom typography sizes
├── tokens/           # design tokens (typography variant names)
├── i18n/             # i18next setup + resources/{sc,tc,en}.ts
├── index.css         # CSS entry: Tailwind, shadcn, then @imports src/styles/*
├── styles/
│   ├── theme.css     # global theme: shadcn semantic colors (light :root / dark .dark), radius, brand primary
│   ├── component.css # component tokens: --button-*, --spinner-*, --chip* (one section per component)
│   ├── fonts.css     # --font-sans + :lang() font switching
│   ├── typography.css # typography @theme (--text-heading1 … number3)
│   └── base.css      # @layer base globals
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
- **`ui/` components don't build in icons or text.** Consumers pass icons as children marked with `data-icon="inline-start" | "inline-end"` (the component only sizes and positions them) and labels as props. (A Button's `loading` Spinner is a state indicator, not an icon.) Molecules / organisms that assemble a fixed pattern may build in their icons (lucide) and labels — labels through i18n, never hard-coded (e.g. `PaginationBar`).
- Fonts: Noto Sans (Latin), Noto Sans TC, Noto Sans SC — self-hosted Fontsource variable fonts loaded by `unplugin-fonts` (`Unfonts` in `vite.config.ts`, `import 'unfonts.css'` in `src/main.tsx` and `.storybook/preview.tsx`). The `--font-sans` stack in `src/styles/fonts.css` sets the fallback order. To add a font, install its `@fontsource(-variable)/*` package and list it in `Unfonts`; don't `@import` fonts in CSS. Font files are emitted to `assets/fonts/` and never inlined.
- Tailwind v4 is configured CSS-first: there is **no `tailwind.config.js`**. Global theme tokens and dark mode live in `src/styles/theme.css` (`@theme inline`, `:root`, `.dark`); variables owned by one component go in `src/styles/component.css`, one section per component with its `@theme inline` mapping, `:root` and `.dark` values. `src/index.css` only imports. The shadcn CLI writes new CSS variables into `src/index.css` (`components.json` → `tailwind.css`): move them into the matching `src/styles/*.css` file. Use theme colors (`bg-primary`, `text-muted-foreground`, …) rather than hardcoded values.

### Theme Color

- **Primary is #0F1048** (`--primary` in `src/styles/theme.css`). Figma files may show other blues (e.g. AA Library's #094DCC): don't use them, use the theme primary.
- Interactive states of primary-colored elements use these derived values (same hue, defined as `--button-primary-hover` / `--button-primary-pressed`). Reuse the variables; don't invent new shades.

  | State                      | Light mode                                | Dark mode                 |
  | -------------------------- | ----------------------------------------- | ------------------------- |
  | Default                    | `#0F1048` · `oklch(0.2199 0.101 273.57)`  | `oklch(0.82 0.07 273.57)` |
  | Hover                      | `#1E2368` · `oklch(0.3 0.12 273.57)`      | `oklch(0.76 0.08 273.57)` |
  | Active / pressed           | `#2A3280` · `oklch(0.36 0.13 273.57)`     | `oklch(0.7 0.09 273.57)`  |
  | Subtle background, hover   | `#E7ECFF` · `oklch(0.9442 0.0264 273.57)` | same                      |
  | Subtle background, pressed | `#BCCAFF` · `oklch(0.8457 0.0759 273.57)` | same                      |
  | Text on subtle backgrounds | `#0F1048`                                 | `#0F1048`                 |

  In light mode hover / pressed get **lighter** (navy can't get darker); in dark mode, where primary is a light tint, they get darker. Text on primary is white (light) / navy (dark): `--primary-foreground`.

### Brand / Logo

- `src/components/molecules/logo.tsx`: `<Logo variant="horizontal" | "vertical">` — the Central Yards logo. Source files: `src/assets/logo/*.svg`, imported as components.
- Color and size come from `className`: shapes use `currentColor`, so set the color with `text-*`; set the size with `h-*` (horizontal, width follows the aspect ratio) or `size-*` (vertical). Defaults: `h-6.5 w-auto` (136×26) and `size-40` (160×160).
- It has `role="img"` + `aria-label="Central Yards"`; pass `title={null}` when decorative.

### SVG imports

- `import Icon from '@/assets/….svg?react'` gives a React component (`vite-plugin-svgr`, options in `svgr.config.ts`). Without `?react` you get the file URL.
- `svgr.config.ts` strips the root `width`/`height` (size via className) and rewrites every `id` / `url(#…)` / `href="#…"` to a per-instance `useId()` prefix. Figma exports use fixed mask/clip ids; without this, a hidden copy of the same SVG breaks the visible one.
- For single-color icons, export from Figma with `fill="currentColor"` so `text-*` sets the color.

### Stack

- Layout with `XStack` (row) / `YStack` (column) from `src/components/ui/stack.tsx` instead of hand-written `flex` containers. Props: `align`, `justify`, `wrap`; spacing goes in `className` (`gap-4`, `p-2`).
- It renders a `<div>`; change the element with `render`, e.g. `<YStack render={<section />}>` or `<XStack render={<ul />}>`. There is no `as` prop.

### Button

- `src/components/ui/button.tsx` follows the AA Library Figma "Button" set. Variant names are shadcn's (so shadcn components keep working); map them to Figma like this:

  | Figma style      | `variant`             |
  | ---------------- | --------------------- |
  | Primary          | `default`             |
  | Secondary        | `outline`             |
  | Tertiary         | `ghost`               |
  | Danger           | `destructive`         |
  | Danger Secondary | `destructive-outline` |

  `secondary` and `link` are not in Figma; kept for shadcn components.

- Sizes: `default` = Figma "Default" (48px, `button1` text, min width 140), `sm` = "Small" (40px, `button2` text, min width 132). Both are pill-shaped with 24px icons. `lg`, `xs` and `icon*` are shadcn sizes kept for shadcn components.
- States: hover / pressed / disabled come from CSS. `skeleton` renders Figma's loading placeholder (natively disabled, so not focusable or clickable; `aria-busy`). `onDark` is Figma's "On White=no": outline / ghost turn white on dark or colored surfaces.
- Icons: put the icon inside with `data-icon="inline-start" | "inline-end"` and no size class. Each size sets its own icon size (no base default), so classes never compete when `buttonVariants()` is used without `cn`.
- `loading`: shows a 16px Spinner (`size="sm"`, on every button size) in place of the leading icon (text stays), ignores clicks, sets `aria-busy`. Unlike `disabled` it keeps its normal colors and stays focusable (`aria-disabled`). Use it instead of composing a Spinner by hand.
- Colors come from the `--button-*` variables in `src/styles/component.css`. Primary, hover, pressed and subtle tints follow [Theme Color](#theme-color); danger, disabled and skeleton use the Figma values.

### Spinner

- `src/components/ui/spinner.tsx`: `<Spinner size="sm" | "md" | "lg" />` (16 / 24 / 88px), from the AA Library Figma "Loading". `lg` has no track. Rotates once per 720ms; slower (not stopped) with reduced motion.
- No text: it is only the indicator. For a message (Figma "Inline"), compose it: `<XStack role="status" align="center" className="gap-2"><Spinner /><span className="text-body2 text-muted-foreground">…</span></XStack>`.
- Decorative (`aria-hidden`) by default; pass `aria-label` to announce it as `role="status"`.
- In buttons use `<Button loading>` rather than placing a Spinner yourself; it takes the button's text color. Colors: `--spinner-indicator`, `--spinner-track` in `src/styles/component.css`.

### FilterChip

- `src/components/molecules/filter-chip.tsx`, from the AA Library Figma "Chips/Filter" (40px high, 4px radius). No icons are built in; compose the Figma styles. Figma "Date Selection" (‹ value › steppers) has no component: build it from your own buttons if needed.

  | Figma style         | Composition                                                                                                           |
  | ------------------- | --------------------------------------------------------------------------------------------------------------------- |
  | Criteria and Result | `<FilterChip label="Status">Done</FilterChip>`                                                                        |
  | Text Dropdown       | `<FilterChip>All<ChevronDownIcon data-icon="inline-end" /></FilterChip>`                                              |
  | Dropdown with icon  | `<FilterChip><MapPinIcon data-icon="inline-start" />Hong Kong<ChevronDownIcon data-icon="inline-end" /></FilterChip>` |
  | Quick key           | `<FilterChip aria-pressed={on} filtered={on}>Today</FilterChip>`                                                      |

- `label` renders as `<Typography variant="label3">`. For other styling, leave `label` out and put your own element in the children.
- Icon sizes: `inline-start` 24px, `inline-end` 16px (it flips while `aria-expanded`). Gaps follow Figma (8px, 16px before the trailing icon).
- States: `filtered` = a value is applied; Pressed = held or `aria-expanded`; `disabled` = 30% opacity. Hover / pressed / filtered colors follow [Theme Color](#theme-color); the neutral chip colors are `--chip*` in `src/styles/component.css`.
- It is only the trigger: wire menus / date pickers around it (it forwards `aria-expanded` etc.).

### Pagination

- `src/components/ui/pagination.tsx` is shadcn's pagination (same parts: `Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis`) restyled to the AA Library Figma: 48px round items, current page (`isActive`, `aria-current="page"`) in the theme primary, hover / pressed subtle tints, neutrals `--pagination-*` in `src/styles/component.css`.
- No built-in text or icons: `Pagination` needs `aria-label`, `PaginationPrevious` / `PaginationNext` need `aria-label` and the icon as children. `PaginationLink` is a `<button>` (`onClick`) or, with `href`, an `<a>`.
- `getPaginationItems(page, pageCount)`: up to 7 slots (the Figma component has 7 page items) — first and last page, the current page with both neighbours, `…` for gaps: `1 2 3 4 5 … 10`, `1 … 4 5 6 … 10`, `1 … 6 7 8 9 10`; ≤ 7 pages shows all. (Figma's `1 2 … 9 10` example was dropped: it hid the next page.)
- **Don't run `shadcn add pagination`**: it also overwrites the customised `button.tsx`. Compare with upstream using `--diff` only.
- `src/components/molecules/pagination-bar.tsx`: `<PaginationBar page total pageSize onPageChange />`. Everything is built in: the page count, the summary (`pagination.summary`, `body2` muted), the page-size chip (`pagination.pageSize`, filtered `FilterChip` + lucide chevron), the navigation labels (`pagination.label` / `previous` / `next`) and arrow icons (lucide). The navigation is left out for a single page (Figma "If only 1 page"). The page-size menu has no design yet, so the chip only shows the current size.

### Table

- `src/components/ui/table.tsx` is the AA Library Figma "Table" markup: `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`. Rows are 63px, 4px radius, `text-body2`, padding 24×16. Colors are `--table-*` in `src/styles/component.css`.
- The sort icon and the row arrow are built in, both lucide: `TableSortButton` (`direction` `asc` | `desc` | `false`, chevron 16px before the label) and `TableRowArrow`. Labels stay with the caller.
- `pin="start" | "end"` on `TableHead` / `TableCell` sticks that cell. `edge` draws the divider on the end-pinned column next to the scrolling cells. Sticky offsets are the caller's (`style`).
- `src/components/molecules/data-table.tsx`: `<DataTable columns data aria-label />`, built on `@tanstack/react-table` v9 (`useTable`). Define columns with `createDataTableColumns<T>()` from `data-table-columns.ts`.
- Sortable headers use `TableSortButton`. `aria-sort` is `none` / `ascending` / `descending`. A column opts out with `enableSorting: false`. Sorting is client-side unless `manualSorting`. `sorting` / `onSortingChange` control it.
- Pin a column with `meta: { pin: 'start' | 'end' }`. Omit `pin` and the column scrolls. `start` sticks to the inline start, `end` to the inline end; the end column next to the scrolling cells gets the divider. Set `meta.width` or `size` (px) on pinned and wide columns so the sticky offsets match. A column with neither shares the leftover width (`meta.flex`, default 1, floor `meta.minWidth` or 120). `meta.align: 'center'` centers a cell (headers stay at the start). Plain cell text clamps to two lines.
- `defaultPageSize` (or controlled `pagination`) slices the rows and renders `PaginationBar` with `page`, `total`, `pageSize`, `onPageChange`. The page-size chip only displays the current size. `label` is the bar's landmark name. `manualPagination` and `rowCount` are for a server page. `loading` shows skeleton rows; `empty` fills one row when there is no data; `onRowClick` makes a row a click and Enter target.

### Typography

- Text styles follow the AA Library Figma spec: `heading1–2`, `subtitle1–3`, `body1–3`, `button1–2`, `icon-button`, `link`, `tab-highlight`, `tab-default`, `input-title`, `input-placeholder`, `label1–3`, `number1–3`.
- Figma "Highlight" styles are not variants: use the base variant with `weight="semibold"`, e.g. `<Typography variant="body1" weight="semibold">`.
- Use `<Typography variant="…">` (`src/components/ui/typography.tsx`) or the matching `text-<variant>` utility. Each utility sets size, line height (120%), letter spacing and weight. Don't use `text-sm`/`text-lg` etc. for app text.
- Sizes are rem (1rem = 16px) except `number1–3`, which are fixed px per the spec.
- Headings/subtitles render `h1`–`h5` by default; pass `render={<p />}` etc. to change the tag and keep heading levels sequential (a11y tests fail on skipped levels).
- To add or change a style, update **both** `src/tokens/typography.ts` (names) and `src/styles/typography.css` (values), then the expectations in `src/stories/typography.stories.tsx`.
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
- `<html lang>` follows the locale via `applyDocumentLang` (`sc` → `zh-CN`, `tc` → `zh-Hant`, `en` → `en`). `src/styles/fonts.css` uses `:lang()` to put the matching CJK font first: SC and TC share code points but draw many characters differently. For mixed content, mark the snippet with `lang="zh-CN"` / `lang="zh-Hant"`.
- Storybook has a language switcher in the toolbar; pin a story with `globals: { locale: 'tc' }`.

## Storybook

- Storybook 10 with `@storybook/react-vite`; addons: `addon-docs`, `addon-a11y`. Config in `.storybook/`.
- It reuses `vite.config.ts` (Tailwind plugin, `@/` alias). `.storybook/preview.tsx` imports `src/index.css` so theme tokens apply.
- Stories live in `src/stories/` (e.g. `src/stories/button.stories.tsx`) and import components via the `@/` alias. Use CSF3 with `satisfies Meta<typeof Component>`.
- Story titles mirror the component folder: `UI/<Name>` (`components/ui`), `Molecules/<Name>`, `Organisms/<Name>`; non-component stories use `Foundations/<Name>`.
- Layout inside stories uses `XStack` / `YStack` too, not hand-written `flex` containers.
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
4. **Reuse before creating** — check `src/components/{ui,molecules,organisms}/` and add shadcn components before building custom ones. Put new components in the lowest layer that fits.

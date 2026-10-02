# Ramp UI replica: conventions

A pixel-faithful replica of the Ramp admin app. Next.js 16 (App Router), React 19,
Tailwind v4 (CSS-first config in `src/app/globals.css`), lucide-react icons, recharts.

The design was matched against four production screenshots: Accounting › Ramp Card (1x scale),
Vendors › Migrate payments (~1.33x), Insights (~1.33x, older olive palette, collapsed rail) and Cash & Treasury.

## Visual language (match this everywhere)

- **Calm, editorial, monochrome.** White canvas, warm-gray sidebar (`bg-sidebar`), black ink.
  The only brand color is Ramp lime (`bg-lime`) used for the primary CTA, "New" tags and counters.
- **Typography**: one family (`font-sans`, Inter Tight standing in for TWK Lausanne). Weights are
  *regular (400)* almost everywhere. Hierarchy comes from size, not weight. Never use
  `font-bold`/`font-semibold` for headings. `font-medium` is only for tiny count pills.
  - Page title: `PageHeader` (40px, tracking -0.025em). Section titles: `SectionHeading` (30px or 18px).
  - Body/table text 13–14px. Secondary 12px `text-ink-2`. Column headers 12px `text-ink-3`.
  - Big money numbers: 26–52px, regular weight, `tabular`, tight tracking.
- **Square corners**: buttons and cards use `rounded-[2px]` / no radius. Pills (`rounded-full`)
  are only for counts, tags, filter chips, toolbar icon buttons and the "Options" button.
- **Hairlines, not shadows**: `border-line` (#ebe9e8) for dividers/cards, `border-line-soft` for row
  separators. Shadows only on popovers/dialogs (`shadow-pop`).
- **Full-bleed layout**: content uses the page gutter `px-page` (52px). Tables run edge to edge with
  the first/last cell padded to the gutter (the `Th`/`Td` primitives do this automatically).
- **Toolbar band**: search + filters live in a `Toolbar` (bg `#fcfbf9`, top hairline) directly above tables.
- Icons: lucide at 14–16px with `stroke-[1.5]`, color `text-ink-2`.
- Positive money: `text-positive` (Insights green) or `text-money` (muted green, Vendors). Increases/alerts:
  `text-warning` (orange). Flags: `text-flag`.

## Tokens (`src/app/globals.css`)

Use the generated utilities. **Never hard-code hex colors** in components, except brand marks and chart series.
`canvas, sidebar, sidebar-group, subtle, muted, chip, ink, ink-1..ink-5, line, line-strong, line-soft,
lime, lime-soft, lime-bright, positive, money, success-*, approve, approve-line, warning, flag, danger,
danger-bg, caution, caution-bg, info, info-bg, chart-plum(-fill), chart-sage(-fill), chart-sand`.
Spacing: `px-page` = 52px gutter.

## Shared building blocks (import, don't re-implement)

| Need | Use |
| --- | --- |
| Page title block | `PageHeader` (eyebrow, title, count, actions), `SectionHeading` from `ui/page-header` |
| Tabs (route or controlled) | `Tabs` (+ `Segmented`) from `ui/tabs` |
| Buttons | `Button` (primary/secondary/ghost/muted/approve/danger/link, sizes xs–lg, `pill`), `IconButton` |
| Pills | `Count`, `Tag` (new/beta/plus/success/warning/danger/info/neutral/outline), `Status` (dot + label) |
| Tables | `Table`, `THead`, `TBody`, `Th` (sort, align), `Tr`, `Td`, `CellStack`, `TableFooter`, `EmptyState` |
| Toolbar | `Toolbar`, `ToolbarRow`, `SearchField` (bare/pill/underline), `LockedFilter`, `FilterChip`, `AddFilterButton` |
| Inputs | `Select` (inline/cell/field/underline), `Checkbox`, `Switch` |
| Forms | `Field`, `TextInput`, `MoneyInput`, `TextArea` (native props + `onValueChange`), `ChoiceTile(s)`, `FormRow`, `FormSection` from `ui/field` |
| Table toolbar with filters | `DataToolbar` (filter pill, date presets, density, columns, Options) from `ui/data-toolbar` |
| Overlays | `Popover` + `MenuItem`/`MenuLabel`/`MenuDivider`, `Dialog` (+`DialogHeader`/`DialogFooter`), `Drawer` |
| Feedback | `useToast().show(message, tone?)` |
| Data display | `Stat`, `SplitMoney`, `Card`, `Progress`, `DetailRow`, `Sparkline` (from `ui/stat`, `ui/sparkline`) |
| Identity | `MerchantLogo name=…` (known brands drawn, others get a monogram), `Avatar`, `AvatarStack` |
| Helpers | `cn` (`@/lib/cn`), `formatMoney`, `formatMoneyWhole`, `formatMoneyCompact`, `splitMoney`, `pluralize`, `formatDate`, `formatDateLong`, `parseAmount`, `formatAmountInput` (`@/lib/format`) |
| Data | `@/data/people` (`people`, `currentUser` = Alexander Bass, `company` = Efficient App), `@/data/transactions` |

Reference implementations to copy patterns from:
- `src/app/accounting/ramp-card/*` + `src/components/accounting/*`: tabbed table page, sticky columns, bulk select, drawer, shared client store.
- `src/app/vendors/(overview)/migrate` + `src/components/vendors/*`: header with actions, stats, pill-search toolbar, editable rows.

## File layout rules

- Routes in `src/app/<area>/…/page.tsx`. Keep `page.tsx` thin (server component exporting `metadata`),
  put interactive UI in `src/components/<area>/*.tsx` (`"use client"` only where needed).
- Sample data in `src/data/<area>.ts`, typed, realistic (company "Efficient App", Austin TX; reuse names from `people.ts`).
- Next 16: route `params`/`searchParams` are **Promises** (`const { id } = await params`). Use `LayoutProps<"/route">` / `PageProps<"/route">` global helpers or plain prop types.
- **Do not edit** `src/components/ui/*`, `src/components/shell/*`, `src/app/globals.css`, `src/app/layout.tsx`,
  `src/data/people.ts`, `src/data/transactions.ts`, or another area's files. If you need a new primitive,
  build it inside your area folder and mention it in your report.
- No new npm dependencies.
- Use `<Link>` from `next/link` for navigation. Every button should do something plausible (toast, open drawer/dialog, navigate, toggle state).

## Quality gates

- `npx tsc --noEmit -p .` and `npx eslint <your files>` must be clean for your files.
- Screenshot every screen you build (1508x784 and full page) against `npm run dev`, compare it with the
  visual language above, and fix any console errors.

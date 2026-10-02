# gRamp

A high-fidelity replica of the Ramp admin app, built with Next.js 16 (App Router), React 19, Tailwind CSS v4, lucide-react and recharts. All data is sample data; nothing talks to a backend.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## What's inside

- **Shell**: collapsible sidebar (⌘\ toggles the icon rail), ⌘K command palette, toasts.
- **Screens**: Home, Inbox, Insights, My Ramp, Assistant, Expenses & travel, Funds & cards, Spend programs, Procurement, Bill Pay, Accounting (Ramp Card, Reimbursements, Payments, Treasury), Cash & Treasury, Company, Vendors (Overview, Renewals, Migrate payments, vendor detail, Price Intelligence, Seat Intelligence), Settings, Refer & earn, Help.
- **Interactions**: editable table rows, bulk selection, detail drawers, dialogs, live tab counts.

## Project layout

| Path | Contents |
| --- | --- |
| `src/app/globals.css` | Design tokens (colors, gutter, animations) as Tailwind v4 `@theme` |
| `src/components/ui/` | Shared primitives: buttons, tabs, tables, toolbars, forms, overlays, logos |
| `src/components/shell/` | Sidebar, navigation config, command palette |
| `src/components/<area>/` | Feature components per product area |
| `src/data/` | Typed sample data |

See [CONVENTIONS.md](./CONVENTIONS.md) for the design rules and component guide.

## Notes

- Ramp uses the commercial TWK Lausanne typeface; this project substitutes Inter Tight (set in `src/app/layout.tsx`).
- Merchant logos are lightweight SVG approximations with a monogram fallback.

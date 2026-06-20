## @repo/ui

Shared UI component library for the vahedyek monorepo.

## TaavUI (design system)

TaavUI is the internal design system for **DastRanj** and **VahedYek**. See [TAAVUI.md](./TAAVUI.md) for full guidelines.

### Run TaavUI Lab

```bash
npm run dev:taav-ui
```

Open http://localhost:3040

### Import tokens (required)

In your app's global CSS:

```css
@import "@repo/ui/taav-tokens.css";
```

Without this import, TaavUI components will not receive design tokens.

### Import components (recommended)

```tsx
import { TaavButton, TaavInput, TaavFormField } from "@repo/ui/taav";
```

**Server-safe split (recommended in App Router):**

```tsx
import { TaavButton } from "@repo/ui/taav/primitives";
import { TaavInput, TaavFormField } from "@repo/ui/taav/forms";
import { TaavDialog } from "@repo/ui/taav/overlays";
import { TaavTabs } from "@repo/ui/taav/navigation";
import { TaavChip, TaavTableShell } from "@repo/ui/taav/data-display";
```

Legacy components remain available from `@repo/ui` for backward compatibility.

### Package exports

| Export | Purpose |
|--------|---------|
| `@repo/ui` | Full library (legacy + TaavUI) |
| `@repo/ui/taav` | Official TaavUI surface only |
| `@repo/ui/taav/primitives` | Primitives + tokens (server-safe) |
| `@repo/ui/taav/forms` | Form primitives + tokens |
| `@repo/ui/taav/overlays` | Dialog, Drawer, Popover, Dropdown |
| `@repo/ui/taav/navigation` | Tabs, Stepper |
| `@repo/ui/taav/data-display` | Chip, StatusBadge, EmptyState, Skeleton, TableShell, KeyValue (server-safe) |
| `@repo/ui/taav/data-display/interactive` | ChipGroup, Pagination, FilterBar |
| `@repo/ui/taav-tokens.css` | Design token CSS variables |
| `@repo/ui/server` | Server-safe legacy exports |

### Local build

```bash
npm --workspace @repo/ui run build
```

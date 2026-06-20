# TaavUI Developer Guidelines



TaavUI is the shared design system for DastRanj and VahedYek. It lives in `packages/ui` and is documented in `apps/taav-ui-lab`.



## Consumption contract



### 1. Import tokens CSS once



Every app that renders TaavUI components **must** import the token stylesheet in its global CSS entry (root layout / `globals.css`):



```css

@import "@repo/ui/taav-tokens.css";

```



Alternative (relative path in monorepo):



```css

@import "../../../packages/ui/src/tokens/taav-tokens.css";

```



**Where:** app root global CSS — e.g. `apps/your-app/app/globals.css`, loaded from `app/layout.tsx`.



**If you skip this:** TaavUI components render without `--taav-*` variables. Heights, colors, borders, and focus rings fall back to browser defaults or broken styling.



### 2. Import components from the official entrypoint



**Recommended (App Router):**



```tsx

import {

  TaavButton,

  TaavInput,

  TaavFormField,

} from "@repo/ui/taav";

```



**Granular imports (server-safe in App Router):**



```tsx

import { TaavButton, TaavCard } from "@repo/ui/taav/primitives";

import { TaavInput, TaavFormField } from "@repo/ui/taav/forms";

import { TaavDialog } from "@repo/ui/taav/overlays";

import { TaavTabs } from "@repo/ui/taav/navigation";

import { TaavStatusBadge, TaavTableShell } from "@repo/ui/taav/data-display";

import { TaavPagination } from "@repo/ui/taav/data-display/interactive";

import { TaavPageShell, TaavPageHeader } from "@repo/ui/taav/layout";

import { TaavSection, TaavSidebarPanel } from "@repo/ui/taav/layout/interactive";

```



Use `@repo/ui/taav/primitives` in server components to avoid pulling client form bundles.



**Also valid (main entry, backward-compatible):**



```tsx

import { TaavButton, TaavInput } from "@repo/ui";

```



Use `@repo/ui/taav` in Next.js App Router to avoid pulling legacy/domain components (date pickers, dev-doc boards, etc.) into server bundles.



### 3. Legacy imports — avoid for new TaavUI work



These remain in `@repo/ui` for existing apps but are **not** part of TaavUI:



- `Input`, `PersianDatePicker`, `formStyles`

- `DastranjPrimitives`, contract/rule/business components

- `DevDocThreadsBoard`



New features should use TaavUI primitives and forms only.



### 4. Tailwind `@source`



Apps using Tailwind v4 must scan the UI package so TaavUI class names are generated:



```css

@source "../../../packages/ui/src/**/*.{js,ts,jsx,tsx}";

```



## Principles



- **RTL-first** — Persian-friendly layout, icon order, and typography.

- **Controlled API** — Visual changes go through official props, not arbitrary classes.

- **Token-driven** — Colors, spacing, radius, and motion use `--taav-*` tokens.

- **Gradual migration** — Apps adopt TaavUI page by page; no big-bang rewrites.



## Rules for app developers



### 1. Use TaavUI when available



If `TaavButton`, `TaavInput`, `TaavFormField`, or another official component fits, use it. Do not duplicate the same UI with local Tailwind.



### 2. No arbitrary styling on primitives



```tsx

// ❌ Wrong

<TaavInput inputClassName="h-16 bg-purple-100" />



// ✅ Correct

<TaavInput size="lg" variant="filled" invalid={hasError} />

```



### 3. Official props only



| Prop family | Examples |

|-------------|----------|

| Visual | `variant`, `tone`, `size`, `shape` |

| Layout | `width`, `padding`, `radius` |

| State | `loading`, `disabled`, `invalid`, `readOnly` |

| Content | `iconStart`, `iconEnd`, `prefix`, `suffix`, `label` |



### 4. Request new variants in TaavUI



If a pattern repeats across apps, add it to TaavUI with a named variant — not per-page Tailwind.



### 5. Business components compose primitives



Domain widgets (contract tags, rule panels) should use Taav primitives internally.



### 6. Migration is incremental



- Do not migrate entire apps in one commit.

- Start with isolated pages or new features.

- Keep existing `@repo/ui` exports working.



## Form component rules



1. Do not create raw app-local text inputs when `TaavInput` exists.

2. Do not create custom label/error/helper patterns inside app pages.

3. Use `TaavFormField` for normal field layout.

4. Use `TaavFormMessage` for error/info/success/warning messages under fields.

5. Do not pass arbitrary Tailwind classes for visual changes.

6. Add new variants to TaavUI only when reusable across DastRanj and VahedYek.

7. Do not introduce page-specific business logic into TaavUI form primitives.

8. **React Hook Form / Zod integration is planned for a later phase — do not add now.**



## Form controls rules



1. Use `TaavSelect` instead of app-local select styling.

2. Use `TaavCheckbox` and `TaavRadioGroup` instead of custom checkbox/radio rows.

3. Use `TaavSwitch` for boolean settings.

4. Use `TaavSegmentedControl` for compact mode selection.

5. Use `TaavOptionCard` for selectable business options.

6. Do not create page-specific control styles inside DastRanj or VahedYek.

7. Do not pass arbitrary Tailwind classes for visual changes.

8. Do not add business logic to form controls.

9. **DatePicker, React Hook Form, and Zod integration are separate future phases.**



## Overlay rules



1. Use `TaavDialog` for confirmations, modals, and contained tasks.

2. Use `TaavDrawer` for side panels, filters, and quick detail/edit flows.

3. Use `TaavPopover` for compact contextual panels.

4. Use `TaavDropdown` for menus and action lists.

5. Do not create app-local modal/drawer/dropdown styles.

6. Do not put business logic inside overlay primitives.



## Navigation rules



1. Use `TaavTabs` for section navigation inside pages.

2. Use `TaavStepper` for multi-step flows.

3. Do not create custom stepper/tabs inside app pages when TaavUI supports the needed pattern.

4. New variants must be added to TaavUI, not page-local CSS.



## Data Display + Chip rules



1. Use `TaavStatusBadge` for standard record/workflow statuses.

2. Use `TaavChip` for interactive tags, filters, and removable selected values.

3. Use `TaavBadge` only for simple non-interactive labels.

4. Use `TaavEmptyState` for empty/search/error/setup states instead of custom empty UI.

5. Use `TaavSkeleton` for loading placeholders.

6. Use `TaavFilterBar` for list/report/table filters.

7. Use `TaavTableShell` for basic table structure before introducing any data-grid engine.

8. Use `TaavKeyValue` for detail summaries and review panels.

9. Do not create app-local chip/status/table shell styles.

10. Do not put business logic inside data display primitives.

11. **Do not add TanStack Table until a real shared data-grid need is proven.**



## Layout Pattern Rules



1. Use `TaavPageShell` as the base wrapper for new page-level TaavUI screens.

2. Use `TaavPageHeader` for page titles, descriptions, meta, and actions.

3. Use `TaavSection` for grouped page content.

4. Use `TaavSettingsSection` for settings pages and configuration sections.

5. Use `TaavDetailHeader` for detail pages.

6. Use `TaavStickyActionBar` for save/cancel/step actions.

7. Use `TaavSidebarPanel` for live summaries, help panels, and secondary page panels.

8. Use `TaavStatsCard` for dashboard/report metrics.

9. Use `TaavProgressSummary` for progress/completion summaries.

10. Do not create app-local page header/section/sticky action/sidebar styles when TaavUI supports the needed pattern.

11. Do not put business calculations or business rules inside layout components.

12. New layout variants must be added to TaavUI, not page-local CSS.



## Tokens



Browse all tokens in TaavUI Lab → `/tokens`.



Key groups:



- Semantic: `--taav-surface`, `--taav-text-muted`, `--taav-border`

- Form: `--taav-input-height-md`, `--taav-input-focus-ring`, `--taav-form-label-md`
- Controls: `--taav-control-size-md`, `--taav-switch-track-w-md`, `--taav-segmented-height-md`, `--taav-option-card-selected-border`
- Overlays: `--taav-overlay-backdrop`, `--taav-dialog-width-md`, `--taav-drawer-width-md`, `--taav-dropdown-item-height-md`
- Navigation: `--taav-tabs-indicator`, `--taav-stepper-current`, `--taav-stepper-connector`
- Data display: `--taav-chip-height-md`, `--taav-table-row-height-comfortable`, `--taav-skeleton-bg`, `--taav-kv-label-size-md`
- Layout: `--taav-page-container-normal`, `--taav-section-padding-md`, `--taav-action-bar-height`, `--taav-sidebar-width-md`, `--taav-stats-value-md`, `--taav-progress-height-md`



## Out of scope (for now)



- Storybook

- Select / Checkbox / Radio / Switch / SegmentedControl / OptionCard — **done (Phase 2)**
- DatePicker

- React Hook Form / Zod bindings

- Table system

- Renaming `@repo/ui`


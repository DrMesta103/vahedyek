# TaavUI Developer Guidelines



TaavUI is the shared design system for DastRanj and VahedYek. It lives in `packages/ui` and is documented in `apps/taav-ui-lab`.

## References and principles

TaavUI's enterprise reference layer, design principles, and governance rules live in `packages/ui/TAAVUI_REFERENCES.md`.



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



## Field Block Rules


1. Use `TaavFieldBlock` for business forms that require a label above the field and fixed helper/tooltip text below the field.

2. Use `TaavFieldGrid` for two-column and responsive business form layouts.

3. Do not create app-local label/input/helper layouts when `TaavFieldBlock` supports the pattern.

4. The field tooltip is always-visible support text under the field, not a hover tooltip.

5. Use `required` for required fields instead of manually adding red stars.

6. Use `error` for validation messages instead of custom red helper text.

7. Do not put validation or business logic inside `TaavFieldBlock`.

8. Do not pass arbitrary Tailwind classes for visual changes.

9. If a new field layout is needed, add a variant to TaavUI instead of page-local CSS.

10. For limited, visible business choices (company type, contract type, simple status), use `TaavChoiceChipGroup` inside `TaavFieldBlock` — not `TaavSelect`.

11. Use `TaavSelect` only for long lists, dynamic lists, or when there are too many options to display as chips.


## Choice Chip Rules


1. Use `TaavChoiceChipGroup` when the user must choose one or more options from a small, visible list.

2. Use optional `label` and `description` props on `TaavChoiceChipGroup` for standalone fields; inside `TaavFieldBlock`, prefer the block label and pass `ariaLabel` to the group.

3. Use selected state instead of manually changing border/background.

4. Selected choice chips should have filled light teal/cyan background and no obvious neutral border.

5. In **single-select** mode, selected chips show fill only — **no check icon**.

6. In **multi-select** mode, each selected chip shows a check icon on the right side of the label in RTL.

7. Use `TaavChip` for tags/removable filters.

8. Use `TaavStatusBadge` for statuses.

9. Do not create app-local pill/chip styles for business forms.

10. Do not put business logic inside `TaavChoiceChipGroup`.

11. Do not pass arbitrary Tailwind classes for visual changes.

12. Do not use `TaavSelect` as the default pattern for limited business choice fields — prefer choice chips.


## Form controls rules



1. Use `TaavSelect` for long lists, dynamic lists, or when options cannot be shown as chips — not as the default for limited business choices.

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



## Business Sidebar Rules



1. Use `TaavBusinessSidebar` for business app side navigation instead of app-local sidebar styling.

2. Keep routing, tenant switching, auth, and permissions outside the component.

3. Pass navigation data as props (`items`, `quickActions`).

4. Pass active state from the app (`activeItemId` or `item.active`).

5. Do not hardcode DastRanj business logic inside TaavUI.

6. Do not create page-local sidebar variants.

7. If a new sidebar visual state is needed, add it to TaavUI tokens/props.

8. DastRanj migration must happen in a separate commit.

9. Use `placement="right"` for RTL business apps; anchor the sidebar in an app shell, not as a floating card.

10. Only the menu nav region scrolls — use `taav-scrollarea--subtle` tokens/classes, not default browser scrollbars.



## Module Card Rules



1. Use `TaavModuleCard` for ERP module entry cards, setup sections, workflow entry cards, and settings section navigation.

2. Use `TaavModuleCardGrid` for responsive card layouts.

3. Do not use raw `TaavCard` for module navigation when `TaavModuleCard` fits the pattern.

4. Do not put route detection, permission logic, completion calculation, or fetching inside `TaavModuleCard`.

5. Pass `status`, `disabled`, `locked`, `href`, and handlers from the app.

6. Use dark/light theme modes through tokens (`themeMode` or shell theme), not local CSS overrides.

7. Do not use external image assets for the default header pattern.

8. Do not create app-local clones of this card pattern.



### Difference from other cards



| Component | Purpose |
|-----------|---------|
| `TaavCard` | Generic primitive surface |
| `TaavModuleCard` | Business/ERP navigation card |
| `TaavStatsCard` | Metric/stat card |
| `TaavOptionCard` | Selectable form option card |



## Tokens



Browse all tokens in TaavUI Lab → `/tokens`.



Key groups:



- Semantic: `--taav-surface`, `--taav-text-muted`, `--taav-border`

- Form: `--taav-input-height-md`, `--taav-input-focus-ring`, `--taav-form-label-md`
- Field block/grid: `--taav-field-block-gap-md`, `--taav-field-block-label-md`, `--taav-field-block-support-color`, `--taav-field-grid-gap-md`
- Choice chip: `--taav-choice-chip-height-md`, `--taav-choice-chip-radius-pill`, `--taav-choice-chip-selected-bg`, `--taav-choice-chip-group-gap-md`
- Controls: `--taav-control-size-md`, `--taav-switch-track-w-md`, `--taav-segmented-height-md`, `--taav-option-card-selected-border`
- Overlays: `--taav-overlay-backdrop`, `--taav-dialog-width-md`, `--taav-drawer-width-md`, `--taav-dropdown-item-height-md`
- Navigation: `--taav-tabs-indicator`, `--taav-stepper-current`, `--taav-stepper-connector`
- Data display: `--taav-chip-height-md`, `--taav-table-row-height-comfortable`, `--taav-skeleton-bg`, `--taav-kv-label-size-md`
- Layout: `--taav-page-container-normal`, `--taav-section-padding-md`, `--taav-action-bar-height`, `--taav-sidebar-width-md`, `--taav-stats-value-md`, `--taav-progress-height-md`
- Business sidebar: `--taav-business-sidebar-width-default`, `--taav-business-sidebar-bg`, `--taav-business-sidebar-active-bg`, `--taav-business-sidebar-tenant-active-bg`
- Module card: `--taav-module-card-surface`, `--taav-module-card-header-height`, `--taav-module-card-header-pattern-geometric`, `--taav-module-card-grid-gap-md`, `--taav-module-card-border-selected`



## Out of scope (for now)



- Storybook

- Select / Checkbox / Radio / Switch / SegmentedControl / OptionCard — **done (Phase 2)**
- DatePicker

- React Hook Form / Zod bindings

- Table system

- Renaming `@repo/ui`


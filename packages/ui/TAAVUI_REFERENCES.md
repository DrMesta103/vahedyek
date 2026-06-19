# TaavUI References and Principles

## Why TaavUI exists

TaavUI is the internal design system for Persian RTL ERP/SaaS products across DastRanj and VahedYek.

It exists to:

- create a shared UI language across products
- prevent repeated app-local UI patterns
- standardize forms, tables, navigation, workflows, statuses, and business-facing layouts
- keep business components composable, documented, and predictable
- support gradual migration without a big-bang rewrite

TaavUI is not a marketing site kit and not a one-off component collection. It is the shared interface contract for data-heavy internal software.

## Reference systems

### IBM Carbon

**What it is good for**

- token discipline and system governance
- accessibility as part of the component contract
- strong patterns for data-heavy enterprise UI
- consistency across a wide component surface

**What TaavUI should learn**

- define tokens before variants
- document usage rules, not just component props
- support dense enterprise workflows without visual chaos
- treat accessibility and states as first-class requirements

**What TaavUI should not copy**

- IBM visual identity
- Carbon-specific naming and information architecture
- desktop-heavy assumptions that do not fit Persian ERP usage

### Ant Design

**What it is good for**

- breadth of enterprise components
- mature admin/dashboard patterns
- strong forms and table ergonomics
- practical React ecosystem adoption

**What TaavUI should learn**

- document common admin patterns, not just low-level controls
- make tables, filters, and forms work together as a system
- provide predictable variants and dense screen support

**What TaavUI should not copy**

- Ant visual language
- API sprawl without strong guardrails
- pattern decisions that assume LTR by default

### SAP Fiori / Fundamental

**What it is good for**

- ERP workflows and enterprise object models
- object pages, list reports, and process-heavy screens
- structured forms and operational detail layouts

**What TaavUI should learn**

- treat list-report and object-detail screens as first-class UX patterns
- support review, approval, audit, and workflow states explicitly
- prefer predictable page structure over decorative freedom

**What TaavUI should not copy**

- SAP-specific enterprise vocabulary
- heavyweight workflow assumptions for every screen
- visual identity or rigid object model naming

### Fluent UI

**What it is good for**

- productivity application patterns
- accessibility and keyboard support
- panels, command surfaces, and task-oriented layout

**What TaavUI should learn**

- make command surfaces and secondary panels consistent
- keep keyboard navigation practical for long forms and dense screens
- support read/edit/review flows with clear action hierarchy

**What TaavUI should not copy**

- Microsoft visual branding
- desktop productivity metaphors where they do not fit ERP flows
- over-generalized APIs that weaken system discipline

### Atlassian Design System

**What it is good for**

- workflow clarity
- status communication
- structured product patterns for ongoing work

**What TaavUI should learn**

- make status, progress, and workflow cues explicit
- define reusable product patterns for operational collaboration
- keep component documentation tied to real usage contexts

**What TaavUI should not copy**

- collaboration-product assumptions that do not map to ERP
- Atlassian visual identity
- Jira-style density patterns when they reduce Persian readability

### GOV.UK Design System

**What it is good for**

- clear forms
- helper text and validation guidance
- plain language accessibility
- trustworthy, low-ambiguity service UX

**What TaavUI should learn**

- write clear helper and error text rules
- keep validation hierarchy explicit
- reduce ambiguity in complex business forms
- document accessibility and usability in plain language

**What TaavUI should not copy**

- GOV.UK brand and governmental visual style
- public-service assumptions for private ERP workflows
- oversimplified interaction patterns where enterprise density is required

## TaavUI design principles

1. **RTL-first**  
   TaavUI starts from Persian RTL layout, alignment, spacing, icon placement, and navigation flow.

2. **Persian enterprise readability**  
   Dense screens are allowed, but readability wins over compression. Labels, helper text, tables, and status cues must remain legible in Persian.

3. **Token-first styling**  
   Visual decisions should be expressed through design tokens and named variants, not app-local Tailwind improvisation.

4. **Controlled component APIs**  
   Components expose predictable props such as `variant`, `size`, `tone`, `density`, `width`, and `state`.

5. **No arbitrary app-local styling**  
   Repeated styling problems should be solved in TaavUI, not copied page by page in apps.

6. **Business logic outside UI primitives**  
   Primitives and shared components render UI states. They do not own auth, routing, fetching, tenant logic, or calculations.

7. **Data-driven business components**  
   Business components accept data and configuration props and compose lower layers.

8. **Accessibility by default**  
   Focus, keyboard flow, semantic labeling, contrast, and state communication are part of the base contract.

9. **Keyboard navigability**  
   ERP users often work quickly and repeatedly. Keyboard use must be supported across forms, filters, overlays, and navigation.

10. **Clear loading, empty, and error states**  
    Enterprise UI should never leave a blank area unexplained. Every data pattern needs stable non-happy-path states.

11. **Stable layout for long forms**  
    Long business forms should not jump, collapse unpredictably, or shift helper/error areas.

12. **High-density but readable screens**  
    TaavUI should support operational density without becoming cramped, noisy, or visually inconsistent.

13. **Dark and light theme support**  
    Theme support is part of the system, not an afterthought.

14. **Gradual migration**  
    TaavUI should enable page-by-page adoption across DastRanj and VahedYek without forcing rewrites.

## Component classification

### 1. Tokens

**Belongs here**

- color, spacing, radius, typography, elevation, motion, z-index
- semantic aliases for surfaces, text, borders, status, focus, and density
- component-level tokens only when they map back to system rules

**Does not belong here**

- product-specific business constants
- route-specific spacing tweaks
- hardcoded app colors for one page

### 2. Primitives

**Belongs here**

- buttons, cards, badges, tooltip-level helpers
- low-level visual building blocks with minimal product assumptions

**Does not belong here**

- domain logic
- data fetching
- workflow calculations

### 3. Forms

**Belongs here**

- field wrappers, field layout, labels, messages, helper structures
- repeatable form composition patterns

**Does not belong here**

- domain-specific validation rules
- app-local arrangement that only works for one screen

### 4. Form Controls

**Belongs here**

- input, textarea, select, checkbox, radio, switch, segmented control, choice chip, option card

**Does not belong here**

- route-aware behavior
- business calculations
- page-specific style hacks

### 5. Overlays

**Belongs here**

- dialog, drawer, dropdown, popover
- focus handling, layering, close behavior, surface variants

**Does not belong here**

- domain workflows hidden inside the overlay primitive
- fetch/auth side effects

### 6. Navigation

**Belongs here**

- tabs, steppers, sidebar structures, navigation shells
- active/selected states and directional behavior

**Does not belong here**

- route ownership
- permission logic
- tenant/business policy

### 7. Data Display

**Belongs here**

- table shell, filter bar, pagination, key-value, chip, status badge, empty state, skeleton

**Does not belong here**

- backend sorting/filtering logic
- entity-specific calculations
- one-off report rendering rules

### 8. Layout Patterns

**Belongs here**

- page shell, page header, settings section, detail header, sidebar panel, sticky action bar, stats card, progress summary
- repeatable enterprise page structure

**Does not belong here**

- product-specific workflow math
- page-only business branches

### 9. Business Components

**Belongs here**

- shared business-facing assemblies such as `TaavBusinessSidebar`
- reusable enterprise patterns with stronger product semantics

**Does not belong here**

- route ownership
- fetching/auth/tenant resolution
- business calculations that vary by app

### 10. App-specific composition

**Belongs here**

- final page assembly inside DastRanj or VahedYek
- product flows, route logic, fetching, mutations, permissions, tenant handling

**Does not belong here**

- repeated base styling that should live in TaavUI
- shadow design-system forks per app

## Enterprise ERP UX patterns

TaavUI should explicitly support these recurring patterns:

### List Report

- filter bar + table/list + pagination + empty/error/loading states
- bulk or row actions clearly separated

### Object Detail Page

- stable header, summary facts, sections, related records, timeline/history, actions

### Settings Section

- grouped controls, descriptive copy, clear save/cancel behavior, safe defaults

### Wizard / Stepper Flow

- step navigation, progress visibility, review step, sticky action bar

### Form Grid

- responsive two-column default for desktop, one-column fallback for narrow widths

### Filter Bar

- compact, persistent, clear reset/apply behavior, state visibility

### Status Badge

- semantic state language for workflow, finance, operations, and review

### Approval / Review Summary

- key-value review blocks, warnings, outstanding issues, final decision actions

### Sidebar Navigation

- app-level orientation, clear active section, dense but legible grouping

### Tenant-aware UI

- visible tenant context in app shells or business patterns, but not tenant logic inside primitives

### Audit / History Panels

- secondary panels or sections for changes, notes, timeline, and provenance

### Empty and loading states

- context-specific empty, no-result, loading, and recoverable error treatments

### Validation and helper text

- stable support text below fields, field-level errors, top-level summaries when needed

## Form design rules

- Labels should be visible and persistent, typically above the field in business forms.
- Required and optional status must be explicit and consistent.
- Helper text should have a fixed place under the field, not appear only on hover.
- Errors should appear first at the field level; complex forms may also use a summary at the top.
- Use two-column responsive form grids where the task benefits from density.
- Choice chips are valid for short, scannable selections.
- Inputs, selects, and textareas should share aligned rhythm and state behavior.
- Persian text and numeric content must remain readable in RTL contexts.
- Do not rely on placeholder-only labels.
- Use `TaavFieldBlock` for business form fields that need consistent label, field, and support structure.

## Table and data design rules

- Use `TaavTableShell` for shared table layout, column framing, and table-adjacent documentation patterns.
- Use a real DataGrid only when shared needs justify sorting, virtualization, pinning, dense interaction, or advanced keyboard behavior.
- Pagination rules should remain predictable and visible near the dataset.
- Filter bars should be compact, persistent, and aligned with list-report workflows.
- Every table pattern needs empty, no-results, loading, and error states.
- Row actions should be discoverable without overpowering the primary data.
- Status badges and chips should encode state consistently and not be purely decorative.

## Business component rules

- Business components must be data-driven.
- Route, auth, tenant, and fetching logic must stay outside TaavUI business components.
- Business components compose primitives, forms, layout, navigation, and data-display layers.
- Visual presets are allowed; business calculations are not.
- `TaavBusinessSidebar` is the reference example: shared shell, app-supplied data and active state.

## API design rules

- Prefer prop families such as `variant`, `size`, `tone`, `density`, `width`, and `state`.
- Avoid raw `className` as the primary styling API.
- Escape hatches should be explicit, such as `unsafeClassName` or slot-specific escape hatches.
- Use typed option arrays for grouped controls and structured selections.
- Support controlled and uncontrolled usage where it makes sense.
- Keep entrypoints server-safe when possible, with client-only splits where required.

## Component creation checklist

Before adding a new TaavUI component, answer all of the following:

1. Which layer does it belong to?
2. Is it reusable across DastRanj and VahedYek?
3. Does an existing TaavUI component already solve it?
4. Which reference systems solve a similar pattern?
5. What variants, sizes, densities, and states are required?
6. What are the loading, disabled, empty, and error states?
7. What is the accessibility and keyboard behavior?
8. What are the RTL requirements?
9. Which tokens are needed or missing?
10. What TaavUI Lab documentation page is required?
11. What explicitly does not belong inside this component?

## Summary

TaavUI should grow as a governed enterprise design system for Persian RTL software, not as a pile of isolated components. The goal is consistent, data-heavy, accessible ERP UI with clear layering, controlled APIs, and gradual adoption across products.

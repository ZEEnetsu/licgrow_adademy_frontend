# Admin UI guidelines

The rules for building screens in the LICPro admin console (`/admin`). They exist so every page looks, moves and behaves like the landing page and like every other admin page — without anyone re-deciding colours, spacing or loading states.

If a rule here gets in your way, change the rule here first (in the same PR), then the code.

---

## 1. Lineage and scope

- The admin is built on the **landing page's design language**, using the **cool half of its palette**: ink, plum and lavender for type and the accent, sage and mint for highlights, and ink-tinted blue-grey grounds. Plus Jakarta Sans headings, DM Sans body, the expo-out motion curve. See `src/index.css` (MARKETING PALETTE) and `src/pages/home/`.
- **The app is meant to be calm.** People look at it all day, so ember orange is reserved for **attention counts** (the rail's pending badge and dot, the notification count and unread dot) and the **warm pool inside the ink rail**. It is never used for buttons, links, selection, meters or decoration.
- Colours reach the app through **theme tokens** in `src/styles/theme.css`, which are shared with the **student portal**. Changing a token changes both portals.
- The building blocks live in **`src/components/admin/`** (import from `src/components/admin/index.js`). Shell pieces (rail, header, command palette) live in `src/pages/Admin/shell/`.
- The kit never imports from `src/pages/`.

## 2. Design language

### Palette roles

| Role | Token / utility | Use for |
|---|---|---|
| Page | `bg-bg` | the canvas (pale blue-grey / cool ink-slate) |
| Card | `bg-surface-elevated` | anything that floats: cards, tables, menus, modals |
| Recessed | `bg-surface-muted` | wells inside a card, tracks, footers |
| Hover | `bg-surface-hover` | a row or item under the pointer |
| Text | `text-text-primary`, `text-text-muted` | everything readable |
| Accent text | `text-accent` | links, active labels — plum (light) / lavender (dark), AA on every surface |
| Accent fill | `bg-accent-solid` + `text-accent-solid-contrast` + `shadow-accent` | primary buttons, switches, the current step — ink (light) / lavender (dark) |
| Accent wash | `bg-accent-muted` + `text-accent` | tonal buttons, accent badges |
| Meter fill | `bg-accent-vivid` | progress bars, meters, bars — sage (light) / mint (dark); **never under or as small text** |
| Tints | `bg-tint-lavender`, `bg-tint-mint`, `bg-tint-slate` | icon chips, eyebrows, empty states (`tint-peach` / `tint-sand` are old aliases of lavender / slate) |
| Status | `success`, `warning`, `danger` (+ `-muted`) | meaning only: live / waiting / blocked |
| Brand ink | `bg-brand` + `text-brand-contrast` | theme-invariant surfaces: the rail and toasts |
| Focus | `focus-ring` utility (`--ring`) | every interactive element |

**Never** write a literal colour (`text-red-500`, `#fff`, `bg-zinc-800`) in admin code. The only exception: the static marketing palette (`text-cream`, `text-mint`, `text-lavender`, `text-rose`, `text-ink`) on **theme-invariant brand surfaces** (the rail, toasts), because those stay ink in both themes. `bg-peach` / `bg-ember` / `bg-ember-deep` are allowed **only for attention counts**.

### Type

- Headings and big figures: `font-display` (Plus Jakarta Sans), `font-extrabold`, tight tracking. Page titles use `.h-display`.
- Body: DM Sans (the default). 15px for descriptions, 14px (`text-sm`) for table cells and controls, 13px for secondary lines.
- Small labels: the `.caps` utility (uppercase, 0.16em tracking), 10–11px, `font-bold`, `text-text-muted`.
- Numbers in tables, counters and figures: `tabular-nums`.
- No Caveat or Playwrite in the admin.

### Radius scale

| Radius | Use |
|---|---|
| `rounded-full` | buttons, badges, tabs, search, avatars, icon buttons |
| `rounded-xl` / `rounded-2xl` | icon chips, menu items, inputs (`rounded-2xl`), callouts |
| `rounded-[24px]` | cards, tables, stat cards, empty states |
| `rounded-[28px]` | modals, the rail |

### Elevation

- `shadow-elevate` — resting cards (light: the landing's `shadow-card`; dark: an inset highlight plus a black shadow).
- `shadow-elevate-hover` — a card being hovered (the landing's `shadow-lift`).
- `shadow-pop` — menus, modals, the command palette, tooltips.
- `shadow-accent` — the soft glow under a primary button (ink in light mode, lavender in dark).
- Cards also carry a hairline: `ring-1 ring-inset ring-border/70`.

### Textures

`grain-overlay`, `mesh-navy-deep` and the rail's ember and mint glow pools are for **the rail only**. Content surfaces stay flat. The rail's active item is a frosted pill (`bg-white/10`) with a mint bar, never a coloured fill.

## 3. Theming and dark mode

- Dark mode is a class (`.dark` on `<html>`), set before first paint by `index.html` and kept in sync by `useThemeSync()`. The switch is `ThemeToggle`, which plays a View Transition circular reveal.
- **Tokens only.** Anything built from tokens follows the theme for free. You should almost never need a `dark:` variant; if you do, you probably want a token.
- Never set `color-scheme` on an element (`[color-scheme:dark]`). The root already follows the theme, which is what makes native date pickers and scrollbars match.
- **Adding a token:** (1) add it to both blocks in `theme.css`; (2) map it in the `@theme inline` block in `index.css`; (3) if a chart reads it, add it to `FALLBACK` in `useThemeTokens.js`; (4) add its pairs to `scripts/theme.check.mjs`.
- **Retuning a token:** run `node scripts/theme.check.mjs src/styles/theme.css`. It checks 60 pairs per theme against WCAG AA (4.5:1 text, 3:1 rings and input edges) and the FALLBACK mirror, and exits non-zero on a failure.

## 4. Layout principles

### Shell anatomy

```
┌───────────┐ ┌──────────────────────────────────────────────┐
│ ink rail  │ │ header: breadcrumbs · ⌘K · bell · account    │
│ (sticky,  │ ├──────────────────────────────────────────────┤
│ 256 / 76) │ │ #admin-main (the only scroller)              │
│           │ │   max-w-[1400px] · gap-6 lg:gap-8            │
│           │ │   PageHeader                                 │
│           │ │   Toolbar                                    │
│           │ │   content                                    │
│           │ │   Pagination                                 │
└───────────┘ └──────────────────────────────────────────────┘
```

- The window never scrolls; `#admin-main` does. It is reset to the top and focused on every route change.
- The rail is inset 8–12px from the window edge, like the sign-in page's panel.

### Page anatomy

Every page is, top to bottom:

1. **`PageHeader`** — the page's only `<h1>`. Eyebrow (section name), title, optional `meta` badges, one-to-two-line description, actions. Detail pages add `back`.
2. **`Toolbar`** (lists) — `SegmentedTabs` / filters on the left, `SearchInput` on the right.
3. **Content** — `DataTable`, a `CardGrid`, or `Panel`s.
4. **`Pagination`** (lists).

### Spacing

- Between page sections: the page container's `gap-6 lg:gap-8`. Don't add margins between top-level blocks.
- Inside cards: `p-5 sm:p-6` (`Card padding="md"`). Between items in a card: `gap-3`–`gap-4`. Between a label and its control: `gap-1.5`.
- Grids: `gap-4` for cards, `gap-3` for small tiles.

### Breakpoints

- `< 640px` phone: modals become bottom sheets, toolbars stack.
- `< 768px` (`md`): the rail becomes a drawer, tables become stacked cards.
- `lg` (1024px): low-priority table columns appear (`hideBelow: "lg"`), the header search pill appears.
- Layouts must work from **360px** wide with no horizontal page scroll.

### Actions

- **One primary action per view** (`variant="primary"`). Everything else is `secondary`, `tonal` or `ghost`.
- Page-level actions go in `PageHeader.actions`. Row-level actions go in the row's `RowActions` (⋯) menu, except a single obvious positive action (Approve), which may sit inline as a `tonal` button.
- Destructive actions are never the most prominent thing on a page; they live in ⋯ menus or as `dangerSoft`.

### Z-index scale

| Layer | z |
|---|---|
| Sticky table header | 2 |
| Header | 30 |
| Rail / drawer (scrim 30) | 40 |
| Dropdown menus | 50 |
| Modals | 60 |
| Combobox listbox (inside modals) | 65 |
| Toasts | 70 |
| Tooltips | 80 |

## 5. Component catalogue

| Component | Use when | Don't |
|---|---|---|
| `Button` | any text action. `variant`: primary · secondary · tonal · ghost · danger · dangerSoft. `size`: sm · md · lg. `icon`, `iconRight`, `loading`, `to`/`href` | build a `<button>` with your own classes |
| `IconButton` | icon-only actions; `label` is required (aria-label + tooltip) | use an icon without a label |
| `Tooltip` | spelling out an icon or a collapsed item | put information there that isn't in the accessible name |
| `StatusBadge` | any entity status — pass `status`, it picks label/tone/icon from `status.js` | make a local `STATUS_TONE` map |
| `SegmentedTabs` | view/filter switches (All / Active / Suspended); needs a unique `layoutId` | use it for navigation between pages |
| `Field` + `Input` / `Textarea` / `Select` / `DateInput` / `Checkbox` | every form field; `Field` wires label, hint, error and aria. `Select size="sm"` for an inline picker in a table row | put labels beside inputs; style an input yourself |
| `FormError`, `FormActions`, `fieldIssues(error)` | form-level API error, the button row, per-field API errors | render `error.message` raw (use `getUserMessage`) |
| `Modal` | forms and dialogs; `size` sm–xl; `busy` blocks closing | portal your own overlay |
| `useConfirm()` | **every destructive or irreversible action**; `onConfirm` runs the action in the dialog, `errorMessage(err)` words a failure | `window.confirm`, or inline "are you sure" rows |
| `useToast()` | the outcome of every action (success, failure, undo). Bottom-right normally; moves to the top while a modal is open so it never covers the modal's buttons | silent success |
| `PageHeader`, `Eyebrow` | the top of every page | a second `<h1>` |
| `Card`, `Panel`, `CardGrid` | grouping content; `Panel` adds a title row. `CardGrid cols` 2/3/4 already account for the rail (two-up from `lg`, three-up from `xl`) | ad-hoc `rounded-3xl bg-…` divs |
| `StatCard` | headline numbers; plain (`tone="default"`) with a `chip` tint: lavender · mint · slate | tinted or ink cards in a dashboard row — keep the row calm |
| `DataTable`, `RowLink` | lists of records | hand-built row lists |
| `RowActions`, `DropdownMenu` | the ⋯ menu; the account menu | lowercase text-link actions |
| `Toolbar`, `ProgressLine` | the row above a list | a bare "Loading…" line |
| `SearchInput` | list search (controlled by `useListParams`) | an unwired search box |
| `Pagination` | under every paginated list; `itemLabel` is the plural noun (singular derived), or `[one, many]` | client-side slicing |
| `EntityCombobox` | picking a server record (batch, course, test). Has its own clear button (`onChange(null)`); its ref is the input | a `<select>` of the first 20 records; a second clear button beside it |
| `Skeleton*`, `EmptyState`, `Callout`, `LoadError` | loading, empty, inline notices, load failures. `Callout live` only for messages caused by an action; `LoadError` words a 403 as "no access" and drops the retry | plain `<p>` states |
| `Avatar` | people | stock photos |
| `Switch` | settings that apply immediately (enrollment open). `busy` keeps it focusable; pass `aria-describedby` to explain a disabled state | form fields that wait for Save |
| `ThemeToggle` | the rail footer and the mobile header | another theme switch |

## 6. Lists and data

### The contract

Every list page uses **`useListParams`**:

```js
const list = useListParams({ filters: { status: null }, sorts: SORTS, defaultSort: "createdAt:desc" });
const query = useGetThingsQuery(list.args);
useClampPage(query.data?.meta, list.page, list.setPage);
```

- **The URL is the state** — `?page`, `?q`, `?sort` and each filter. Reloads, links and Back all work. Defaults are left out of the URL.
- **Whitelist filter values** with `allowed: { status: [...] }` so a stale or hand-edited URL falls back to the default instead of reaching the API.
- Changing a filter, sort or search **replaces** history and resets to page 1. Changing the page **pushes**.
- **Search** is debounced (300ms) and only sent when empty or **≥ 2 characters** (the API rule). One request per pause, not per keystroke.
- **Sorts** must be in the endpoint's whitelist (see `api-contracts/`). Unknown values fall back to the default.
- **Page size:** 20 for tables, 24 for card grids (divisible by 2, 3 and 4). Always pass `page` and `limit`, and always render `Pagination` from `meta`. **Never** filter, group or count a paginated response on the client — the numbers would be wrong past page one. Ask the server (`status`, `kind`, `q`) instead.

### Loading states

- **First load:** skeletons shaped like the content (`DataTable isLoading`, `SkeletonCard`).
- **Refetch / page change / filter change:** keep the previous rows on screen, dim them (`DataTable isFetching`), and show the toolbar's `ProgressLine`. Never blank a list that already has data.
- **Error:** `LoadError` with a retry (`refetch`).
- **Empty:** an `EmptyState` that says *why* and offers the next step. Distinguish "nothing yet" from "nothing matches these filters".

### Row actions

- Use **`usePendingIds()`** and pass `pendingIds` to `DataTable`. Only the affected row goes busy; never one `busy` flag for the whole list.
- Rows are memoised. Keep `columns` in `useMemo` and handlers in `useCallback` (take the row/id as an argument) so unchanged rows don't re-render.
- Make the primary cell a `RowLink` so the whole row opens the record (and middle-click still works). The actions cell needs `className: "relative z-10"`.

### Prefetching

- Prefetch a record's detail on row hover/focus: `api.usePrefetch("getThing")` with `{ ifOlderThan: 60 }`, passed as `onRowPrefetch`.
- Prefetch the next page when `meta.hasNext`.

### Optimistic updates

Use them for cheap, reversible, high-frequency actions: **reordering** (units, chapters, questions) and **pinning**. Patch the cache with `updateQueryData` in `onQueryStarted`, and undo the patch if the request fails. Everything else is pessimistic, with a toast.

### Big lists

- Paginated lists never need virtualisation (the API caps a page at 100).
- Unbounded lists of heavy items (a test's questions) get the `cv-auto` utility (`content-visibility: auto`) and `memo` first.
- Reach for a virtualiser only when one rendered list can exceed ~200 rows (or ~100 rows of 50+ DOM nodes each) **and** `cv-auto` has been measured as not enough.
- Images in lists: `loading="lazy" decoding="async"` with explicit `width`/`height`.

### Pickers

More than ~10 options from the server → `EntityCombobox` with a debounced `q`. Short static lists (roles, attempt limits) → `Select`.

## 7. Feedback and destructive actions

- **Confirm** every action that deletes, archives, revokes, suspends, deactivates or can't be undone. Use `useConfirm` with `onConfirm` so the dialog shows progress and errors itself.
- **Confirm copy:**
  - Title: the verb and the object as a question — "Archive IC-38 Aug cohort?"
  - Description: the consequence in plain words, plus what is *kept* — "Learners lose access. Their scores are kept."
  - Button: the verb again — "Archive batch". Never "OK" or "Yes".
- **Error copy:** `getUserMessage(error)` shows the contract's wording for every code a module doc marks user-safe (they are all listed in `src/app/apis/apiError.js`). When a contract adds a user-safe code, add it there — don't patch copy per page.
- **Toasts:** after every action. Success names the thing ("Rahul Verma is suspended"). Failure says what failed and uses `getUserMessage(error)`. Offer an undo action where one exists.
- **Inline errors** (`Field error`, `FormError`) are for forms. Toasts are for actions.
- Never leave a `console.log` in admin code.

## 8. Micro-interactions

All timings match the landing page. Expo-out (`ease-out-expo`, `EXPO` in `motion/primitives.js`) for anything that arrives; material (`ease-material`, `EASE`) for quick UI responses.

| What | Timing |
|---|---|
| Colour, background, ring hovers | 150–200ms, `ease-material` |
| Buttons and icon buttons | 300ms `ease-out-expo`; press `scale(0.98)` (icon buttons `0.9`); trailing icon nudges right 2px |
| Cards and arrow chips | 500ms `ease-out-expo`; lift `-translate-y-0.5` + `shadow-elevate-hover`; arrow chip rotates 45° |
| Tab, nav and toggle pills | spring, stiffness 380, damping 32 (`layoutId`) |
| Menus, tooltips, comboboxes | in 160ms (opacity, scale 0.96 → 1, y −4 → 0) EXPO; out 120ms |
| Modal | backdrop 200ms; panel 350ms EXPO (scale 0.96, y 12); phone sheet spring 400/40; exit ~200ms |
| Toasts | spring 500/35 (y 16, scale 0.95); stacked with `layout`; exit 180ms |
| Route change | content fades and rises 8px, 350ms EXPO, enter only |
| Page sections (dashboard) | rise 14px, 500ms EXPO, 60ms stagger, first paint only |
| Count-up numbers | 1200ms ease-out on mount; 400ms tween when the value changes (`useCountTo`) |
| Bars and meters | `scaleX` 0 → 1, 900–1100ms EXPO, short stagger |
| Skeleton shimmer | 1.4s linear |
| Progress line | appears after 150ms; 1.1s loop |
| Refetch dim | opacity 0.7 after 100ms |
| Rail collapse | width 500ms EXPO |
| Theme switch | circular reveal from the pointer, 550ms EXPO |
| Bell | rings once when the unread count goes up |
| Focus ring | instant — never animate focus |

Rules:

- Animate `transform` and `opacity` (and `width` only for the rail). Never animate layout properties like padding or margin.
- Don't animate on refetch. Entrance motion is for first paint and for user-initiated changes.
- Nothing loops forever except the brand mark, skeletons, the pending pulse and spinners.

## 9. Reduced motion

- The shell wraps everything in `MotionConfig reducedMotion="user"`: framer-motion drops transforms and layout animation and keeps opacity.
- The global CSS rule in `index.css` zeroes CSS transitions and animations.
- `useCountTo` jumps to the final value, the theme switch skips the View Transition, and the bell doesn't ring.
- Test every screen with "Emulate CSS prefers-reduced-motion: reduce".

## 10. Accessibility

- **Focus:** every interactive element shows `focus-ring` (or `focus-visible:outline-*` on brand surfaces). Never `outline-none` without a replacement.
- **Keyboard map:**

  | Key | Action |
  |---|---|
  | `/` | focus the list search |
  | `⌘K` / `Ctrl K` | command palette |
  | `Esc` | close the menu, modal, drawer or palette; clear search |
  | arrows, `Home`, `End` | move within tabs, menus, comboboxes, the palette |
  | letters | jump within a menu (typeahead) |

- **ARIA patterns:** tabs (`role=tablist`), menu button (`role=menu`), combobox with listbox (`aria-activedescendant`), dialog (`aria-modal`, labelled), switch (`role=switch`), live toasts (`status` / `alert`). Use the kit and you get these.
- **Hit targets:** at least 36px (icon buttons are 32–40px; rows are full-width links).
- **Colour is never the only signal:** badges carry words; legends carry values; the pending dot has text beside it.
- **Live regions:** pagination counts and toasts are announced; errors use `role="alert"`.
- **One `<h1>` per page** (from `PageHeader`); `Panel` titles are `<h2>`.
- **Every input has a label** (`Field`). Icon-only buttons have `label`.
- **Contrast:** the tokens are checked by `scripts/theme.check.mjs`. Don't put text on `accent-vivid`, and don't lower opacity on text below the tokens' values.

## 11. Icons

- One set: `src/components/ui/Icon.jsx` (24px grid, stroke, `currentColor`). Size with `h-4 w-4` (16) / `h-[18px] w-[18px]` / `h-5 w-5` (20).
- **No emoji** (🔔 📌) and **no unicode glyphs as icons** (↑ ↓ ✎ ✕ ▾ ▸ ☰ ←). They don't follow the theme or the font, and screen readers read them out.
- **No `<img>` SVGs for UI icons.** They can't follow the theme.
- **Adding an icon:** add one `d` path to `PATHS`, drawn on the 24px grid with round caps and joins. Lucide's geometry fits.

## 12. Code conventions

- **File locations:**
  - Kit: `src/components/admin/`.
  - Shell: `src/pages/Admin/shell/`.
  - Pages: `src/pages/Admin/pages/<area>/`.
  - Shared query args: `src/pages/Admin/queries.js`.
  - Formatting: `src/components/admin/format.js`.
- **Props vocabulary:** `variant` (visual weight), `size` (`sm`/`md`/`lg`), `tone` (semantic colour). Booleans read as adjectives (`loading`, `interactive`, `compact`).
- **Class strings must be complete and static** (Tailwind can't see `bg-${tone}`). Map tones to full class strings in a constant.
- **Use `cx()`** to join classes.
- **Fast Refresh:** a `.jsx` file exports components only. Constants and hooks shared across files go in `.js` files (`status.js`, `feedbackContext.js`).
- **react-hooks v7 rules** (this repo enables the React Compiler lint set):
  - No synchronous `setState` in an effect. Derive the value during render instead (see the search draft in `useListParams`).
  - No reading `ref.current` during render.
  - No `Date.now()` / `new Date()` in render. Take a value once with `useState(() => new Date())`.
- **Permissions:**
  - Gate UI with `<Can perm>` or `useSelector(selectCan)`.
  - Hide what the admin can't do; don't disable it without a reason shown.
  - The server still enforces.
- **Errors:** user-facing text always goes through `getUserMessage(error)`.
- **Forms:**
  - Keep local state per form.
  - Validate the obvious on the client (dates in order, required fields).
  - Show server `details` per field with `fieldIssues(error)`.
- **Create flows:**
  - Open in a `Modal` driven by `useModalParam("new")` (`?new=1`), so the command palette and dashboard can link to them.
  - On success: toast, close, navigate to the new record.

## 13. Performance

- Memoise table rows and keep their props stable (see §6).
- Prefetch on intent (row hover/focus, next page).
- Share query args across components (`queries.js`) so one request serves several widgets.
- Poll only cheap endpoints (counts), at ≥ 60s.
- Don't import heavy libraries into the admin for one widget. Prefer HTML/CSS bars and meters to canvas charts for simple breakdowns: they are lighter, accessible as text, and theme for free.

## 14. PR checklist

- [ ] `npm run lint` and `npm run build` pass with no new warnings.
- [ ] `node scripts/theme.check.mjs src/styles/theme.css` passes (if you touched tokens).
- [ ] Checked in **light and dark**.
- [ ] Checked at **360px**, 768px and 1440px — no horizontal scroll; tables stack; modals become sheets.
- [ ] Keyboard only: reach and operate everything; focus is visible; Esc closes things and returns focus.
- [ ] Reduced motion emulated: nothing essential is lost.
- [ ] Loading (skeleton), refetch (dim), empty (with next step) and error (with retry) states all exist.
- [ ] Destructive actions confirm; every action toasts.
- [ ] Lists keep state in the URL, paginate from `meta`, and never filter paginated data client-side.
- [ ] No literal colours, emoji, unicode icons, `<img>` icons, `console.log` or `[color-scheme]`.
- [ ] Permissions gate what the admin can't do.
- [ ] One `<h1>`, labelled inputs, labelled icon buttons.

# Nitwebs Development Standards Checklist

Always adhere to the following checklist when making any code or UI edits to this project:

## 1. Visual & Layout Consistency
- `[ ]` **Fixed Vertical Grid Lines**:
  - Keep vertical border lines running continuously down the screen margins.
  - **Rule**: Do not add opaque background classes (like `bg-background`, `bg-white`) on main `<section>` tags. Keep section backgrounds transparent so they do not block the underlying `z-0` fixed `GridLines` overlay.
  - If a background tint is necessary, use semi-transparent styles (e.g. `bg-surface/30` or `bg-surface/60`).
- `[ ]` **Horizontal Grid Dividers**:
  - Every main page section must start with a horizontal line and corner plus glyphs (`+`).
  - **Rule**: Always include `<GridDivider />` at the top of a new `<section>` element.
- `[ ]` **Content Max Width**:
  - Standardize column margins and layouts to align with `max-w-6xl mx-auto px-6` container structure.

## 2. Typography & Fonts
- `[ ]` **Headings & Titles**:
  - Always use `font-headline` (which resolves to "Cal Sans") for section headings, titles, and main callouts.
- `[ ]` **Body Copy & Form Labels**:
  - Always use `font-sans` (which resolves to "Inter") for descriptions, input placeholders, forms, dropdowns, and buttons.
- `[ ]` **Font Sizes**:
  - Standard Section Heading: `text-3xl sm:text-4xl md:text-5xl font-normal font-headline`
  - Body Text: `text-secondary-text text-sm sm:text-base leading-relaxed`
  - Inline Watermark Numbers: `text-4xl font-bold font-headline select-none`

## 3. Styling & Color Tokens
- `[ ]` **Backgrounds**:
  - Use custom HSL colors where possible: `var(--background)` for body, `var(--surface)` for panels.
- `[ ]` **Text Colors**:
  - Dark bold text: `text-foreground`
  - Muted secondary text: `text-secondary-text`
  - Bright highlights: `text-primary` (purple)
- `[ ]` **Interactive Elements**:
  - Form validation boxes: use high-contrast red alerts (`bg-red-50 text-red-600 border-red-100`).
  - Active button states: solid purple background (`bg-primary`) with white text and smooth shadow scaling (`hover:opacity-90 shadow-md hover:shadow-lg`).

## 4. Minimalist Design & Tight Spacing Checklist
- `[ ]` **Sleek Heading Weights**:
  - Keep card headings, panel titles, and section headlines minimal (`font-normal font-headline`). Avoid heavy `font-bold` or `font-semibold` on card titles.
- `[ ]` **Tight List & Item Spacing**:
  - Keep vertical gaps between bullet points and list links small and compact (`gap-y-1.5` or `gap-y-2`, `leading-snug` / `leading-normal`). Avoid wide gaps like `gap-y-4` or loose line-heights.
- `[ ]` **Subtle Lead Text**:
  - In bullet lists, use `font-medium text-foreground` for lead terms rather than heavy `font-bold`.
- `[ ]` **Clean Card Padding**:
  - Keep panel and card inner padding compact (`p-5 sm:p-6`) to prevent bulky cards and retain a refined, modern aesthetic.


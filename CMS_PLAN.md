# Nitwebs — Full CMS Plan
**Technical Lead Spec | Agent Implementation Guide**

---

## 1. Project Overview

### Tech Stack
| Layer | Tech |
|---|---|
| Frontend | React 19 + Vite 8 + TypeScript + Tailwind CSS v4 |
| Animations | Framer Motion (`motion/react`) |
| Routing | React Router DOM v7 |
| Smooth Scroll | Lenis |
| Icons | `lucide-react` + `react-icons/si` + `react-icons/fa6` |
| Backend | Express.js (ESM) + Mongoose + MongoDB |
| Auth | JWT (`jsonwebtoken`) + bcryptjs |
| DB Fallback | `mongodb-memory-server` (auto-starts if no local MongoDB) |

### File Structure (current)
```
C:\ai\
├── src/
│   ├── App.tsx              ← 2000+ line monolith (HomeMain + routing)
│   ├── main.tsx             ← BrowserRouter wrapper
│   ├── index.css            ← design tokens + base styles
│   └── components/
│       └── AdminDashboard.tsx  ← full CMS panel at /admin
├── server/
│   ├── server.js            ← Express API (ESM, port 5000)
│   ├── seed.js              ← standalone seed script
│   └── package.json
├── .agents/
│   └── AGENTS.md            ← coding standards checklist
└── package.json
```

### Current Routes
- `/` → `HomeMain` (single-page site, all sections in one component)
- `/admin` → `AdminDashboard`

### Current API Endpoints (server.js, port 5000)
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/login` | public | Admin login → JWT |
| GET | `/api/content` | public | Fetch all site content |
| PUT | `/api/content` | admin | Update site content |
| POST | `/api/contact` | public | Submit contact form |
| GET | `/api/contact` | admin | List contact submissions |

### Design Tokens (index.css — DO NOT CHANGE THESE)
```css
--background: 0 0% 98.8%;        /* #fcfcfc off-white */
--surface: 240 20% 97%;
--foreground: 0 0% 7.8%;         /* #141414 near-black */
--secondary-text: 0 0% 46%;      /* #898989 muted */
--muted: 220 14% 95%;
--border: 210 3.5% 88.6%;        /* #e1e2e3 light gray */
--primary: 250 79.3% 60.2%;      /* #6349ea purple */
--primary-tint: 255 100% 92%;    /* #f4f0ff light purple */
--success: 160 78% 34%;          /* #19a874 green */
```

### CSS Utility Classes (index.css — reuse these)
- `.card-panel` — white bordered card with hover effect
- `.btn-primary` — dark pill button (foreground bg, background text)
- `.btn-secondary` — transparent pill button with border
- `.animate-marquee` — infinite scroll animation
- `font-headline` → Cal Sans; `font-sans` → Inter

### AGENTS.md Coding Standards (must follow)
1. Every `<section>` must start with `<GridDivider />`
2. Never add opaque `bg-background` or `bg-white` on main `<section>` tags — use `bg-surface/30` or `bg-surface/60` for tinted sections
3. All content containers use `max-w-6xl mx-auto px-6`
4. Section headings: `text-3xl sm:text-4xl md:text-5xl font-normal font-headline`
5. Body text: `text-secondary-text text-sm sm:text-base leading-relaxed`

---

## 2. Architecture Plan

### Three Phases

```
Phase 1: Dynamic Header + Footer          (Global shell)
Phase 2: Dynamic Page System              (Multi-page routing)
Phase 3: Page Section Builder             (Content blocks per page)
```

### New MongoDB Collections to Add
| Collection | Purpose |
|---|---|
| `navigation` | Header nav links, submenus, CTA button |
| `footer` | Footer columns, social links, bottom bar |
| `pages` | Dynamic pages (slug, sections, SEO) |

### Refactored File Structure (target)
```
C:\ai\src\
├── App.tsx                        ← routing only, no page content
├── main.tsx                       ← unchanged
├── index.css                      ← unchanged
├── hooks/
│   └── useSiteData.ts             ← shared hook: fetches /api/content
├── components/
│   ├── AdminDashboard.tsx         ← extended with new tabs
│   ├── Header.tsx                 ← extracted + driven by /api/nav
│   ├── Footer.tsx                 ← extracted + driven by /api/footer
│   ├── GridLines.tsx              ← extracted from App.tsx
│   ├── GridDivider.tsx            ← extracted from App.tsx
│   └── NitwebsLogo.tsx            ← extracted from App.tsx
├── pages/
│   ├── HomeMain.tsx               ← extracted from App.tsx (unchanged sections)
│   ├── DynamicPage.tsx            ← renders pages from /api/pages/:slug
│   └── NotFound.tsx               ← 404 page
└── sections/                      ← Phase 3 reusable section components
    ├── SectionRenderer.tsx
    ├── HeroSection.tsx
    ├── TextSection.tsx
    ├── CardsSection.tsx
    ├── CtaSection.tsx
    └── ContactSection.tsx
```

---

## 3. Phase 1 — Dynamic Header & Footer

### 3.1 Backend: New Schemas in server.js

Add these two schemas to `server.js` alongside existing schemas:

#### Navigation Schema
```js
const navigationSchema = new mongoose.Schema({
  links: [{
    label: { type: String, required: true },
    type: { type: String, enum: ["scroll", "page", "url"], default: "scroll" },
    target: { type: String, required: true },
    // type "scroll" → target is section id e.g. "services"
    // type "page"   → target is page slug e.g. "/about"
    // type "url"    → target is full URL e.g. "https://..."
    children: [{
      label: String,
      type: { type: String, enum: ["scroll", "page", "url"], default: "page" },
      target: String,
      description: String   // optional subtitle shown in dropdown
    }]
  }],
  ctaLabel: { type: String, default: "Get Started" },
  ctaType: { type: String, enum: ["scroll", "page", "url"], default: "scroll" },
  ctaTarget: { type: String, default: "contact" }
});
const Navigation = mongoose.model("Navigation", navigationSchema);
```

#### Footer Schema
```js
const footerSchema = new mongoose.Schema({
  tagline: { type: String, default: "Building software that builds businesses." },
  columns: [{
    heading: String,
    links: [{
      label: String,
      href: String
    }]
  }],
  social: [{
    platform: String,   // "LinkedIn", "Twitter", "GitHub", etc.
    href: String,
    icon: String        // lucide icon name: "Linkedin", "Twitter", "Github"
  }],
  bottomLinks: [{
    label: String,
    href: String
  }],
  copyright: { type: String, default: "© 2025 Nitwebs Inc. All rights reserved." }
});
const Footer = mongoose.model("Footer", footerSchema);
```

### 3.2 Backend: New API Routes

Add these routes to `server.js`:

```
GET  /api/nav          → public, returns Navigation document
PUT  /api/nav          → admin (verifyAdmin), updates Navigation document
GET  /api/footer       → public, returns Footer document
PUT  /api/footer       → admin (verifyAdmin), updates Footer document
```

Each GET auto-creates the document with seed defaults if none exists (same pattern as existing `/api/content`).

#### Default seed data for Navigation:
```js
{
  links: [
    { label: "Services", type: "scroll", target: "services", children: [] },
    { label: "Work",     type: "scroll", target: "showcase", children: [] },
    { label: "Process",  type: "scroll", target: "process",  children: [] },
    { label: "FAQ",      type: "scroll", target: "faq",      children: [] }
  ],
  ctaLabel: "Get Started",
  ctaType: "scroll",
  ctaTarget: "contact"
}
```

#### Default seed data for Footer:
```js
{
  tagline: "Building software that builds businesses.",
  columns: [
    {
      heading: "Services",
      links: [
        { label: "AI Engineering", href: "#services" },
        { label: "Custom Software", href: "#services" },
        { label: "Web & Mobile", href: "#services" },
        { label: "Automation", href: "#services" }
      ]
    },
    {
      heading: "Company",
      links: [
        { label: "About Us", href: "#" },
        { label: "Our Work", href: "#showcase" },
        { label: "Process", href: "#process" },
        { label: "Contact", href: "#contact" }
      ]
    }
  ],
  social: [
    { platform: "LinkedIn", href: "#", icon: "Linkedin" },
    { platform: "Twitter",  href: "#", icon: "Twitter" }
  ],
  bottomLinks: [
    { label: "Privacy Policy",  href: "#" },
    { label: "Terms of Service", href: "#" }
  ],
  copyright: "© 2025 Nitwebs Inc. All rights reserved."
}
```

### 3.3 Frontend: Header Component

**File:** `src/components/Header.tsx`

Extract the existing header JSX from `HomeMain` in `App.tsx` and convert to a standalone component that:

1. Fetches `GET http://localhost:5000/api/nav` on mount
2. Falls back to the current hardcoded `navLinks` array if fetch fails
3. Resolves each link's action based on `type`:
   - `type: "scroll"` → calls `scrollToSection(target)` (same function as now)
   - `type: "page"` → uses React Router `<Link to={target}>`
   - `type: "url"` → renders `<a href={target} target="_blank">`
4. Renders a dropdown menu when a link has `children.length > 0`:
   - Desktop: hovering the nav item reveals a floating card below it (white bg, border, shadow, rounded-xl, `z-50`)
   - Each child shows `label` in bold and `description` in `text-secondary-text text-xs` below it
   - Mobile: children render as indented items inside the mobile menu drawer
5. The CTA button uses `ctaLabel`, `ctaType`, `ctaTarget` from the nav data
6. All existing scroll progress bar, sticky solid header, and mobile menu logic stays intact
7. Accepts `logoConfig` prop (passed down from parent which still fetches `/api/content`)

**Props interface:**
```ts
interface HeaderProps {
  logoConfig?: { mode: string; text?: string; imageUrl?: string };
  scrollProgress: number;        // 0–1, for the top progress bar
}
```

The `scrollProgress` and `headerSolid` state stay in the parent (`HomeMain`) and get passed down as props so the header can be reused on dynamic pages too.

**Dropdown design spec:**
- Trigger: `relative group` on the nav item wrapper
- Dropdown: `absolute top-full left-0 mt-2 min-w-[220px] bg-background border border-border rounded-xl shadow-lg p-2 hidden group-hover:flex flex-col gap-1 z-50`
- Each child item: `px-3 py-2.5 rounded-lg hover:bg-muted transition-colors cursor-pointer`
- Child label: `text-sm font-semibold text-foreground`
- Child description: `text-xs text-secondary-text mt-0.5`

### 3.4 Frontend: Footer Component

**File:** `src/components/Footer.tsx`

Replace the existing hardcoded footer in `App.tsx` with a component that:

1. Fetches `GET http://localhost:5000/api/footer` on mount
2. Falls back to static defaults if fetch fails
3. Renders a **multi-column footer layout** (not the current minimal single-row footer):

```
[Logo + tagline]    [Column 1]    [Column 2]    [Social icons]

─────────────────────────────────────────────────────────────
[Copyright]                          [Bottom links row]
```

**Layout spec:**
- Top section: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-16 px-6`
- First "column" spans 2 cols on large screens, shows `NitwebsLogo` + tagline + social icon row
- Each content column: heading in `text-xs font-mono text-primary tracking-widest uppercase mb-4`, links in `text-sm text-secondary-text hover:text-foreground`
- Social icons: `w-9 h-9 rounded-full border border-border flex items-center justify-center text-secondary-text hover:text-foreground hover:border-foreground transition-all`
- Bottom bar: `border-t border-border py-6 px-6 flex flex-col sm:flex-row items-center justify-between gap-4`
- Copyright: `text-xs text-secondary-text`
- Bottom links: `flex gap-6 text-xs text-secondary-text hover:text-foreground`
- Footer must still include `<GridDivider />` at the top

**Social icon mapping** (lucide-react icons):
```ts
const socialIconMap: Record<string, LucideIcon> = {
  LinkedIn: Linkedin,
  Twitter: Twitter,
  GitHub: Github,
  Instagram: Instagram,
  YouTube: Youtube
};
```

### 3.5 Admin: New Sidebar Tabs

In `AdminDashboard.tsx`, add two new tabs to the sidebar under "Web Content":

#### Navigation Tab (`id: "nav"`)
- Icon: `Navigation` (lucide)
- Label: "Navigation"

**UI panels:**

**Nav Links panel:**
- List of links, each row showing: label input, type dropdown (`scroll` / `page` / `url`), target input, delete button
- "+ Add Link" button appends a new empty link
- Drag handle icon (`GripVertical` from lucide) for reorder indication (visual only — actual reorder done by Up/Down arrow buttons)
- Each link has an expandable "Submenus" sub-section:
  - Toggle button "Add Submenu Items" → reveals a list of children
  - Each child has: label, type, target, description inputs + delete button
  - "+ Add Submenu Item" button

**CTA Button panel (separate card):**
- CTA Label input
- CTA Type dropdown (`scroll` / `page` / `url`)
- CTA Target input
- Preview of the button (static, just shows the label)

**Save button** calls `PUT /api/nav` with the full nav object + JWT header.

#### Footer Tab (`id: "footer"`)
- Icon: `LayoutTemplate` (lucide)
- Label: "Footer"

**UI panels:**

**Brand panel:**
- Tagline textarea
- Copyright text input

**Columns panel:**
- List of columns, each with:
  - Heading input
  - List of links (label + href per link)
  - "+ Add Link" button
  - Delete column button
- "+ Add Column" button (max 4 columns)

**Social Links panel:**
- List: platform name input + href input + icon name input + delete button
- "+ Add Social Link" button

**Bottom Links panel:**
- List: label input + href input + delete button
- "+ Add Bottom Link" button

**Save button** calls `PUT /api/footer` with the full footer object + JWT header.

---

## 4. Phase 2 — Dynamic Page System

### 4.1 Backend: Pages Schema

Add to `server.js`:

```js
const pageSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  // slug is the URL path, e.g. "about" → nitwebs.com/about
  // home page uses slug "home" but renders at "/"
  title: { type: String, required: true },
  metaDesc: { type: String, default: "" },
  metaImage: { type: String, default: "" },  // og:image URL
  status: { type: String, enum: ["published", "draft"], default: "draft" },
  sections: [{ type: mongoose.Schema.Types.Mixed }],  // Phase 3
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const Page = mongoose.model("Page", pageSchema);
```

### 4.2 Backend: Pages API Routes

```
GET    /api/pages              → admin only, returns array of all pages (slug, title, status, updatedAt)
POST   /api/pages              → admin only, creates a new page, body: { slug, title, metaDesc, status }
GET    /api/pages/:slug        → public, returns page if status === "published" (or 404)
PUT    /api/pages/:slug        → admin only, updates full page document
DELETE /api/pages/:slug        → admin only, deletes page
```

**Important:** `GET /api/pages/:slug` must return 404 (not the data) if `status === "draft"` — draft pages are only visible in admin preview.

**Slug validation rule:** slugs must match `/^[a-z0-9]+(?:-[a-z0-9]+)*$/` — lowercase, hyphens only, no slashes (nested routes not in scope). Enforce this in the POST handler.

### 4.3 Frontend: Routing Changes in App.tsx

Replace the current two-route `<Routes>` with:

```tsx
<Routes>
  <Route path="/"        element={<HomeMain />} />
  <Route path="/admin"   element={<AdminDashboard />} />
  <Route path="/:slug"   element={<DynamicPage />} />
  <Route path="*"        element={<NotFound />} />
</Routes>
```

**Order matters:** `/admin` must come before `/:slug` so the admin route is not caught by the catch-all.

### 4.4 Frontend: DynamicPage Component

**File:** `src/pages/DynamicPage.tsx`

```tsx
// Fetches /api/pages/:slug
// Shows a loading spinner while fetching
// Shows <NotFound /> if 404
// Renders <Header />, page sections via <SectionRenderer />, <Footer />
// Sets document.title and meta description from page.title / page.metaDesc
```

**Loading state:** full-screen centered spinner using the same spinner pattern as AdminDashboard:
```tsx
<div className="min-h-screen bg-background flex items-center justify-center">
  <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
</div>
```

**Meta tag update:** use `useEffect` to set:
```ts
document.title = `${page.title} — Nitwebs`;
const metaDesc = document.querySelector('meta[name="description"]');
if (metaDesc) metaDesc.setAttribute("content", page.metaDesc);
```

### 4.5 Frontend: NotFound Component

**File:** `src/pages/NotFound.tsx`

Simple centered page:
- `<Header />` at top
- Large "404" in `font-headline text-[120px] text-foreground/5`
- Heading: "Page not found" in `font-headline text-3xl`
- Subtext: "The page you're looking for doesn't exist or has been moved."
- Button: "Back to Home" → `<Link to="/">` using `.btn-primary`
- `<Footer />` at bottom

### 4.6 Admin: Pages Tab

Add a **Pages** tab to the AdminDashboard sidebar under a new section label "Site Pages":
- Icon: `FileText` (lucide)
- Label: "Pages"

**Pages list view (default):**
- Table/list of all pages showing: slug, title, status badge (`published` = green, `draft` = yellow), last updated date
- "+ New Page" button → opens create modal
- Each row has Edit (pencil icon) and Delete (trash icon) buttons
- Delete shows an inline confirmation ("Are you sure? This cannot be undone.")

**Create Page modal:**
- Page Title input (required)
- Slug input (required, auto-generates from title as user types: lowercase, spaces→hyphens, strip special chars — but user can override)
- Meta Description textarea
- Status toggle: Draft / Published
- "Create Page" button → `POST /api/pages`
- On success: close modal, switch to the page editor view for the new page

**Page editor view (after clicking Edit):**
- Back button "← All Pages"
- Page title (editable inline)
- Slug (editable), Status toggle, Meta description input — in a collapsible "SEO & Settings" card
- Section builder area (Phase 3)
- "Save Page" button → `PUT /api/pages/:slug`
- "Preview" button → opens `window.open('/'+slug)` in new tab (only works if published)

---

## 5. Phase 3 — Section Builder

### 5.1 Section Types

Each page's `sections` array holds objects with a required `type` field:

| `type` | Description | Key content fields |
|---|---|---|
| `hero` | Full-width hero with badge, headline, subtext, CTA buttons | badge, title, desc, ctaPrimaryLabel, ctaPrimaryTarget, ctaSecondaryLabel, ctaSecondaryTarget |
| `text` | Eyebrow + heading + body paragraph(s), optional image | eyebrow, heading, body, alignment ("left"/"center"), imageUrl |
| `cards` | Eyebrow + heading + grid of icon cards | eyebrow, heading, items: [{icon, title, desc}] |
| `stats` | Row of stat numbers with labels | items: [{value, suffix, label}] |
| `cta` | Full-width CTA banner (purple bg) | heading, desc, buttonLabel, buttonTarget, buttonType |
| `faq` | Accordion FAQ | eyebrow, heading, items: [{q, a}] |
| `contact` | Contact form + info panel | heading, desc (rest is static) |
| `testimonials` | Marquee of review cards | eyebrow, heading, items: [{name, role, review}] |
| `spacer` | Blank vertical spacing | size: "sm"/"md"/"lg" |

### 5.2 Backend: Section Storage

Sections are stored as `Mixed` in the Page schema — no sub-schema validation. The `type` field is the discriminator. Each section also gets a unique `id` (UUID string, generated client-side on creation) used as React key and for reordering.

Example stored page:
```json
{
  "slug": "about",
  "title": "About Us",
  "status": "published",
  "sections": [
    { "id": "abc123", "type": "hero", "badge": "Our Story", "title": "We build for tomorrow", "desc": "..." },
    { "id": "def456", "type": "text", "eyebrow": "WHO WE ARE", "heading": "A team of engineers...", "body": "..." },
    { "id": "ghi789", "type": "cta", "heading": "Ready to start?", "buttonLabel": "Get in touch", "buttonTarget": "contact", "buttonType": "scroll" }
  ]
}
```

### 5.3 Frontend: SectionRenderer

**File:** `src/sections/SectionRenderer.tsx`

```tsx
export default function SectionRenderer({ sections }: { sections: any[] }) {
  return (
    <>
      {sections.map((section) => {
        switch (section.type) {
          case "hero":         return <HeroSection key={section.id} data={section} />;
          case "text":         return <TextSection key={section.id} data={section} />;
          case "cards":        return <CardsSection key={section.id} data={section} />;
          case "stats":        return <StatsSection key={section.id} data={section} />;
          case "cta":          return <CtaSection key={section.id} data={section} />;
          case "faq":          return <FaqSection key={section.id} data={section} />;
          case "contact":      return <ContactSection key={section.id} data={section} />;
          case "testimonials": return <TestimonialsSection key={section.id} data={section} />;
          case "spacer":       return <SpacerSection key={section.id} data={section} />;
          default:             return null;
        }
      })}
    </>
  );
}
```

Each section component receives its `data` object and renders using the existing design system (same Tailwind tokens, same `GridDivider`, same animation patterns as `HomeMain`). Reuse the `Reveal`, `StaggerGrid`, `fadeUp`, `staggerContainer` animation helpers — extract these into a shared `src/lib/animations.ts` file.

### 5.4 Admin: Section Builder UI

Inside the page editor (Phase 2), below the SEO settings:

**Section list:**
- Each section renders as a collapsed card showing its type icon + type name + first meaningful content field as preview text
- Controls on each card: ↑ Up, ↓ Down (reorder), Edit (pencil → expands inline editor), Delete (trash)
- Expanding a section shows its field inputs (specific to type — see field list in 5.1)

**"+ Add Section" button:**
- Opens a picker modal showing all section types as cards with icon + name + one-line description
- Clicking a type appends a new section with that type and empty defaults to the sections array

**Section field editors by type:**

`hero` fields:
- Badge text input
- Title textarea
- Description textarea
- CTA Primary: label input + target input + type dropdown
- CTA Secondary: label input + target input + type dropdown

`text` fields:
- Eyebrow input
- Heading input
- Body textarea (multiline)
- Alignment radio: Left / Center
- Image URL input + file upload (optional)

`cards` fields:
- Eyebrow input
- Heading input
- Items list: each item has icon dropdown (same icons as services), title input, desc textarea
- "+ Add Card" / delete per card

`stats` fields:
- Items list: value input, suffix input ("+", "%", etc.), label input
- "+ Add Stat" / delete per stat

`cta` fields:
- Heading input
- Description textarea
- Button label input
- Button target input
- Button type dropdown (scroll / page / url)

`faq` fields:
- Eyebrow input
- Heading input
- Items list: question input + answer textarea
- "+ Add FAQ" / delete per item

`contact` fields:
- Heading input
- Description textarea
- (Form itself is static/hardcoded, it always submits to `/api/contact`)

`testimonials` fields:
- Eyebrow input
- Heading input
- Items list: name, role, review per testimonial

`spacer` fields:
- Size dropdown: Small (40px) / Medium (80px) / Large (120px)

---

## 6. Shared Utilities to Extract

Before building anything new, extract these from `App.tsx` into their own files so all pages and components can import them cleanly:

| Extract | From | To |
|---|---|---|
| `GridLines` component | `App.tsx:118–127` | `src/components/GridLines.tsx` |
| `GridDivider` component | `App.tsx:139–148` | `src/components/GridDivider.tsx` |
| `PlusMark` component | `App.tsx:130–136` | `src/components/GridDivider.tsx` (same file) |
| `NitwebsLogo` component | `App.tsx:291–325` | `src/components/NitwebsLogo.tsx` |
| `Reveal` component | `App.tsx:76–93` | `src/lib/animations.tsx` |
| `StaggerGrid` component | `App.tsx:97–109` | `src/lib/animations.tsx` |
| `fadeUp` variant | `App.tsx:65–68` | `src/lib/animations.tsx` |
| `staggerContainer` variant | `App.tsx:70–73` | `src/lib/animations.tsx` |
| `EASE` constant | `App.tsx:62` | `src/lib/animations.tsx` |
| `GRID_WIDTH` constant | `App.tsx:115` | `src/lib/constants.ts` |
| `hexToHsl` function | `App.tsx:524–552` (duplicate in AdminDashboard too) | `src/lib/utils.ts` |
| `Counter` component | `App.tsx:500–522` | `src/components/Counter.tsx` |

After extraction, update imports in `App.tsx` and `AdminDashboard.tsx`. This prevents circular deps and makes all section components self-contained.

---

## 7. Known Bugs to Fix During Implementation

### Bug 1: Contact Form Never Saves to DB
**Location:** `App.tsx` `handleSubmit` function (~line 638) and `server.js` `POST /api/contact` handler

**Problem:** Frontend sends `{name, company, email, phone, subject, budget, agreedToTerms}` but backend requires `message` field. Server returns 400 every time. Frontend catches the error and shows fake success.

**Fix:**
- Add a `message` textarea to the contact form (label: "Tell us about your project", required)
- Add `formMessage` state + `setFormMessage` handler
- Include `message: formMessage` in the fetch body
- Add `company` field to the `ContactSubmission` schema in server.js
- Add `company: String` to `const { name, email, ... } = req.body` destructuring
- Store `company` in the new ContactSubmission

### Bug 2: Contact Submissions Missing `company` in Admin View
**Location:** `AdminDashboard.tsx` Inquiries Inbox tab (~line 1200)

**Fix:** After fixing Bug 1, add a display row for `sub.company` in the submission card, next to the name/email row.

---

## 8. Implementation Order (Recommended)

```
Step 1  Extract shared utilities (Section 6) — no behavior change, just cleanup
Step 2  Fix Bug 1 + Bug 2 (Section 7) — contact form actually works
Step 3  Phase 1: Backend nav + footer schemas + routes
Step 4  Phase 1: Header component (extract + make dynamic)
Step 5  Phase 1: Footer component (extract + redesign + make dynamic)
Step 6  Phase 1: Admin nav + footer tabs
Step 7  Phase 2: Pages schema + API routes
Step 8  Phase 2: DynamicPage + NotFound + routing update
Step 9  Phase 2: Admin Pages tab (list + create + delete)
Step 10 Phase 3: Section components (port from HomeMain sections)
Step 11 Phase 3: SectionRenderer
Step 12 Phase 3: Admin section builder UI in page editor
```

---

## 9. Important Rules for the Implementing Agent

1. **Never change `src/index.css`** — the design tokens are final. Do not add new CSS variables.
2. **Never use opaque backgrounds on `<section>` tags** — use `bg-surface/30` or `bg-surface/60` at most.
3. **Every section starts with `<GridDivider />`** — no exceptions.
4. **All content max-width: `max-w-6xl mx-auto px-6`**.
5. **Never store JWT in sessionStorage** — the existing code uses localStorage. Keep it.
6. **The backend uses ESM** (`"type": "module"` in server/package.json) — use `import/export`, not `require()`.
7. **The frontend uses Tailwind v4** — no `tailwind.config.js`. All configuration is in `index.css` under `@theme`. Do not create a `tailwind.config.js`.
8. **Font classes:** use `font-headline` for all headings (Cal Sans), `font-sans` for body (Inter). Never apply `font-bold` to `font-headline` elements.
9. **API base URL:** hardcoded as `http://localhost:5000` in both `App.tsx` and `AdminDashboard.tsx`. Keep this pattern — do not introduce env vars unless asked.
10. **Do not modify the orbit/hero section** — the 3D/orbit hero in `HomeMain` is sensitive (geometry math, animation values). Only touch it if explicitly asked.
11. **CORS in server.js** allows only `http://localhost:5173` and `http://127.0.0.1:5173`. If a port changes, update the CORS origin array.
12. **MongoDB in-memory fallback** — the server auto-starts `mongodb-memory-server` if local MongoDB isn't running. This means data is lost on server restart when using the fallback. This is acceptable for dev but note it in any seeding logic.
13. **React Router v7** — use `<Link>` for internal navigation, not `<a href>`. The `useNavigate` hook is available for programmatic navigation.
14. **Motion imports** — the project uses `motion/react` (not `framer-motion`). Keep all animation imports from `motion/react`.

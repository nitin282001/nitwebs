# Careers / Jobs System — Design Spec
**Technical Lead Spec | Implementation Guide**

Sub-project 1 of 2 for the "AI agent + lead conversion" initiative. This spec is
self-contained and buildable/shippable on its own — the AI Sales/Support Agent
(spec 2, to follow) will consume this system's data (`GET /api/jobs`) once it
exists, but nothing here depends on the agent.

---

## 1. Goal

Give Nitwebs an admin-managed job board: staff add/edit/close openings in the
existing `AdminDashboard`, visitors browse them at `/careers`, and applicants
apply in-site with a resume upload. No third-party ATS, no paid services —
everything lives in the existing MongoDB + Express stack, $0 marginal cost.

Pre-screening questions per job are **explicitly deferred** — noted in the data
model so they can be added later without restructuring.

---

## 2. Data Model

Add to `server/server.js`, following the existing schema style (see
`contentSchema`, `ContactSubmission`).

### Job schema
```js
const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  // auto-generated from title on create: lowercase, spaces→hyphens, strip
  // special chars — same rule as the existing Pages slug validation
  // (/^[a-z0-9]+(?:-[a-z0-9]+)*$/), regenerate if title changes and slug
  // wasn't manually overridden
  department: { type: String, default: "" },
  location: { type: String, default: "Remote" },
  employmentType: {
    type: String,
    enum: ["full-time", "part-time", "contract", "internship"],
    default: "full-time"
  },
  summary: { type: String, default: "" },       // card preview, 1-2 sentences
  description: { type: String, default: "" },   // full body, detail page
  requirements: [{ type: String }],              // bullet list
  status: { type: String, enum: ["open", "closed"], default: "open" },
  postedDate: { type: Date, default: Date.now }
});
const Job = mongoose.model("Job", jobSchema);
```

### Application schema
```js
const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  jobTitle: { type: String, required: true }, // denormalized snapshot —
  // keeps applications readable in admin even if the Job doc is later deleted
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: "" },
  resumePath: { type: String, required: true }, // relative path under
  // server/uploads/resumes/
  coverNote: { type: String, default: "" },
  // screeningAnswers: [{ question: String, answer: String }] — DEFERRED,
  // add later without migration (new docs just won't have the field)
  submittedAt: { type: Date, default: Date.now }
});
const Application = mongoose.model("Application", applicationSchema);
```

---

## 3. Backend API

### Public routes
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/jobs` | All jobs with `status: "open"`, sorted by `postedDate` desc. Fields: title, slug, department, location, employmentType, summary, postedDate |
| GET | `/api/jobs/:slug` | Single job, full detail. 404 if not found OR `status === "closed"` |
| POST | `/api/applications` | `multipart/form-data`: name, email, phone, coverNote, jobId, resume (file). Returns 410 if the referenced job is closed |

### Admin routes (require `verifyAdmin`, same JWT pattern as existing admin routes)
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/admin/jobs` | All jobs, any status |
| POST | `/api/admin/jobs` | Create job. Body: all Job fields except slug (auto-generated) |
| PUT | `/api/admin/jobs/:id` | Update job |
| DELETE | `/api/admin/jobs/:id` | Delete job |
| GET | `/api/admin/applications` | All applications, newest first, populated with job title |
| DELETE | `/api/admin/applications/:id` | Delete an application |

### File upload handling
- Use `multer` (add as a new dependency in `server/package.json`) with disk
  storage: destination `server/uploads/resumes/`, filename =
  `${Date.now()}-${sanitizedOriginalName}`
- `fileFilter`: accept only `.pdf`, `.doc`, `.docx` (by mimetype)
- `limits.fileSize`: 5MB (`5 * 1024 * 1024`)
- On filter/size rejection, respond `400` with a clear message the frontend
  surfaces inline (not a silent failure)
- Serve resumes statically for admin download:
  `app.use("/uploads/resumes", verifyAdmin, express.static(...))` — **must**
  be behind admin auth, resumes are personal data
- **Known limitation to document, not solve now:** if this app is later
  deployed to a host with an ephemeral filesystem (serverless, some free-tier
  PaaS), uploaded files are lost on redeploy/restart — same caveat that
  already applies to the `mongodb-memory-server` fallback. Fine for
  local/VPS hosting.

### Slug generation
Reuse the exact slug rule from the existing Pages system
(`/^[a-z0-9]+(?:-[a-z0-9]+)*$/`, lowercase/hyphenated). On `POST
/api/admin/jobs`, generate from `title`; on `PUT`, only regenerate if the
admin explicitly edited the slug field (don't silently break existing shared
links when someone tweaks a job title).

---

## 4. Frontend

### Routes (`App.tsx`)
```tsx
<Route path="/careers"        element={<Careers />} />
<Route path="/careers/:slug"  element={<JobDetail />} />
```
Add **before** the catch-all `/:slug` CMS page route (same ordering rule
already documented for `/admin` in `CMS_PLAN.md` — first match wins).

### `src/pages/Careers.tsx`
- Fetches `GET /api/jobs` on mount
- Renders `<Header />`, a hero-ish intro block, a grid of job cards, `<Footer />`
- Each card: `.card-panel` styling, shows title, department, location,
  employment-type badge, summary — clicking navigates to `/careers/:slug`
  via `<Link>`
- Empty state ("No open roles right now — check back soon") if the array is empty
- Follows AGENTS.md rules: `<GridDivider />` at section start, `max-w-6xl
  mx-auto px-6` container, `bg-surface/30` if a tinted section is used

### `src/pages/JobDetail.tsx`
- Fetches `GET /api/jobs/:slug`; loading spinner (same pattern as
  `DynamicPage.tsx`); renders `<NotFound />` on 404
- Shows full description, requirements as a bullet list, employment-type /
  location / department metadata row
- Apply form at the bottom (see below)
- Sets `document.title` to `${job.title} — Careers — Nitwebs`

### Apply form (embedded in `JobDetail.tsx`)
- Fields: name, email, phone, resume file input (`accept=".pdf,.doc,.docx"`),
  cover note textarea
- Client-side validation: required name/email/resume, file size ≤5MB checked
  before submit (fail fast, don't rely only on server rejection)
- Submits `POST /api/applications` as `FormData` (not JSON, because of the
  file)
- On success: replace the form with a confirmation message ("Thanks — we'll
  be in touch.")
- On job-closed (410): show "This role is no longer accepting applications"
  and hide the form

---

## 5. Admin (`AdminDashboard.tsx`)

New sidebar section **"Careers"**, added following the existing tab
pattern used for Pages/Nav/Footer.

### Jobs tab (`id: "jobs"`, icon: `Briefcase`)
- List view: table/list of all jobs — title, department, status badge
  (open=green, closed=gray), posted date. Edit (pencil) + Delete (trash) per row
- "+ New Job" button → create form (title, department, location,
  employmentType dropdown, summary, description, requirements — dynamic
  list with "+ Add Requirement", status toggle)
- Edit view: same fields, pre-filled, "Save" → `PUT /api/admin/jobs/:id`
- Delete: inline confirmation, same UX as existing Page delete

### Applications tab (`id: "applications"`, icon: `Inbox`)
- List of applications, newest first — same card layout as the existing
  Inquiries inbox tab, showing: applicant name, email, phone, job title
  (denormalized), submitted date, cover note
- Resume shown as a download link (`/uploads/resumes/:filename`, opens in
  new tab, admin-authenticated)
- Delete button per application

---

## 6. Error Handling Summary
- Invalid/oversized resume upload → 400, surfaced inline on the form, not a
  toast that disappears
- Applying to a closed job (race condition between page load and submit) →
  410, form replaced with a "no longer accepting applications" message
- Nonexistent or closed job slug → 404 → `NotFound` component
- Duplicate slug on job create (rare, only if two titles normalize the same)
  → 409, admin form shows "A job with this URL already exists, edit the slug"

---

## 7. Explicitly Out of Scope (this spec)
- Pre-screening questions per job (schema is shaped to add this later
  without migration — see `screeningAnswers` comment above)
- Any AI-driven interaction — that's spec 2 (AI Sales/Support Agent), which
  will call `GET /api/jobs` / `GET /api/jobs/:slug` as read-only tools once
  built
- Applicant status tracking (interviewing/rejected/hired pipeline) — not
  requested, would be a separate future spec if needed

---

## 8. Implementation Order
```
Step 1  Backend: Job + Application schemas, multer setup, uploads folder
Step 2  Backend: public routes (/api/jobs, /api/jobs/:slug, /api/applications)
Step 3  Backend: admin routes (CRUD jobs, list/delete applications)
Step 4  Frontend: Careers.tsx + JobDetail.tsx + routes in App.tsx
Step 5  Frontend: apply form with validation + submit states
Step 6  Admin: Jobs tab (list/create/edit/delete)
Step 7  Admin: Applications tab (list/download resume/delete)
```

---

## 9. Rules Carried Over from CMS_PLAN.md (still apply)
1. Never modify `src/index.css` design tokens
2. No opaque backgrounds on `<section>` — `bg-surface/30` / `bg-surface/60` max
3. Every section starts with `<GridDivider />`
4. Content containers: `max-w-6xl mx-auto px-6`
5. Headings: `font-headline`, never `font-bold` on headline text; body: `font-sans`
6. JWT stays in localStorage, ESM backend, Tailwind v4 (no config file),
   API base hardcoded to `http://localhost:5000`, CORS origin list must be
   updated if ports change

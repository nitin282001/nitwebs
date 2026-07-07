# Hero 3D Orbit Upgrade — Design Spec

## Context

`C:\ai` is the Nitwebs marketing site (React 19 + TypeScript + Vite + Tailwind CSS v4 + Motion). The hero section currently has a signature element: two concentric decorative rings (radii 290px / 360px, drawn as flat CSS circles) carrying 19 tech-stack brand icons (Next.js, React, Vue, Node.js, Java, n8n, Angular, JavaScript, Tailwind CSS, Laravel, Python, Kotlin, Flutter, MongoDB, Rust, Solidity, DigitalOcean, Docker, AWS) that orbit continuously, slowly, clockwise, like planets — implemented in `src/App.tsx` as `OrbitRing`/`OrbitIcon` components. Each ring shares one Motion `MotionValue` angle driving all its icons' `x`/`y` transform (never `left`/`top`, to stay off the layout-triggering path and avoid jitter); hovering any icon pauses its ring and shows a name tooltip.

This spec covers **replacing the flat 2D orbit with a real WebGL 3D scene**, decided via a brainstorming session with the project owner on 2026-07-07. `three` (0.185.1) and `@types/three` are already installed in the project (added for this purpose) but not yet used anywhere.

**Goal:** make the hero's signature element read as genuine 3D — visible camera angle, real lighting/shadow so icons catch light as they rotate through it — while keeping everything else about the hero (headline text, badge, subtext, buttons, page background, overall calm/restrained pacing) unchanged.

**Non-goals:** this spec does not touch any other section of the site, does not change the icon set or count, does not change the orbit speed/direction, and does not add any effect to page sections other than the hero.

## Decisions made during brainstorming (do not re-litigate these)

1. **Full 3D scene**, not a subtle CSS-perspective tweak. User was shown two rough visual mockups (a "subtle depth" version vs. a "full 3D" version with visible camera tilt, glow/shadow, icons catching light) and explicitly chose full 3D.
2. **Scope**: only the ring + icons move into the 3D scene. Headline, eyebrow badge, subtext, and the two CTA buttons stay as normal flat HTML/CSS text, layered on top of/around the 3D canvas — not composited into WebGL. This keeps hero copy crisp and trivially accessible/SEO-indexable.
3. **Motion model**: keep the existing autoplay orbit (same shared-angle-per-ring approach, same slow durations) **and** add mouse-driven camera parallax on top — the camera tilts a few degrees toward the cursor, lerped smoothly, so the scene still feels alive even if the user never touches the mouse, but responds when they do.
4. **Device/performance scope**: match the current behavior exactly — the whole 3D canvas only mounts at viewport width ≥1280px (same threshold the current `xl:` Tailwind breakpoint uses for icon visibility). Below that, hero shows only the flat text, no ring at all, same as today. No "lighter mobile version" — out of scope for this pass.
5. **Library**: `@react-three/fiber` + `@react-three/drei` (not raw/imperative three.js, not CSS-only fakery). Chosen over hand-rolled three.js specifically to reduce implementation-bug surface area — the existing 2D orbit needed several rounds of fixes (jitter from animating `left`/`top` instead of `transform`, icons crossing behind the text, icons clipping the container edge, an upside-down icon bug from a rotate-parent/counter-rotate-child approach that could desync) and a hand-rolled WebGL scene has at least as much room for equivalent classes of bugs. `drei`'s helper components (billboarding, contact shadows, `Html` overlays) are battle-tested rather than reinvented.
6. **Background**: page stays plain white/off-white behind the 3D canvas (`--background: 0 0% 98.8%` / `#fcfcfc`) — no tinted environment box behind the rings, to stay consistent with the rest of the site's restrained cal.com-derived palette (see `reference_calcom_design_system` memory / `docs/superpowers/specs/2026-07-06-cal-com-redesign-design.md` for the full token set).

## Architecture

New component: `src/components/HeroOrbit3D.tsx` (new `src/components/` directory — was removed after the DotField experiment; recreate it for this).

- Exports a single `HeroOrbit3D` component, mounted in `App.tsx` in the same spot the current decorative-ring `<div>` + two `<OrbitRing>` calls occupy (inside the hero's `relative max-w-6xl ... overflow-hidden` container, behind the `z-10` text block).
- Internally renders `@react-three/fiber`'s `<Canvas>` (transparent background, sized via CSS to fill its parent absolutely — same `absolute inset-0` positioning pattern the old ring container used) containing:
  - A `Scene` component owning the `PerspectiveCamera`, lights, and two `Ring` groups.
  - `Ring` (one per radius/duration pair) owns one shared Motion `MotionValue` angle (reuse the existing `useMotionValue` + `animate(angle, 360, { duration, repeat: Infinity, ease: "linear" })` pattern verbatim from the current `OrbitRing`) and renders its `IconCard` children.
  - `IconCard`: a `drei` `<RoundedBox>` mesh, positioned via the same trig (`radius · sin/cos(angle + baseAngle)`) as today but extended to 3D (x, z from the trig, y as a small fixed tilt/offset so the ring reads as a tilted ellipse from the camera's angle — not literally flat toward the viewer). Textured on its front face with that icon's pre-rendered canvas texture (see below). Wrapped in `drei`'s `<Billboard>` *only for the texture-facing behavior if needed* — confirm during implementation whether `RoundedBox` + fixed card orientation already reads correctly at the chosen camera angle before reaching for `Billboard`, since full billboarding could fight the "icons catch light differently as they turn" effect that's the whole point of going 3D.
- `HeroOrbit3D` itself is responsible for the ≥1280px / WebGL-availability gating (see Performance & Fallback) — it should render `null` outright rather than mounting `<Canvas>` when either condition fails, so `App.tsx` can render it unconditionally without its own viewport-check logic (mirrors how `OrbitIcon` currently self-hides via a `hidden xl:block` CSS class, just pushed one level up since a `<Canvas>` can't be conditionally hidden via CSS class alone without still paying the WebGL context cost).

`App.tsx` changes: remove the `RING_RADIUS` decorative-`<div>` block, `OrbitRing`, `OrbitIcon`, `MIDDLE_RING_ICONS`/`OUTER_RING_ICONS`/`MIDDLE_ANGLES`/`OUTER_ANGLES`/`evenAngles`/`ORBIT_ICON_HALF` (all superseded), replace the two `<OrbitRing .../>` JSX calls with one `<HeroOrbit3D />`. The icon data (name/icon-component/color/baseAngle) moves into `HeroOrbit3D.tsx` — same 19 icons, same `evenAngles(9)` / `evenAngles(10, 18)` split and angles, same radii (290/360) as starting values for the 3D version (may need retuning once real camera perspective is in place — flag this as a tuning pass in the implementation plan, not a re-derivation from scratch).

## Scene composition

- **Camera**: `PerspectiveCamera`, fixed FOV, positioned above/in-front looking down at roughly 55-65° (matches the mockup the user approved). Exact angle is a tuning value — implementer should render at a few angles and pick what reads best against the real icon sizes, not treat 55-65° as gospel.
- **Lighting**: one `ambientLight` (fills shadow so icons never render fully black) + one `directionalLight` positioned up-and-to-one-side (this is what makes icons visibly catch light as they rotate through it — the specific effect the user liked in the approved mockup).
- **Shadows**: `drei`'s `<ContactShadows>` — a soft blurred shadow plane under the ring — not full dynamic shadow-mapping (cheaper, reads well for small floating objects at this scale).
- **Materials**: icon cards use a material that responds to lighting (e.g. `meshStandardMaterial`), not an unlit/emissive material — flat unlit icons would defeat the "catches light" effect.
- **Background**: `<Canvas>` transparent, page's normal white background shows through — no tinted environment.

## Motion & interaction

- **Autoplay**: unchanged from today — reuse the exact `useMotionValue`/`animate(angle, 360, { duration, repeat: Infinity, ease: "linear" })` pattern, same durations (100s middle ring / 160s outer ring), same clockwise direction.
- **Mouse parallax**: camera (not the rings/icons) tilts a few degrees toward normalized cursor position, lerped per-frame inside a `useFrame` callback (r3f's per-frame hook) — smooth, not an instant snap.
- **Hover pause + tooltip**: same UX as today (hovering an icon pauses that ring's shared angle, shows the icon's name), but the tooltip should be a `drei` `<Html>` overlay anchored to the 3D card's screen-projected position, so the tooltip text itself stays real, crisp DOM text rather than a WebGL-rendered label. Pause/resume wiring reuses the existing `controls.pause()`/`controls.play()` pattern on the ring's shared `AnimationPlaybackControls`.
- **`prefers-reduced-motion`**: check via `window.matchMedia` before starting each ring's `animate()` call (same as today) — when reduced motion is preferred, skip autoplay *and* skip camera parallax (camera stays at its neutral/default angle). The canvas still mounts and icons are still visible, just static.

## Icon rendering (SVG → WebGL texture)

The 19 icons are currently `react-icons` React components (SVG). WebGL cannot render arbitrary React/SVG components directly — each icon needs to become a texture:

1. On mount (once per icon, cached — not per-frame, not per-render), render the icon's SVG markup to an offscreen `<canvas>`: serialize the icon element to an SVG string, load it as an `Image` via a data URL, draw that image onto a 2D canvas context at a fixed small resolution (e.g. 128×128), matching the icon's existing brand color.
2. Wrap that canvas in a `THREE.CanvasTexture` and pass it to the `IconCard`'s material's `map` property.
3. Cache the generated texture per icon name (e.g. in a module-level `Map` or a `useMemo` keyed by icon identity) so remounts/re-renders don't regenerate textures.

Implementer note: this is the single most novel/unproven piece of this spec — there isn't existing code in this project doing SVG-to-texture conversion. Budget explicit time to prototype this in isolation (one icon, confirm it renders correctly and at acceptable sharpness on the 3D card) before wiring up all 19.

## Performance & fallback

- **Viewport gating**: `HeroOrbit3D` renders `null` below 1280px width (check via a `window.innerWidth` + `resize` listener, or a `matchMedia("(min-width: 1280px)")` listener — pick whichever pattern fits better once other responsive logic in `App.tsx` is reviewed; this project doesn't currently have a shared breakpoint hook, but should follow whatever existing responsive-JS convention exists in `App.tsx` — e.g. the existing scroll/header-solid state pattern — rather than introducing a new one-off pattern in this spec).
- **WebGL feature detection**: check WebGL availability once on mount (e.g. attempt to get a `webgl`/`webgl2` context from a throwaway canvas); if unavailable, `HeroOrbit3D` renders `null` — never throws, never shows a broken/blank canvas box.
- **No layout shift**: whatever gating logic is used, it should not cause the hero's overall height/layout to jump once the ≥1280px/WebGL check resolves — determine viewport width/WebGL support synchronously where possible (e.g. `window.innerWidth` is available synchronously; WebGL context detection is also synchronous) to avoid a mount-after-paint flash.

## Testing / verification (for whoever implements this)

Since this will likely be implemented by a different agent/session without this conversation's live browser access, verification must be concrete and re-creatable from the spec alone, not "looks right":

1. **Type-check**: `npx tsc -b --noEmit` clean, matching this project's existing strict TS config (`noUnusedLocals`, `noUnusedParameters`, etc. in `tsconfig.app.json`).
2. **Geometric safety** (the same class of check the 2D orbit needed, now in 3D): confirm programmatically (e.g. via a browser console sweep across the full 0-360° angle range, like the technique used for the 2D rings) that icons never visually overlap the centered hero text and never render outside their container's bounds, at the final chosen camera angle and radii — do not assume the 2D version's 290/360px radii are automatically safe once real camera perspective distorts apparent size/position.
3. **Viewport gating**: verify via `getComputedStyle`/DOM inspection (not just eyeballing a screenshot) that the `<canvas>` element does not exist in the DOM below 1280px width, and does exist above it.
4. **No WebGL crash path**: verify (e.g. by temporarily forcing the WebGL-detection check to fail) that the hero still renders correctly with just flat text and no console errors.
5. **`prefers-reduced-motion`**: verify via `matchMedia` mock/override that autoplay and camera parallax both stop.
6. **Visual check against the approved direction**: side-by-side against the full-3D mockup direction approved in this brainstorming session (visible camera tilt, icons catching directional light as they rotate, contact shadow under the ring) — a screenshot-based check is fine here since this is inherently a visual/aesthetic criterion, not a correctness one.
7. Manually confirm hover-pause-and-tooltip and mouse-parallax both work by dispatching synthetic events in a headless check (same techniques used for the 2D version: dispatching `mousemove`, checking computed styles/`AnimationPlaybackControls` state) rather than only relying on manual interaction.

## Open items for the implementer to resolve (intentionally left as tuning, not blocking decisions)

- Exact camera angle/FOV/light position/shadow blur — start from the values suggested above, tune by eye against the approved mockup.
- Whether `RoundedBox` cards need explicit `Billboard` wrapping or read correctly at a fixed orientation given the chosen camera angle.
- Whether the existing 290px/360px ring radii need adjustment once real 3D perspective is in place (a radius that worked for a flat 2D circle may look too tight/loose once foreshortened by camera angle).
- Exact bundle-size impact of `@react-three/fiber` + `@react-three/drei` + `three` — worth checking against the project's current bundle size before finalizing, though not a hard gate given this is a desktop-only (≥1280px) feature.

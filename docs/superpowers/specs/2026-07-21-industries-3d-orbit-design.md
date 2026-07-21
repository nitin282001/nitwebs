# Industries Section: 3D Scroll-Driven Orbit

## Context

The "Industries We Serve" section on the homepage (`src/pages/HomeMain.tsx`, `#industries`, currently lines ~1220–1253) renders 8 industry cards as a CSS `animate-marquee` auto-scrolling row (`IndustryCard`, defined at line 429). It works but is visually flat and generic compared to the rest of the redesigned homepage (orbiting hero rings, Silk shader backgrounds elsewhere).

Goal: give this section a "wow factor" 3D interaction that fits the existing design language (dark image cards, purple primary accent, `motion/react` scroll-linked animation, `@react-three/fiber` for WebGL) without regressing accessibility, mobile usability, or performance.

Card content/data (`industriesList`: title, subheading, desc, icon, tags, fallback images) is unchanged — this is a presentation and interaction rework only.

## Approach

Cards sit on a virtual 3D cylinder rendered with real DOM elements and CSS 3D transforms (`perspective` / `transform-style: preserve-3d` / `rotateY` + `translateZ`), not literal Three.js meshes. This keeps text and images crisp, accessible, and cheap on the GPU. A separate small `@react-three/fiber` canvas renders an ambient particle/glow layer behind the ring for atmosphere, following the same pattern as the existing `Silk.tsx` shader background used in the Contact section.

On desktop, the page scroll pins the section and scrubs the ring through one full rotation (scrollytelling moment), reusing the exact pin pattern already established in this file for the Showcase section (`h-[280vh]` wrapper + `sticky top-0 h-screen` inner + `useScroll`/`useTransform`). On mobile/tablet, the same ring renders unpinned and is rotated by drag/swipe instead. Under `prefers-reduced-motion`, everything collapses to a static, non-animated scroll-snap row.

Three approaches were considered (enhanced marquee with magnetic hover; full-bleed Three.js scene with real meshes/camera dolly; this one). The 3D CSS ring + WebGL atmosphere hybrid was chosen because it delivers the most dramatic "wow" moment while keeping card content as accessible/crisp DOM, matches the codebase's existing DOM+WebGL-background pattern (`Silk.tsx`), and avoids the fragility of rendering text inside a WebGL scene (via `drei`'s `<Html>`) while rotating.

## Components

### `src/sections/IndustriesOrbit.tsx` (new)

Replaces the marquee JSX currently inline in `HomeMain.tsx`. Props:

```ts
interface IndustriesOrbitProps {
  header: { badge: string; title: string; desc?: string };
  items: IndustryItem[]; // same shape as today's industriesList entries
  isDesktop: boolean;    // reuse HomeMain's existing isDesktop state (>=1024px)
  prefersReducedMotion: boolean; // reuse HomeMain's existing state
}
```

Internally branches into exactly one of three render paths described below. Owns all ring/rotation logic; `HomeMain.tsx` just renders `<IndustriesOrbit header={industriesHeader} items={industriesList} isDesktop={isDesktop} prefersReducedMotion={prefersReducedMotion} />` in place of the current marquee block, and the `IndustryCard` component (or a close variant of it) is reused/adapted for ring placement.

### `src/components/ui/OrbitAtmosphere.tsx` (new)

A `@react-three/fiber` `<Canvas>` (`dpr={[1, 1.5]}`, capped point count ~150–250) rendering additive-blended glowing points in the primary purple (`hsl(250 79% 60%)`, matching the `--primary` CSS token) drifting slowly through the frame. Accepts a `rotationVelocity` ref/callback so drift speed can be nudged when the ring is spinning, giving a subtle connection between the two layers. Absolutely positioned behind the ring (`inset-0`, `pointer-events-none`, `z-0`). Only mounted in the desktop + motion-OK path.

## Desktop pinned ring (motion OK, `isDesktop === true`)

- Section wrapper: `<section className="relative h-[280vh]">` containing `GridDivider`, the header, and the ring — mirroring the existing Showcase section's structure (`HomeMain.tsx` ~987–994).
- Inner: `sticky top-0 h-screen overflow-hidden flex flex-col justify-center`.
- `useScroll({ target: sectionRef, offset: ["start start", "end end"] })` → `scrollYProgress`.
- `ringRotation = useTransform(scrollYProgress, [0, 1], [0, -360])` — exactly one revolution across the pin distance, so the ring returns to its starting orientation right as the section unpins (clean loop, no jarring snap).
- Ring markup: outer div with `perspective: 1400px`; inner ring div with `transformStyle: preserve-3d` and `style={{ rotateY: ringRotation }}` (motion value, no re-renders). Each of the 8 cards is absolutely centered inside the ring with its own static transform `rotateY(idx * 45deg) translateZ(~520px)` (radius tuned during implementation so adjacent card chords clear the card width + gap).
- Per-card derived values (each via its own `useTransform(ringRotation, r => ...)` off the single shared motion value — no extra React state):
  - angular distance of that card from "front" (0°, mod 360, shortest-path)
  - `opacity`: 1 at 0°, down to ~0.15 by 180°
  - `blur` filter: 0px at 0°, up to ~8px by 180°
  - `scale`: 1 at 0°, down to ~0.82 by 90°+
- Front-facing card additionally gets a highlight border/glow and shows its full tag row; angled cards show image + title only (avoids illegible angled text clutter).
- Click handler on any card: computes the scroll Y position within the pinned section that would bring that card to angle 0, and smooth-scrolls there (`window.scrollTo` / `scrollIntoView`-style, using the section's own scroll math) — scroll position stays the single source of truth for rotation, no competing animation driver.
- Desktop-only mouse-parallax: a few degrees of extra `rotateX`/`rotateY` tilt on the outer perspective wrapper based on pointer position within the section, layered visually on top of (not replacing) the scroll-driven rotation.
- `OrbitAtmosphere` renders behind the ring, subscribed to `ringRotation`'s rate of change (via `.on("change")`) to modulate particle drift speed.

## Mobile/tablet ring (motion OK, `isDesktop === false`)

- Same ring component, no pin: section renders at normal content height (`py-24 px-6`, like most other sections).
- Reduced radius/perspective for a flatter, less disorienting 3D depth appropriate to a small screen.
- Rotation driven by pointer/touch drag (with momentum + snap-to-nearest-card) instead of scroll — implemented as its own motion value fed by drag deltas, using the same per-card derived opacity/blur/scale transforms as desktop.
- `OrbitAtmosphere` is not mounted on this path (GPU/battery cost cut here first).

## Reduced motion (`prefers-reduced-motion`, any device)

- Static fallback: the same card visuals in a plain `overflow-x-auto` row with CSS scroll-snap (`snap-x`, `snap-mandatory` on the container, `snap-start` per card). No rotation, no pin, no auto-scroll timer, no parallax.
- This is stricter than today's marquee (which currently auto-scrolls unconditionally); reduced-motion is not checked before starting the current animation. That's the accessibility bar this rework is expected to clear.

## Testing / verification

- Manual verification in-browser (per project convention) at desktop and mobile viewport widths, plus with the OS "reduce motion" setting enabled, before calling this done — this is a visual/interaction feature, not something a unit test meaningfully covers.
- Check: pin engages/releases cleanly at section boundaries, ring completes exactly one revolution across the pin, front-card click-to-focus lands accurately, drag-to-rotate on mobile has reasonable momentum/snap, reduced-motion path shows zero animation, and `OrbitAtmosphere` doesn't tank scroll framerate (profile via DevTools if it looks janky).

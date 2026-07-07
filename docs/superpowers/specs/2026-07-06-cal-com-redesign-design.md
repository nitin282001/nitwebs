# Nitwebs Site Redesign — cal.com-Inspired Light Theme

## Goal

Redesign the existing Nitwebs marketing site (dark, glassmorphic, maximalist) into a light, minimal aesthetic inspired by cal.com, keeping Nitwebs' own business content but tightening the section count and adding Motion (Framer Motion) animation.

## Reference Design Tokens (pulled from cal.com's live page source)

- Background: white / off-white `#fcfcfc`
- Headline text: `#141414`; body text: `#242424`; secondary/muted text: `#898989`
- Borders: `#e1e2e3`, small radius (8–16px) on cards, pill radius (9999px) on buttons
- Accent: purple `#6349ea`, light tint `#BFA2FE` / `#f4f0ff`; success green `#19a874`
- Typography: bold geometric display font for headlines, Inter/Geist Sans for body, compact 14–16px base scale, generous whitespace
- Components: flat bordered cards (no blur/glow), pill buttons, minimal top nav

## Theme Direction

Full light theme (not dark-with-flat-style). Removes: particle canvas background, custom cursor, film grain, glassmorphism, mouse-glow hover effect, glowing gradient button borders.

## Page Structure (13 sections → 8)

1. Header — logo, nav links, pill CTA
2. Hero — headline, subtext, dual CTA, stats row, logo marquee (restyled flat)
3. Services — 12 cards condensed to 6 (AI, Custom Software, Web/Mobile, Automation & Data, Cloud & Security, Design)
4. How We Work — 6-step timeline condensed to 4 steps (Discovery → Design → Build → Launch)
5. Showcase — existing 2 project case-study cards, restyled flat
6. Testimonials — single marquee row (drop second reverse row)
7. FAQ — existing accordion, restyled flat
8. CTA + Contact + Footer — merged big-CTA banner into contact section header; simplified footer

Dropped: particle canvas, custom cursor, mouse-glow, dev-workflow simulation panel, bento "why us" grid (folded into Services/a compact strip), case-study carousel arrows glow.

## Motion Plan (`motion` package)

- Hero: staggered entrance (badge → headline → subtext → CTAs → stats)
- Scroll reveal: fade+slide-up with stagger for grids/lists, replacing IntersectionObserver class-toggle
- Cards: hover lift + scale via spring transitions
- FAQ accordion: animate via `AnimatePresence`
- Mobile nav: slide/fade via `AnimatePresence`
- Animated number counters via Motion's `animate()`
- Subtle parallax drift on a hero background shape

## Technical Notes

- Rewrite `src/App.tsx` markup for the new 8-section structure; keep `Lenis` for smooth scroll
- Replace dark theme tokens in `src/index.css` with light theme tokens; remove unused glass/glow/grain CSS, add minimal card/button utilities
- Remove unused `gsap` dependency (installed, never imported)
- Preserve all real Nitwebs business copy, tightened to fit the leaner structure

## Out of Scope

- No backend/form submission changes (mock submit handler stays as-is)
- No new pages/routes
- No CMS or content-management changes

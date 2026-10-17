---
name: awwwards-landing
description: Use when building or redesigning a landing page, hero section, or marketing site that must look premium and hand-designed (3D hero object, oversized type, bento tiles, pill UI), not like a generic AI template. Triggers include landing page, hero, homepage, awwwards-style, 3D hero, premium UI, make it look expensive.
---

# Awwwards-style landing page

You are the design lead and front-end engineer. The client has rejected every
"AI landing page" so far: purple gradients, Inter everywhere, three identical
cards, fade-up on everything. Your job is a page that looks like a studio made it.

Follow the phases in order. Do not skip Phase 0 or Phase 5.

## Phase 0: Study the references (mandatory)

1. Open every image in `/references` (or the images attached to the prompt) and
   write down, for each: palette (4 hex values), headline typeface style,
   where the hero object sits, what overlaps what, corner radii, nav style.
2. Extract the shared DNA. In the reference set it is:
   - ONE hero object (3D render or product cutout) that breaks out of its
     container and overlaps the headline.
   - Oversized, tightly leaded headline that interacts with the object
     (text behind AND in front of it).
   - Pill-shaped UI: floating pill nav, pill buttons, pill input.
   - Very few colors: one background tone, one ink, one accent.
   - Soft, believable shadows and light. Clay, glass or matte-plastic look.
   - Large radii (28-40px) on cards; thick inset frame on some pages.
   - Bento grids where each tile has its own color and one real UI snippet.
   - Small tidy nav, lots of empty space around the hero.
3. Do NOT copy any reference. Borrow the structure and craft, then make
   choices specific to this product.

## Phase 1: Design plan (write `DESIGN_PLAN.md`, then self-review)

Include:
- **Product facts**: name, one-line purpose, audience, the one action a visitor
  should take. If missing, assume sensibly and state the assumption in one line.
  Do not stop to ask.
- **Tokens**: 4-6 named hex colors, one display font, one body font, radius
  scale, shadow recipe, spacing scale.
- **Hero concept**: what the hero object is and why it fits THIS product.
- **Section list** with one sentence each, plus an ASCII wireframe of hero
  and the bento section.
- **Copy deck**: every headline, subhead, button label, and tile text, written
  now. No lorem ipsum, ever.

Self-review: if any choice is what you would produce for any SaaS page, change
it and note what you changed. Then build.

### Palettes (pick ONE, adapt hex values, never mix two)

| Name | Base | Ink | Accent(s) |
|---|---|---|---|
| Lavender glass | #E9E7F5 to #FBEFE9 gradient | #0B1033 | #B14DFF, #FF8FB8 |
| Matcha frame | #A8A55A | #2F3B1F | #ECEBDD, #7A1F2B |
| Console | #C9BFB8 | #1B1613 | #FF6A1A, #F2EDE6 |
| Bento bakery | #EFEFE6 | #121212 | #F4B95A, #8EC1E6, #EE8F57, #1F5A3E |

### Type (pick ONE pairing)

| Mood | Display | Body |
|---|---|---|
| Clean geometric | Montserrat 800 or Plus Jakarta Sans 800 | DM Sans |
| Chunky friendly | Bagel Fat One or Lilita One | Nunito |
| Wide techno | Unbounded or Syne | Manrope |
| Editorial heavy | Gloock or Young Serif | Instrument Sans |

Headline: `clamp(3.5rem, 9vw, 9.5rem)`, line-height 0.92, letter-spacing -0.03em.
Self-host or load via Google Fonts with `display=swap`. Body 16-18px, max
line length 70 characters.

## Phase 2: Assets (the step that fixes "AI slop")

Generic pages fail because they use CSS blobs instead of real hero art. Make
real art.

1. Use the image generation tool if available. Generate the hero object and
   2-4 satellite objects as separate images on a plain background, then cut
   out to transparent WebP. If no tool is available, write
   `assets/PROMPTS.md` with the prompts below and build the page with a
   clean placeholder box named for each asset so swapping is one line.
2. Prompt template for the hero (fill the brackets):
   > Single [object that represents the product, e.g. a cluster of translucent
   > glass spheres joined by thin light threads], soft 3D clay/glass render,
   > pastel [palette name] colors, studio softbox lighting, soft contact
   > shadow, centered, plenty of empty space, no text, no logos, 2048px.
3. Satellites: same style, same lighting, smaller objects (tiles, coins,
   leaves, icons). Consistency of lighting matters more than detail.
4. Save to `public/assets/`, WebP, under 300 KB each (hero under 500 KB).
5. Verify every file exists and loads (no 404s) before moving on.
6. Never hotlink Unsplash, Pexels or placeholder.com. They break.
7. Icons: one consistent set (Lucide or Phosphor), stroke width 1.75. No emoji
   as icons.

## Phase 3: Build

Stack: use the project's existing stack. If none, use Vite + React +
plain CSS variables + GSAP (with ScrollTrigger) + Lenis. Avoid adding Tailwind
to an existing project unless it is already configured; version mismatches
break builds.

### Hero recipe (spend the boldness here)

Layer as a sandwich:
- z0: background (flat color or soft gradient) and the giant headline.
- z1: the hero object, large, slightly rotated, overlapping the headline and
  bleeding past the edge of its frame.
- z2: foreground pieces: pills, a floating price/stat chip, satellite objects
  tilted 8-18 degrees at different depths.
- Floating pill nav (centered or top-left), one white pill CTA.
- Left-aligned copy block under the headline, max 2 lines of subhead.

Parallax: hero object moves slower than satellites on scroll (about 0.2x vs
0.5x). Satellites idle with a slow 6-10s float.

### Required sections (adapt to the product)

1. Hero (above).
2. Bento grid, 4-6 tiles, DIFFERENT sizes and colors from the palette, each
   with one real UI snippet (a match card, a message draft, a chart), not an icon.
3. One interactive moment: a role switcher, a live typing demo, a slider. It
   must actually work.
4. Proof or trust: real, honest content. If you have no real testimonials or
   numbers, show how the product protects people (consent, privacy). Never
   invent logos, reviews, or stats.
5. Final call to action with a pill input or button, then a minimal footer
   with only working links.

### Motion rules

- ONE orchestrated load sequence for the hero (headline lines slide in,
  object scales in, satellites settle). 1.2s total.
- Scroll-linked parallax on the hero only, plus smooth scrolling via Lenis.
- Hover/press feedback on buttons and tiles only. No fade-up on every section.
- Honor `prefers-reduced-motion` by disabling parallax, float and smooth scroll.

### Stretch: live 3D (only after everything else is done and verified)

For an Igloo.inc-style effect, use React Three Fiber with
`MeshTransmissionMaterial` for glass and a single HDRI. Keep geometry simple,
cap pixel ratio at 2, lazy-load the canvas, and keep the pre-rendered image as a
fallback for mobile and slow devices. If it risks the deadline, skip it. A
polished static hero beats a broken WebGL one.

## Banned list (these are the "AI slop" tells)

- Purple-to-blue gradient blobs or mesh gradients as decoration.
- Inter, Roboto, Poppins or system fonts as the display face.
- Three identical feature cards with an icon, a title and two lines.
- Glassmorphism on everything. Glass only on the hero object.
- Fade-up on every section; hover lift on every card.
- Centered hero with two buttons and a browser mockup screenshot.
- Words like "revolutionize", "empower", "unlock", "seamless", "next-gen".
- Tracked-out ALL-CAPS eyebrow above every heading. Numbered 01/02/03 unless
  the content is truly a sequence. Highlighting a single word in a headline.
- Cream background with terracotta accent; near-black with acid green.
- Fake testimonials, stock avatars, invented logos or user counts.
- One border radius on everything and the same grey shadow on every card.
- Lorem ipsum, "Feature one", "Your tagline here", or "Company Name".

## Phase 4: Copy rules

Plain verbs, sentence case, specific over clever. Buttons say what happens
("Find my college", not "Get started"). Headline names the outcome in 8 words
or fewer. Subhead says who it is for and how it works in one sentence.

## Phase 5: Verify (mandatory, do not report done without it)

1. Run the dev server. Use the browser tool to load the page and take
   screenshots at 1440x900, 768x1024 and 390x844.
2. Check and fix:
   - [ ] No console errors, no 404 assets, no layout shift on load.
   - [ ] No horizontal scroll at any width.
   - [ ] Hero object visibly overlaps the headline and is not cropped awkwardly.
   - [ ] Text contrast at least 4.5:1 on every background, including over art.
   - [ ] Only one display font and one body font loaded.
   - [ ] Every button and link works or is removed.
   - [ ] Keyboard focus visible.
   - [ ] Mobile hero still reads clearly (stack, scale object down, keep overlap).
3. Compare your screenshot to the reference images. Name the three biggest
   gaps in craft (spacing, shadow, type scale, color) and fix them. Do at most
   two polish iterations, then stop.
4. Remove one decorative element before finishing.

## Final report (keep it short)

List: the palette and fonts chosen, which assets were generated or are still
placeholders, what was verified, and anything the user must do (API keys,
swapping an image).

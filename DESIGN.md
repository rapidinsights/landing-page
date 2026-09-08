# Design System

Reference for the **values** of this project's visual language — tokens, type roles, motion primitives, shape, and layout conventions. The **principles** ("why" and "how to work") live in [CLAUDE.md](CLAUDE.md).

When the two drift: DESIGN.md is the source of truth for _what exists_; CLAUDE.md is the source of truth for _how to work_.

---

## Theme mode

- **Light only.** `ui.theme: 'light:only'` in [src/config.yaml](src/config.yaml). `color-scheme: light only` is set on `:root` in [CustomStyles.astro:10](src/components/CustomStyles.astro#L10).
- **Do not add `dark:` variants to new components.** Existing `dark:` classes are AstroWind template residue — leave them alone, don't propagate them.
- The `.dark` CSS variable block in [CustomStyles.astro:71-91](src/components/CustomStyles.astro#L71-L91) is dormant template residue and will never render.

## Color tokens

Defined as CSS variables in [CustomStyles.astro:18-28](src/components/CustomStyles.astro#L18-L28), exposed to Tailwind in [tailwind.config.js:9-16](tailwind.config.js#L9-L16). Always use the Tailwind alias — never hardcode hex.

| CSS variable              | Value                 | Tailwind alias     | Role                                                                                                 |
| ------------------------- | --------------------- | ------------------ | ---------------------------------------------------------------------------------------------------- |
| `--aw-color-primary`      | `rgb(1 97 239)`       | `primary`          | Deep blue — focus rings, primary-button hover fill, link accents                                     |
| `--aw-color-secondary`    | `rgb(1 84 207)`       | `secondary`        | Darker blue — tagline text, secondary accents                                                        |
| `--aw-color-accent`       | `rgb(109 40 217)`     | `accent`           | Violet — primary-button default fill, highlight borders                                              |
| `--aw-color-text-default` | `rgb(16 16 16)`       | `default`          | Body text (near-black)                                                                               |
| `--aw-color-text-muted`   | `rgb(16 16 16 / 66%)` | `muted`            | De-emphasized copy, captions                                                                         |
| `--aw-color-bg-section`   | `rgb(239 246 255)`    | `section`          | Light blue-white section backgrounds                                                                 |
| `--aw-color-text-heading` | `rgb(0 0 0)`          | _(not aliased)_    | Pure black for headings; used via CSS var                                                            |
| `--aw-color-bg-page`      | `rgb(255 255 255)`    | _(via `.bg-page`)_ | Page background; applied via utility in [tailwind.css:35-37](src/assets/styles/tailwind.css#L35-L37) |
| `--aw-color-bg-page-dark` | `rgb(3 6 32)`         | _(via `.bg-dark`)_ | Very dark navy; used for dark-background sections (Hero gradients, FinalCTA)                         |

Selection highlight on the default theme is `lavender` — see [CustomStyles.astro:30-32](src/components/CustomStyles.astro#L30-L32).

## Alt themes (dormant)

Class-triggered overrides defined in [CustomStyles.astro:35-69](src/components/CustomStyles.astro#L35-L69). Not applied anywhere in production; kept for exploration.

- `theme-prussian-orange` — navy primary (`rgb(20 33 61)`) + bright orange accent (`rgb(252 163 17)`)
- `theme-refined-gold` — charcoal primary (`rgb(45 45 45)`) + warm gold accent (`rgb(212 168 67)`)

The **default** (no class) is the production theme.

---

## Typography — voice palette

Four variable font families, each with a deliberate role. The interplay **is** the voice; reach for each one deliberately. Imports in [CustomStyles.astro:2-5](src/components/CustomStyles.astro#L2-L5), mapping in [CustomStyles.astro:12-16](src/components/CustomStyles.astro#L12-L16), Tailwind aliases in [tailwind.config.js:17-23](tailwind.config.js#L17-L23).

| Tailwind alias | Family                     | Role                                                               |
| -------------- | -------------------------- | ------------------------------------------------------------------ |
| `font-sans`    | Inter Variable             | Body, UI, default text                                             |
| `font-serif`   | Inter Variable (same)      | Fallback; rarely used distinctly                                   |
| `font-heading` | Plus Jakarta Sans Variable | Section titles, H2s                                                |
| `font-mono`    | JetBrains Mono Variable    | Labels, metrics, eyebrow text — editorial credibility              |
| `font-display` | Lora Variable              | Sparingly, for pull moments (italic callouts, signature headlines) |

## Type tokens

Custom scale extensions in [tailwind.config.js:24-30](tailwind.config.js#L24-L30):

- `leading-tighter` — `1.2`
- `tracking-heading` — `-0.02em`
- `tracking-label` — `0.12em` (use with `uppercase` + `font-mono` for eyebrows)

Global rule in [tailwind.css:29-31](src/assets/styles/tailwind.css#L29-L31):

- `text-wrap: balance` is applied to every `h1` and `h2`. Don't override it without a line-break reason.

Body `line-height: 1.6` is set on `body` in [tailwind.css:12-14](src/assets/styles/tailwind.css#L12-L14).

---

## Shape

- **Buttons are pill.** `.btn` base uses `rounded-full` in [tailwind.css:54](src/assets/styles/tailwind.css#L54). The pill shape is the signature button language — do not sharpen it.
- **Cards use `rounded-xl` / `rounded-2xl`** across widgets. Pick per section; stay in that range.
- Sharp-corner experiments need a design conversation first — they invert the current shape language.

## Vertical rhythm & layout

Defaults in [WidgetWrapper.astro:25-27](src/components/ui/WidgetWrapper.astro#L25-L27):

- **WidgetWrapper baseline** — `py-12 md:py-16 lg:py-20` (standard sections, applied automatically by the wrapper)
- **Tall / signature sections** — `py-16 md:py-24 lg:py-32` (FAQ, Case Studies, Problem/Solution — override the baseline when a section needs to breathe)
- **Horizontal padding** — `px-4 md:px-6`
- **Scroll offset** — `scroll-mt-[72px]` (compensates for sticky header)

Container widths in use across widgets:

| Width       | When                                    |
| ----------- | --------------------------------------- |
| `max-w-3xl` | Headlines, FAQ, narrow editorial blocks |
| `max-w-4xl` | About / guide sections                  |
| `max-w-5xl` | Case studies, solution stack            |
| `max-w-6xl` | Feature grids                           |
| `max-w-7xl` | Full-bleed sections, hero               |

Vary container width across sections — the rhythm of width changes is itself a design element. See CLAUDE.md principle 5.

---

## Button primitives

Defined in [tailwind.css:52-68](src/assets/styles/tailwind.css#L52-L68); consumed via [Button.astro](src/components/ui/Button.astro) with a `variant` prop.

| Class            | Variant               | Visual                                                                                        |
| ---------------- | --------------------- | --------------------------------------------------------------------------------------------- |
| `.btn`           | base                  | Pill, gray border, transparent bg, hover gray-100, active scale-[0.98]                        |
| `.btn-primary`   | `variant="primary"`   | Violet `accent` fill with blue `primary` text → hovers to `primary` blue fill with white text |
| `.btn-secondary` | `variant="secondary"` | `.btn` base, no additional styling                                                            |
| `.btn-tertiary`  | `variant="tertiary"`  | Borderless, muted text, hovers to `gray-900` — **link-like, not a color variant**             |

Note: the `tertiary` name refers to a _button role_, not a color token. There is no `tertiary` color in the palette.

Focus ring is `focus:ring-primary focus:ring-2 focus:ring-offset-2` across all variants.

---

## Motion primitives

Three primitives, no fourth without a conversation (no GSAP, Framer Motion, Motion One, etc.):

### 1. Lenis — page-level smooth scrolling

Initialized in [SmoothScroll.astro](src/components/common/SmoothScroll.astro) with exactly:

```js
new Lenis({ autoRaf: true });
```

Four lines of script. **Do not expand.** Destroy/re-init logic is only needed under SPA routing, which this project does not use.

### 2. Intersect reveal — scroll-triggered fade/translate

CSS + a tiny `IntersectionObserver` helper in [BasicScripts.astro:160-263](src/components/common/BasicScripts.astro#L160-L263). The `intersect` Tailwind variant is registered in [tailwind.config.js:46-48](tailwind.config.js#L46-L48) as `&:not([no-intersect])`.

**Default class chain** (use this; don't invent new motion):

```
intersect-once intersect-quarter motion-safe:md:opacity-0 motion-safe:md:intersect:animate-fade
```

Modifiers:

- `intersect-full` / `intersect-half` / `intersect-quarter` — visibility threshold (0.99 / 0.5 / 0.25; default is 0)
- `intersect-once` — unobserve after first trigger (almost always wanted)
- `intersect-no-queue` — skip the 100ms stagger between sibling reveals

`WidgetWrapper.astro` applies the default chain automatically with `intersect-no-queue`.

### 3. CSS transitions / `@keyframes`

For hover states, button press feedback, micro-interactions. The one project-level keyframe is `fadeInUp` in [tailwind.config.js:32-41](tailwind.config.js#L32-L41):

```js
fadeInUp: { '0%': { opacity: 0, translateY: '2rem' }, '100%': { opacity: 1, translateY: 0 } }
// exposed as: animation: { fade: 'fadeInUp 1s both' }
```

Applied via the `animate-fade` utility inside the intersect chain above.

Anything that doesn't fit one of these three primitives is a design conversation, not an implementation detail.

---

## Grain overlay

Defined at `body::after` in [tailwind.css:17-27](src/assets/styles/tailwind.css#L17-L27). Intentional texture that breaks digital flatness.

- Fixed full-viewport SVG fractal noise (`feTurbulence`, `baseFrequency='0.85'`, 4 octaves)
- Opacity `0.035` — extremely subtle by design
- `z-index: 9999`, `pointer-events: none`
- **Do not remove.** If something feels slightly noisy, that's why.

---

## Layout primitives

- [WidgetWrapper.astro](src/components/ui/WidgetWrapper.astro) — standard section container. Applies the baseline vertical rhythm, the default intersect reveal chain, and `scroll-mt-[72px]`. Most widgets wrap their content in this.
- [Headline.astro](src/components/ui/Headline.astro) — the tagline / title / subtitle triad. Tagline defaults to `font-bold tracking-wide uppercase text-secondary`. Title uses `font-heading font-bold leading-tighter tracking-tighter`.
- [Button.astro](src/components/ui/Button.astro) — variant-driven button or link. Renders `<button>` for `type="button|submit|reset"`, otherwise `<a>`. Merges variant classes with consumer classes via `twMerge`.

---

## Source file map

| Concern                                                           | File                                                                                 |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| CSS variables, font imports, alt themes                           | [src/components/CustomStyles.astro](src/components/CustomStyles.astro)               |
| Tailwind token exposure, intersect variant, keyframes             | [tailwind.config.js](tailwind.config.js)                                             |
| Base layer, grain overlay, `.btn` primitives, header scroll state | [src/assets/styles/tailwind.css](src/assets/styles/tailwind.css)                     |
| Intersect reveal engine, header scroll detection                  | [src/components/common/BasicScripts.astro](src/components/common/BasicScripts.astro) |
| Lenis smooth scroll                                               | [src/components/common/SmoothScroll.astro](src/components/common/SmoothScroll.astro) |
| Layout primitives                                                 | [src/components/ui/](src/components/ui/)                                             |
| Theme toggle (light-only)                                         | [src/config.yaml](src/config.yaml)                                                   |

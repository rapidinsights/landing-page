# Design System

Reference for the **values** of this project's visual language — tokens, type roles, motion primitives, shape, and layout conventions. The **principles** ("why" and "how to work") live in [CLAUDE.md](CLAUDE.md).

When the two drift: DESIGN.md is the source of truth for _what exists_; CLAUDE.md is the source of truth for _how to work_.

---

## Theme mode

- **Light only.** `ui.theme: 'light:only'` in [src/config.yaml](src/config.yaml). `color-scheme: light only` is set on `:root` in [CustomStyles.astro:17](src/components/CustomStyles.astro#L17).
- **Do not add `dark:` variants to new components.** Existing `dark:` classes are AstroWind template residue — leave them alone, don't propagate them.
- The `.dark` CSS variable block in [CustomStyles.astro:89-110](src/components/CustomStyles.astro#L89-L110) is dormant template residue and will never render.

## Color tokens

Defined as CSS variables in [CustomStyles.astro](src/components/CustomStyles.astro), exposed to Tailwind in [tailwind.config.js:9-22](tailwind.config.js#L9-L22). Always use the Tailwind alias — never hardcode hex.

### The channel-list convention (read before adding a token)

Every colour token is a **bare space-separated channel list**, never wrapped in `rgb()`:

```css
--aw-color-primary: 20 33 61; /* correct */
--aw-color-primary: rgb(20 33 61); /* WRONG — breaks opacity modifiers */
```

`tailwind.config.js` then composes each one with the `<alpha-value>` placeholder:

```js
primary: 'rgb(var(--aw-color-primary) / <alpha-value>)',
```

**This is not cosmetic.** Tailwind can only apply an opacity modifier to a colour written with `<alpha-value>`. Given a bare `var(--token)`, a utility like `text-primary/10` is **silently dropped** — no CSS rule is emitted at all, the element just inherits its parent's colour, and nothing warns. `npm run check` passes, the class looks right in the markup, and the page renders wrong. Non-alpha utilities keep working either way, which is what makes the failure so quiet.

A channel list **cannot itself carry an alpha**. A token that needs one either flattens to its composite over that block's own `--aw-color-bg-page`, or drops the alpha and states it at the call site — which is why `muted-on-dark` is used as `text-muted-on-dark/80`.

| CSS variable                    | Value         | Tailwind alias     | Role                                                                                                 |
| ------------------------------- | ------------- | ------------------ | ---------------------------------------------------------------------------------------------------- |
| `--aw-color-primary`            | `20 33 61`    | `primary`          | Prussian navy — focus rings, primary-button hover fill, link accents                                 |
| `--aw-color-secondary`          | `45 106 159`  | `secondary`        | Mid blue — eyebrow text, secondary accents. 5.7:1 on white                                           |
| `--aw-color-accent`             | `252 163 17`  | `accent`           | Orange — the scarce accent. 2.0:1 on white, so decorative use only, never body text                  |
| `--aw-color-text-default`       | `26 26 46`    | `default`          | Body text (near-black navy)                                                                          |
| `--aw-color-text-muted`         | `71 85 105`   | `muted`            | De-emphasized copy, captions. Clears WCAG AA at 6.6:1 on `bg-section`                                |
| `--aw-color-text-muted-on-dark` | `250 245 239` | `muted-on-dark`    | De-emphasized cream copy on the Prussian/deep sections. **Always used as `/80`**; clears AA (10.2:1) |
| `--aw-color-bg-section`         | `237 240 247` | `section`          | Cool grey-white section backgrounds                                                                  |
| `--aw-color-bg-prussian`        | `1 28 66`     | `prussian`         | The deep Prussian field behind the Hero, ProblemAgitation and FinalCTA bands                         |
| `--aw-color-text-cream`         | `250 245 239` | `cream`            | Full-strength cream copy on the Prussian field                                                       |
| `--aw-color-text-heading`       | `26 26 46`    | _(not aliased)_    | Headings; used via CSS var                                                                           |
| `--aw-color-bg-page`            | `250 250 250` | _(via `.bg-page`)_ | Page background; applied via utility in [tailwind.css:35-37](src/assets/styles/tailwind.css#L35-L37) |
| `--aw-color-bg-page-dark`       | `20 33 61`    | _(via `.bg-dark`)_ | Navy; used for dark-background sections                                                              |

Direct consumers outside Tailwind must wrap the token themselves — `rgb(var(--aw-color-bg-page))`, as the `@layer utilities` block in [tailwind.css](src/assets/styles/tailwind.css) does.

`--aw-color-text-muted-on-dark` and `--aw-color-text-cream` now hold the same channels; the former exists only because opacity modifiers used to be broken, and collapsing the two is worthwhile cleanup.

`--aw-color-bg-prussian` and `--aw-color-text-cream` are brand constants declared once on `:root`, not per-theme overrides — the Prussian field and the cream on it are the same in every theme. Most existing components still hardcode these two values as `rgb(1 28 66)` and `#FAF5EF`; migrating those uses to the tokens is deliberately left as separate cleanup.

Selection highlight on the production theme is `rgb(252 163 17 / 30%)` — see [CustomStyles.astro](src/components/CustomStyles.astro).

## Themes

Class-triggered overrides defined in [CustomStyles.astro:50-88](src/components/CustomStyles.astro#L50-L88).

- `theme-prussian-orange` — navy primary (`20 33 61`) + bright orange accent (`252 163 17`)
- `theme-refined-gold` — charcoal primary (`45 45 45`) + warm gold accent (`212 168 67`)

**`theme-prussian-orange` is the production theme** — it is applied on `<html>` in [Layout.astro:27](src/layouts/Layout.astro#L27). `theme-refined-gold` is dormant.

---

## Typography — voice palette

Three variable font families, each with a deliberate role. The interplay **is** the voice; reach for each one deliberately. `@font-face` declarations in [src/assets/styles/fonts.css](src/assets/styles/fonts.css), mapping in [CustomStyles.astro:19-23](src/components/CustomStyles.astro#L19-L23), Tailwind aliases in [tailwind.config.js:24-28](tailwind.config.js#L24-L28).

| Tailwind alias | Family                     | Role                                                               |
| -------------- | -------------------------- | ------------------------------------------------------------------ |
| `font-sans`    | Plus Jakarta Sans Variable | Body, UI, default text                                             |
| `font-serif`   | Plus Jakarta Sans Variable | Fallback; rarely used distinctly                                   |
| `font-heading` | Plus Jakarta Sans Variable | Section titles, H2s                                                |
| `font-mono`    | JetBrains Mono Variable    | Labels, metrics, eyebrow text — editorial credibility              |
| `font-display` | Lora Variable              | Sparingly, for pull moments (italic callouts, signature headlines) |

**Three families is a performance budget, not a style preference.** Font bytes
are the largest thing on this page's critical path: a fourth family (Inter,
removed) pushed the four-family total to 153 KB and took `/` LCP to 2.33s,
past the 2.0s ceiling. Three fits at ~105 KB and 1.73s. Plus Jakarta Sans
absorbed body copy when Inter went, since the two were doing the same job.
Adding a family means removing one — `npm run audit` will tell you.

Faces are declared by hand rather than through `@fontsource-variable/<family>`,
whose `index.css` ships six unicode subsets per family when the browser only
ever fetches latin.

## Type tokens

Custom scale extensions in [tailwind.config.js:25-31](tailwind.config.js#L25-L31):

- `leading-tighter` — `1.2`
- `tracking-heading` — `-0.02em`
- `tracking-label` — `0.12em` (use with `uppercase` + `font-mono` for eyebrows)

Global rule in [tailwind.css:29-31](src/assets/styles/tailwind.css#L29-L31):

- `text-wrap: balance` is applied to every `h1` and `h2`. Don't override it without a line-break reason.

Body `line-height: 1.6` is set on `body` in [tailwind.css:12-14](src/assets/styles/tailwind.css#L12-L14).

## Type scale

Every piece of text on the page takes one role from this table. Pick the role,
copy its classes. Sizes step up by roughly 1.25x above body, so each jump reads
as a deliberate change in rank.

| Role      | Classes                            | Size (px, mobile → md → lg) | Family and weight                       | Used for                                          |
| --------- | ---------------------------------- | --------------------------- | --------------------------------------- | ------------------------------------------------- |
| `label`   | `text-xs`                          | 12                          | `font-mono` uppercase `tracking-label`  | Eyebrows, meta lines, card labels, client rail    |
| `small`   | `text-sm`                          | 14                          | `font-sans`                             | Case card detail lists, fine print, footer        |
| `body`    | `text-base`                        | 16                          | `font-sans` `leading-relaxed`           | Example lines, FAQ answers, case card lines       |
| `lead`    | `text-lg md:text-xl`               | 18 → 20                     | `font-sans` `leading-relaxed`           | Hero subline, every section intro, Method copy    |
| `title`   | `text-2xl md:text-3xl`             | 24 → 30                     | `font-heading` semibold/bold            | Method step titles, Offer price, the pull quote\* |
| `metric`  | `text-3xl md:text-4xl`             | 30 → 36                     | `font-heading` bold `tabular-nums`      | Case study numbers                                |
| `section` | `text-3xl md:text-5xl`             | 30 → 48                     | `font-heading` bold `tracking-heading`  | Every section H2                                  |
| `display` | `text-5xl md:text-6xl lg:text-7xl` | 48 → 60 → 72                | `font-heading` bold `leading-[1.03]`    | Hero H1 only                                      |
| `numeral` | `text-6xl md:text-8xl`             | 60 → 96                     | `font-heading` extrabold `tabular-nums` | Method's step numerals only (signature moment)    |

\* The pull quote uses `title` size in `font-display`.

Rules:

- **No arbitrary sizes.** `text-[10px]`, `text-[78px]` and the like are off the
  scale. If no role fits, that is a design conversation, not a new value.
- **Nothing under 12px.** Mono uppercase labels are already hard to read small.
- **`display` and `numeral` appear once each.** They are the Hero and Method
  focal points; reusing their size anywhere else flattens both.
- **Headings use `tracking-heading`**, not Tailwind's `tracking-tight`.
- Header nav and footer brand are site chrome and sit outside this scale.

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

CSS + a tiny `IntersectionObserver` helper in [BasicScripts.astro:160-263](src/components/common/BasicScripts.astro#L160-L263). The `intersect` Tailwind variant is registered in [tailwind.config.js:47-49](tailwind.config.js#L47-L49) as `&:not([no-intersect])`.

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

For hover states, button press feedback, micro-interactions. The one project-level keyframe is `fadeInUp` in [tailwind.config.js:33-42](tailwind.config.js#L33-L42):

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

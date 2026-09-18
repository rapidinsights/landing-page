import defaultTheme from 'tailwindcss/defaultTheme';
import plugin from 'tailwindcss/plugin';
import typographyPlugin from '@tailwindcss/typography';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,json,md,mdx,ts,tsx,vue}'],
  theme: {
    extend: {
      // Tokens are channel lists in CustomStyles.astro; the `<alpha-value>`
      // placeholder is what lets Tailwind compose `text-primary/10`. A bare
      // `var(--token)` here silently drops every opacity modifier instead.
      colors: {
        primary: 'rgb(var(--aw-color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--aw-color-secondary) / <alpha-value>)',
        accent: 'rgb(var(--aw-color-accent) / <alpha-value>)',
        default: 'rgb(var(--aw-color-text-default) / <alpha-value>)',
        muted: 'rgb(var(--aw-color-text-muted) / <alpha-value>)',
        'muted-on-dark': 'rgb(var(--aw-color-text-muted-on-dark) / <alpha-value>)',
        section: 'rgb(var(--aw-color-bg-section) / <alpha-value>)',
        prussian: 'rgb(var(--aw-color-bg-prussian) / <alpha-value>)',
        cream: 'rgb(var(--aw-color-text-cream) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--aw-font-sans, ui-sans-serif)', ...defaultTheme.fontFamily.sans],
        serif: ['var(--aw-font-serif, ui-serif)', ...defaultTheme.fontFamily.serif],
        heading: ['var(--aw-font-heading, ui-sans-serif)', ...defaultTheme.fontFamily.sans],
        mono: ['var(--aw-font-mono, ui-monospace)', ...defaultTheme.fontFamily.mono],
        display: ['var(--aw-font-display, ui-serif)', ...defaultTheme.fontFamily.serif],
      },
      lineHeight: {
        tighter: '1.2',
      },
      letterSpacing: {
        heading: '-0.02em',
        label: '0.12em',
      },

      animation: {
        fade: 'fadeInUp 1s both',
        stamp: 'stampDown 0.45s cubic-bezier(0.2, 0.8, 0.3, 1.2) both',
      },

      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(2rem)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        stampDown: {
          '0%': { opacity: 0, transform: 'scale(1.35) rotate(-2.5deg)' },
          '60%': { opacity: 1, transform: 'scale(0.97) rotate(-2.5deg)' },
          '100%': { opacity: 1, transform: 'scale(1) rotate(-2.5deg)' },
        },
      },
    },
  },
  plugins: [
    typographyPlugin,
    plugin(({ addVariant }) => {
      addVariant('intersect', '&:not([no-intersect])');
    }),
  ],
  darkMode: 'class',
};

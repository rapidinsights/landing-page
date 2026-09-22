import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { defineConfig, fontProviders } from 'astro/config';

import { unified } from '@astrojs/markdown-remark';

import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import icon from 'astro-icon';
import compress from 'astro-compress';

import astrowind from './vendor/integration';

import { readingTimeRemarkPlugin, responsiveTablesRehypePlugin, lazyImagesRehypePlugin } from './src/utils/frontmatter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  output: 'static',

  // Astro 7 defaults to 'jsx', which strips the whitespace between inline
  // elements that the copy relies on.
  compressHTML: true,

  // Prefetch is enabled for internal links that opt in via `data-astro-prefetch`.
  prefetch: {
    defaultStrategy: 'hover',
  },

  // Both stylesheets were render-blocking round trips ahead of the hero's first
  // paint (Lighthouse: ~750ms). Inlining them trades cross-page caching, which a
  // one-page site barely uses, for a shorter critical path.
  build: { inlineStylesheets: 'always' },

  // The voice palette, self-hosted from the build. Latin subset only: the
  // browser never fetches the others, and font bytes are the LCP budget. Keep
  // it to three families (see CLAUDE.md). Each is mapped onto the --aw-font-*
  // tokens in CustomStyles.astro, which also preloads the heading font.
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Plus Jakarta Sans',
      cssVariable: '--font-jakarta',
      weights: ['200 800'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'JetBrains Mono',
      cssVariable: '--font-jetbrains-mono',
      weights: ['100 800'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['monospace'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Lora',
      cssVariable: '--font-lora',
      weights: ['400 700'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['serif'],
    },
  ],

  integrations: [
    sitemap({
      // The tag pages are noindex, so they have no business in the sitemap.
      filter: (page) => !page.includes('/tag/'),
    }),
    {
      // The sitemap library always writes the homepage with a trailing slash,
      // while the page's canonical has none. Rewrite the file so the two agree.
      // Must stay listed after sitemap(): build:done hooks run in this order.
      name: 'sitemap-home-without-slash',
      hooks: {
        'astro:build:done': ({ dir }) => {
          const file = new URL('sitemap-0.xml', dir);
          const xml = fs.readFileSync(file, 'utf8').replace(/<loc>(https?:\/\/[^/<]+)\/<\/loc>/, '<loc>$1</loc>');
          fs.writeFileSync(file, xml);
        },
      },
    },
    mdx(),
    icon({
      include: {
        tabler: ['*'],
        'flat-color-icons': [
          'template',
          'gallery',
          'approval',
          'document',
          'advertising',
          'currency-exchange',
          'voice-presentation',
          'business-contact',
          'database',
        ],
      },
    }),
    compress({
      // csso drops the media range syntax Tailwind 4 emits for breakpoints
      // (`@media (width>=48rem)`), which silently removes every md:/lg: rule.
      CSS: { csso: false, lightningcss: { minify: true } },
      HTML: {
        'html-minifier-terser': {
          removeAttributeQuotes: false,
        },
      },
      Image: false,
      JavaScript: true,
      SVG: false,
      Logger: 1,
    }),
    astrowind({
      config: './src/config.yaml',
    }),
  ],

  image: {
    domains: ['cdn.pixabay.com'],
  },

  markdown: {
    processor: unified({
      remarkPlugins: [readingTimeRemarkPlugin],
      rehypePlugins: [responsiveTablesRehypePlugin, lazyImagesRehypePlugin],
    }),
  },

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src'),
      },
    },
  },
});

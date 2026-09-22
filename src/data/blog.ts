// The case studies index's filters. Categories split entries by kind; case studies
// are the only kind, and a second kind needs its own route before it can be listed.
// Tags are the outcomes an entry delivered, listed in the order of `outcomes`.

import { cases, outcomes, type Case, type Outcome } from './cases';

export interface BlogCategory {
  slug: string;
  title: string;
  // What one entry is called, shown above its title.
  entryLabel: string;
  entries: Case[];
}

export const categories: BlogCategory[] = [
  {
    slug: 'case-studies',
    title: 'Case studies',
    entryLabel: 'Case study',
    entries: [...cases].sort((a, b) => b.finished.localeCompare(a.finished)),
  },
];

export const tagSlug = (tag: Outcome): string => tag.toLowerCase().replace(/[^a-z0-9]+/g, '-');

// Only outcomes some entry actually claims, so every tag leads somewhere.
export const tags: Outcome[] = outcomes.filter((o) =>
  categories.some((cat) => cat.entries.some((c) => c.outcomes.includes(o)))
);

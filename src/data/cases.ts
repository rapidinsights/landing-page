// Shared by the CaseStudies cards on / and the pages at /cases/[slug]: the card's
// peek shows the opening of the same story the page tells in full.
// Bracketed values and the lorem ipsum story are placeholders until the real cases land.

const lorem = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
];

const placeholderStory = [
  { heading: 'What was going wrong', paragraphs: lorem },
  { heading: 'What I found', paragraphs: lorem },
  { heading: 'What changed', paragraphs: lorem },
];

export interface Case {
  slug: string;
  label: string;
  name: string;
  business: string;
  problem: string;
  value: string;
  // Where the value came from, e.g. "Labor reduction: 180 hrs a month at $45 an hour".
  basis: string;
  took: string;
  story: { heading: string; paragraphs: string[] }[];
}

export const cases: Case[] = [
  {
    slug: 'abm-sop-generator',
    label: 'SOP creation',
    name: 'ABM',
    business: 'Facility services, Fortune 500 division',
    problem: 'Writing one procedure by hand takes a whole day.',
    value: '[$Value]',
    basis: '[Where it came from, e.g. labor reduction]',
    took: '[X weeks]',
    story: placeholderStory,
  },
  {
    slug: 'abm-budget-reporting',
    label: 'budget reporting',
    name: 'ABM',
    business: 'Facility services, Fortune 500 division',
    problem:
      'Every month your team loses days pulling numbers out of four systems, and the report is stale by the time it lands.',
    value: '[$Value]',
    basis: '[Where it came from, e.g. labor reduction]',
    took: '[X weeks]',
    story: placeholderStory,
  },
  {
    slug: 'apparel-redefined-receiving',
    label: 'receiving bottleneck',
    name: 'Apparel Redefined',
    business: 'Embroidery, print and fulfilment, Chicago, [size]',
    problem: 'Your scorecard says the team is slow, and it does not feel true.',
    value: '[$Value]',
    basis: '[Where it came from, e.g. labor reduction]',
    took: '[X weeks]',
    story: placeholderStory,
  },
];

export const readMinutes = (c: Case): number => {
  const words = c.story
    .flatMap((s) => s.paragraphs)
    .join(' ')
    .split(/\s+/).length;
  return Math.max(1, Math.round(words / 230));
};

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
  story: { heading: string; paragraphs: string[]; quote?: { text: string; source: string } }[];
}

export const cases: Case[] = [
  {
    slug: 'abm-sop-generator',
    label: 'SOP creation',
    name: 'ABM',
    business: 'Facility services, semiconductor accounts, Fortune 500 division',
    problem: 'Writing one maintenance procedure by hand takes half a day.',
    value: '$647,000',
    basis: 'Writing time freed: 8,625 hours at $75 an hour, across the 3,000 documents planned',
    took: '60 days',
    story: [
      {
        heading: 'What was going wrong',
        paragraphs: [
          'A chip plant asked ABM for a written procedure for every machine it maintains. Each one is a step by step guide a technician follows, and each one needs a matching test that proves the technician can do the job.',
          'A writer took about four hours to get one procedure to a first draft, then about two more hours to write the test. Two people could finish about three machines a week. The plan needed three thousand documents.',
          'Then most of that team was moved onto other plants. The work was not slow because anyone was slow. It was slow because every document started from a blank page.',
        ],
      },
      {
        heading: 'What I found',
        paragraphs: [
          'The writers already knew the answers. They were spending their four hours typing what they knew into the right shape: the right sections, the right headings, the right template, the right wording.',
          'The tests were worse. Nobody wrote one from scratch. They opened an old test, copied it, and edited it to match the new machine, which is how small errors travel from document to document.',
          'So the real job was not writing. It was formatting and checking. That part a machine can do, and the part only an expert can do, reading a draft and saying yes or no, was never the thing eating the week.',
        ],
      },
      {
        heading: 'What changed',
        paragraphs: [
          "A writer now pastes what they know about the job. The tool puts it into ABM's sections and hands back a Word file already on their template. One more click reads that procedure and drafts the matching test, with the answer key and the sign-off pages, tied to the procedure it came from.",
          'On one morning in July, ABM timed it: five procedures built in twenty three minutes, and a test in three minutes instead of twenty eight. A procedure now takes about ten minutes instead of four hours.',
          'Nothing gets certified by the tool. Every document still leaves marked as a draft, and an expert still signs it off before it is used. That review happened before and it happens now. Everything in front of it is what changed.',
        ],
        quote: {
          text: 'The new version cut creation time about 90% from the old 4-hour method.',
          source: 'Larry Gillett, Senior Program Director, ABM. From his written test log, July 15, 2026.',
        },
      },
    ],
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

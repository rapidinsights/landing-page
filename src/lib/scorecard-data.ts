// Scorecard question and results data
// Separated from the Svelte component for maintainability

export type Industry = 'construction' | 'manufacturing' | 'professional-services' | 'other';
export type RevenueBand = 'under-2m' | '2m-10m' | '10m-25m' | '25m-50m' | 'over-50m';

export interface AnswerOption {
  text: string;
  points: number;
}

export interface ScoredQuestion {
  id: string;
  type: 'scored';
  question: string;
  icon: string; // Tabler icon name
  options: AnswerOption[];
}

export interface QualifyingQuestion {
  id: string;
  type: 'qualifying';
  question: string;
  icon: string;
  options: { text: string; value: string }[];
}

export type Question = ScoredQuestion | QualifyingQuestion;

// Questions ordered by research: start easy/engaging, save demographic for end
export const questions: Question[] = [
  // Q1: Problem detection — easiest, most relatable opener
  {
    id: 'problem-detection',
    type: 'scored',
    question: 'How do you usually find out about operational problems — before or after they cost you money?',
    icon: 'tabler:alert-triangle',
    options: [
      { text: 'Before — we catch things early with good data', points: 3 },
      { text: 'Sometimes before, sometimes after — depends on the problem', points: 2 },
      { text: "Usually after — we don't see problems until they've already hit", points: 1 },
      { text: 'Almost always after — our whole week is putting out fires', points: 0 },
    ],
  },
  // Q2: Profitability visibility — concrete test
  {
    id: 'profitability',
    type: 'scored',
    question: 'If I asked which of your jobs made money last quarter, could you answer in under 60 seconds?',
    icon: 'tabler:currency-dollar',
    options: [
      { text: 'Yes — by job, by client, without hesitation', points: 3 },
      { text: "Roughly, but I'd need to pull something together", points: 2 },
      { text: 'I could get there, but it would take hours of digging', points: 1 },
      { text: 'Honestly, no', points: 0 },
    ],
  },
  // Q3: Data trust — visceral, personal
  {
    id: 'data-trust',
    type: 'scored',
    question: "When you present numbers in a meeting, how confident are you that they're right?",
    icon: 'tabler:shield-check',
    options: [
      { text: 'Very — I know where they come from and I trust the source', points: 3 },
      { text: "Mostly — but I wouldn't want someone to dig too deep", points: 2 },
      { text: 'I present them, but I have real doubts', points: 1 },
      { text: 'I avoid presenting specific numbers when I can', points: 0 },
    ],
  },
  // Q4: Reporting speed
  {
    id: 'reporting-speed',
    type: 'scored',
    question: "How long does it take to produce a report you'd trust enough to make a decision from?",
    icon: 'tabler:clock',
    options: [
      { text: "Minutes — it's automated and I trust it", points: 3 },
      { text: "A few hours of someone's time", points: 2 },
      { text: "Most of someone's day, sometimes longer", points: 1 },
      { text: "We don't have reports I fully trust", points: 0 },
    ],
  },
  // Q5: Key person risk
  {
    id: 'key-person-risk',
    type: 'scored',
    question: 'If the person who manages your spreadsheets or reporting left tomorrow, what happens?',
    icon: 'tabler:user-exclamation',
    options: [
      { text: 'Nothing — our systems are documented and transferable', points: 3 },
      { text: "Some disruption, but we'd figure it out in a few weeks", points: 2 },
      { text: 'It would be a serious problem for months', points: 1 },
      { text: "We'd lose the ability to see our own numbers", points: 0 },
    ],
  },
  // Q6: Spreadsheet dependence
  {
    id: 'spreadsheet-dependence',
    type: 'scored',
    question: 'How much of your critical business information lives in spreadsheets that one person built?',
    icon: 'tabler:table',
    options: [
      { text: "Very little — we've outgrown that", points: 3 },
      { text: "Some, but they're manageable and shared", points: 2 },
      { text: 'Most of it, and only one or two people understand them', points: 1 },
      { text: 'Nearly all of it — and the person who built them is the only one who knows how they work', points: 0 },
    ],
  },
  // Q7: Growth vs. systems
  {
    id: 'growth-vs-systems',
    type: 'scored',
    question: "As your business has grown, has your ability to see what's going on kept up?",
    icon: 'tabler:trending-up',
    options: [
      { text: 'Yes — our reporting and systems scale with us', points: 3 },
      { text: 'Mostly, but there are growing gaps', points: 2 },
      { text: "No — it's gotten harder to understand what's happening as we've grown", points: 1 },
      { text: "We're definitely running a bigger business on the same tools we had years ago", points: 0 },
    ],
  },
  // Q8: Decision confidence
  {
    id: 'decision-confidence',
    type: 'scored',
    question: 'When you make a major decision — pricing a job, hiring, expanding — are you working from data or gut?',
    icon: 'tabler:brain',
    options: [
      { text: 'Mostly data — we have solid numbers to work from', points: 3 },
      { text: 'A mix, leaning toward data', points: 2 },
      { text: "Mostly gut — the data isn't reliable or available enough", points: 1 },
      { text: "Almost entirely gut — I've been meaning to fix that", points: 0 },
    ],
  },
  // Q9: Industry (qualifying, not scored) — moved to end per research
  {
    id: 'industry',
    type: 'qualifying',
    question: 'What industry are you in?',
    icon: 'tabler:building',
    options: [
      { text: 'Construction / trades', value: 'construction' },
      { text: 'Manufacturing', value: 'manufacturing' },
      { text: 'Professional services', value: 'professional-services' },
      { text: 'Other', value: 'other' },
    ],
  },
  // Q10: Revenue (qualifying, not scored) — moved to end per research
  {
    id: 'revenue',
    type: 'qualifying',
    question: "What's your approximate annual revenue?",
    icon: 'tabler:chart-bar',
    options: [
      { text: 'Under $2M', value: 'under-2m' },
      { text: '$2M – $10M', value: '2m-10m' },
      { text: '$10M – $25M', value: '10m-25m' },
      { text: '$25M – $50M', value: '25m-50m' },
      { text: 'Over $50M', value: 'over-50m' },
    ],
  },
];

export const MAX_SCORE = 24; // 8 scored questions × 3 points max
export const SCORED_QUESTION_COUNT = 8;

// Industry-specific language for results
export const industryLanguage: Record<Industry, { jobWord: string; examples: string }> = {
  construction: {
    jobWord: 'jobs',
    examples: 'jobs priced too low, change orders missed, closeout delays',
  },
  manufacturing: {
    jobWord: 'production runs',
    examples: 'product lines running below margin, yield loss, scrap costs hidden in overhead',
  },
  'professional-services': {
    jobWord: 'projects',
    examples: 'underpriced engagements, scope creep eating margin, utilization gaps',
  },
  other: {
    jobWord: 'jobs',
    examples: 'work priced below true cost, hidden overhead, margin leakage across operations',
  },
};

// Dollar estimate table — conservative math the prospect can verify
export const dollarEstimates: Record<RevenueBand, { label: string; range: string; improvement: string }> = {
  'under-2m': { label: 'under $2M', range: '$20K – $80K', improvement: '2-4%' },
  '2m-10m': { label: '$2M – $10M', range: '$40K – $300K', improvement: '2-3%' },
  '10m-25m': { label: '$10M – $25M', range: '$150K – $750K', improvement: '1.5-3%' },
  '25m-50m': { label: '$25M – $50M', range: '$250K – $1M', improvement: '1-2%' },
  'over-50m': { label: 'over $50M', range: '$500K+', improvement: '1-2%' },
};

// Score tier definitions
export interface ScoreTier {
  min: number;
  max: number;
  label: string;
  summary: string;
  // Full results shown after email capture
  fullResult: (industry: Industry, revenueBand: RevenueBand) => string;
  // Basic results shown when skipping email
  basicResult: string;
  showBookCall: boolean;
}

export const scoreTiers: ScoreTier[] = [
  {
    min: 20,
    max: 24,
    label: 'You can see your business.',
    summary: 'Your operational visibility is strong.',
    fullResult: (_industry, _revenueBand) =>
      "You're ahead of most businesses your size. If anything starts slipping, you'll notice — and that's the point. If you ever want a second pair of eyes on your systems, we're here. Otherwise, keep doing what you're doing.",
    basicResult:
      "Your operational visibility is strong. You're in the minority of businesses your size — most owners can't answer these questions this confidently.",
    showBookCall: false,
  },
  {
    min: 13,
    max: 19,
    label: 'You have visibility in some areas. Not the ones that matter most.',
    summary: 'You have some reporting — but the gaps are where margin quietly disappears.',
    fullResult: (industry, revenueBand) => {
      const lang = industryLanguage[industry];
      const dollars = dollarEstimates[revenueBand];
      return `This is where most growing ${lang.jobWord === 'jobs' ? 'businesses' : 'companies'} in the ${dollars.label} range land. You have some reporting, some answers — but the gaps are where margin quietly disappears. Your Visibility Report shows exactly where your blind spots are and what they're likely costing you.`;
    },
    basicResult:
      "You have some reporting, some answers — but there are real gaps. The information you need to make confident decisions isn't getting to you consistently.",
    showBookCall: true,
  },
  {
    min: 6,
    max: 12,
    label: "You're running a growing business with serious blind spots.",
    summary: 'Your business has outgrown your tools. The blind spots are costing you.',
    fullResult: (industry, revenueBand) => {
      const dollars = dollarEstimates[revenueBand];
      return `You're not alone — this is more common than most owners realize, especially in the ${dollars.label} range where the business has outgrown its tools but enterprise solutions don't fit. Your Visibility Report breaks down your weakest areas and what they typically cost. The short version: it's fixable, and faster than you think.`;
    },
    basicResult:
      "Your business has outgrown the tools you're using to see it. That's not a criticism — it's where most growing businesses land. The gap between what's happening and what you can see is costing you, and it compounds every quarter.",
    showBookCall: true,
  },
  {
    min: 0,
    max: 5,
    label: "You're flying blind. But now you know it.",
    summary: 'The gap between your business and what you can see is significant — and costly.',
    fullResult: (industry, revenueBand) => {
      const dollars = dollarEstimates[revenueBand];
      const lang = industryLanguage[industry];
      return `That's actually the important part. Most ${lang.jobWord === 'jobs' ? 'businesses' : 'companies'} at your score don't realize how much the gap is costing them — they've just gotten used to firefighting and guessing. Your Visibility Report breaks down where the biggest gaps are and puts a dollar range on what they're likely costing a ${dollars.label} operation.\n\nNone of this is hard to fix. It just hasn't been fixed yet.`;
    },
    basicResult:
      "You're making decisions without the information you need to make them well. The cost of that isn't dramatic — it's chronic. Jobs that lose money without anyone noticing, reports nobody trusts, decisions made on gut because the data isn't there.",
    showBookCall: true,
  },
];

export function getScoreTier(score: number): ScoreTier {
  return scoreTiers.find((tier) => score >= tier.min && score <= tier.max) || scoreTiers[scoreTiers.length - 1];
}

// Find the 3 weakest areas (lowest-scoring questions)
export function getWeakestAreas(answers: Record<string, number>): string[] {
  const scoredQuestionIds = questions.filter((q) => q.type === 'scored').map((q) => q.id);

  return scoredQuestionIds
    .filter((id) => id in answers)
    .sort((a, b) => (answers[a] ?? 0) - (answers[b] ?? 0))
    .slice(0, 3);
}

// Human-readable labels for weak areas
export const weakAreaLabels: Record<string, { label: string; actionItem: string }> = {
  'problem-detection': {
    label: 'Problem Detection',
    actionItem:
      'This week, ask your team: "What problem did we catch too late this month?" Write down the first three answers.',
  },
  profitability: {
    label: 'Job Profitability Visibility',
    actionItem:
      "Pull your last 5 completed jobs. Can you identify actual margin on each? If not, that's your starting point.",
  },
  'data-trust': {
    label: 'Data Trust & Confidence',
    actionItem:
      'Before your next meeting, ask: "Where did these numbers come from?" If the answer is one person\'s spreadsheet, you have your diagnosis.',
  },
  'reporting-speed': {
    label: 'Reporting Speed',
    actionItem:
      'Time how long it takes to answer: "How did we do last month?" If it\'s more than 5 minutes, your reporting isn\'t keeping up.',
  },
  'key-person-risk': {
    label: 'Key Person Risk',
    actionItem:
      "Ask yourself: if your reporting person called in sick for a week, what would break? Write it down. That's your risk register.",
  },
  'spreadsheet-dependence': {
    label: 'Spreadsheet Dependence',
    actionItem:
      'Count the spreadsheets that run your business. Now count how many people understand each one. If any number is "1," that\'s a single point of failure.',
  },
  'growth-vs-systems': {
    label: 'Systems Scaling',
    actionItem:
      "Compare your revenue from 3 years ago to today. Now compare your reporting tools. If the tools haven't changed, the gap is growing.",
  },
  'decision-confidence': {
    label: 'Decision Confidence',
    actionItem:
      'Think about the last major pricing decision you made. What data did you have? What data did you wish you had? That gap is your starting point.',
  },
};

// Dollar impact copy for email report
export function getDollarImpactCopy(industry: Industry, revenueBand: RevenueBand, score: number): string {
  const dollars = dollarEstimates[revenueBand];
  const lang = industryLanguage[industry];

  if (score >= 20) {
    return "Your visibility score is strong — you're already making informed decisions. Keep it up.";
  }

  return `You told us you're a ${dollars.label} ${industry === 'other' ? 'business' : lang.jobWord === 'jobs' ? 'construction business' : industry === 'manufacturing' ? 'manufacturer' : 'professional services firm'}. At your visibility score, most of your pricing decisions are based on incomplete information. Even a ${dollars.improvement} margin improvement from being able to see your actual ${lang.jobWord === 'jobs' ? 'job costs' : lang.jobWord === 'production runs' ? 'production costs' : 'project costs'} — which is conservative — would be ${dollars.range} annually. That's what becomes possible when you can see your own numbers.`;
}

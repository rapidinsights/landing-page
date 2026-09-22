// Shared by the CaseStudies cards on / and the pages at /cases/[slug]: the card's
// peek shows the opening of the same story the page tells in full.

import abmTechnicians from '~/assets/images/abm-semiconductor-technicians.webp';
import apparelRedefinedDock from '~/assets/images/apparel-redefined-dock.webp';
import apparelRedefinedDesk from '~/assets/images/apparel-redefined-invoicing-desk.webp';
import apparelRedefinedFloorWatch from '~/assets/images/apparel-redefined-floor-watch-dark.webp';

// The outcomes an engagement can land (CLAUDE.md). The blog filters by these, so a
// case only claims one its story can back up.
export const outcomes = [
  'Eliminate a bottleneck',
  'Increase capacity',
  'Reduce labor',
  'Eliminate recurring errors',
  'Speed up a process',
  'Improve customer experience',
  'Remove frustrating manual work',
  'Increase revenue',
  'Reduce costs',
  'Improve visibility',
  'Make a team dramatically more productive',
] as const;

export type Outcome = (typeof outcomes)[number];

export interface Case {
  slug: string;
  label: string;
  name: string;
  business: string;
  problem: string;
  // The page's meta description, 140 to 155 characters.
  description: string;
  // How it was solved, one or two short lines under the card's figure. The basis stays on the case page.
  teaser: string;
  // The hero metric: the highest ladder level fully substantiated for this case, per
  // docs/impact-measurement.md. Cases land on different levels, so a dollar and a
  // percentage sit side by side and neither the label nor a total can be shared.
  value: string;
  // Word set beside the figure at half its size, e.g. "fewer" or "a year". Omit when the figure stands alone.
  valueUnit?: string;
  // What the figure is. Per case, because "cost avoided" is false for capacity freed.
  valueLabel: string;
  // Where the value came from, e.g. "Labor reduction: 180 hrs a month at $45 an hour".
  basis: string;
  took: string;
  // Month the work finished, as 'YYYY-MM'.
  finished: string;
  outcomes: Outcome[];
  // Photo at the top of the case page. From the client's own site; confirm they are fine with its use before publishing.
  image?: ImageMetadata;
  imageAlt?: string;
  // False keeps a case off the home page's three cards; it still gets its page and a blog entry.
  onHome?: false;
  story: { heading: string; paragraphs: string[]; quote?: { text: string; source: string } }[];
}

export const cases: Case[] = [
  {
    slug: 'abm-sop-generator',
    label: 'SOP creation',
    name: 'ABM',
    business: 'Facility services, Fortune 500 division',
    problem: 'Needed to provide thousands of maintenance procedures, but they took half a day each.',
    description:
      'ABM needed thousands of maintenance procedures, half a day each. A system writes the first draft, cutting time 90% and freeing $69,000 of labor capacity.',
    teaser:
      'We built a system that writes the first draft. It cut the time by 90%, so the experts only do the part that needs an expert.',
    value: '$69,000',
    valueLabel: 'Labor capacity freed',
    basis:
      '921 hours of technical writing at a market rate of $75 an hour, across the 400 documents built so far: 223 procedures and 177 tests.',
    took: '60 days',
    finished: '2026-08',
    outcomes: ['Reduce labor', 'Increase capacity'],
    image: abmTechnicians,
    imageAlt:
      'Two technicians in cleanroom suits on a semiconductor fab floor, one holding a tablet and pointing at equipment.',
    story: [
      {
        heading: 'What was going wrong',
        paragraphs: [
          'A chip plant asked ABM for a written procedure for every machine it maintains. Each one is a step by step guide a technician follows, and each one needs a matching test that proves the technician can do the job.',
          'A writer took about four hours to get one procedure to a first draft, then about half an hour more to make the test. The plan needed thousands of documents.',
          'Every document started from a blank page, and that is where the hours went.',
        ],
      },
      {
        heading: 'What I found',
        paragraphs: [
          'The writers already knew the answers. They were spending their four hours typing what they knew into the right sections, headings, template and wording.',
          'The tests were worse. Nobody wrote one from scratch. They opened an old test, copied it, and edited it to match the new machine, which is how small errors travel from document to document.',
          'So most of the four hours went to formatting, and a machine can do that. The part only an expert can do, reading a draft and saying yes or no, never took much of the time.',
        ],
      },
      {
        heading: 'What changed',
        paragraphs: [
          "A writer now pastes what they know about the job. The tool puts it into ABM's sections and hands back a Word file already on their template. One more click reads that procedure and drafts the matching test, with the answer key and the sign-off pages, tied to the procedure it came from.",
          'On one morning in July, ABM timed it. A procedure took twelve minutes with heavy edits, and three minutes with none. It used to take four hours. A test took three minutes instead of twenty eight.',
          'Four hundred documents have been built this way so far. The number on this page counts those and nothing else, so none of it is a forecast. ABM chose to keep building with it after using it, and that is the part I would pay attention to.',
          'The tool certifies nothing. Every document leaves marked as a draft, and an expert signs it off before anyone uses it, the same as before. Only the work ahead of that review changed.',
        ],
        quote: {
          text: 'About a 90% reduction in creation from old creation method of 4 hours.',
          source: 'Program director, ABM, from written test notes',
        },
      },
    ],
  },
  {
    slug: 'apparel-redefined-receiving',
    label: 'receiving delays',
    name: 'Apparel Redefined',
    business: 'Apparel decoration, Chicago',
    problem: 'One order in ten sat on the dock a week or more before anyone could start making it.',
    description:
      'One order in ten sat on the dock a week or more before work could start. One scan now tells the receiver which order a box is for. 75% fewer orders wait.',
    teaser:
      'Now one scan tells the receiver which order a box belongs to, so the box goes to production instead of waiting on the dock.',
    value: '75%',
    valueUnit: 'fewer',
    valueLabel: 'Orders waiting a week to start',
    basis: 'Down from 1 in 10 to 1 in 40, in weeks just as busy as before.',
    took: '30 days',
    finished: '2026-03',
    outcomes: ['Eliminate a bottleneck', 'Speed up a process', 'Improve customer experience'],
    image: apparelRedefinedDock,
    imageAlt:
      'Apparel Redefined receiving dock, stacked wall to wall with cartons of blank garments on pallets and shelves, a roller conveyor and a packing table in the foreground.',
    story: [
      {
        heading: 'What was going wrong',
        paragraphs: [
          'Apparel Redefined prints and embroiders clothing in Chicago. Blank garments arrive from suppliers by the carton. Before anything can be printed, someone has to work out which customer order a carton belongs to.',
          'That was the hard part. The box carries a tracking number from the carrier. NOMOS, the system that runs their orders, had never known which tracking number belonged to which order, so a receiver worked it out by hand. In January I found they got it right on the first try about half the time.',
          'When it went wrong the box waited. The usual fix was to hold every carton in a group until all of them landed, open them, and sort garments by color and size until the pile matched the paperwork. That took between one and five hours.',
          'One order in ten then sat a week or more before anyone could start making it. In the worst week it was more than half of them. That happened in 2023, again in 2024, and again in 2025. Nobody had put a cost on it, because it showed up as delay and never as a bill.',
        ],
      },
      {
        heading: 'What I found',
        paragraphs: [
          'None of the information was missing. S&S Activewear, their largest supplier, knew what it had packed in each box, the carrier knew when the box arrived, and NOMOS held every open order. The three had just never met at the moment a receiver was standing in front of the carton.',
          'The company could also already prove what it cost. NOMOS has stamped two moments on every order since 2019: when a package was logged in, and when the count was finished. The gap between them is how long a box sat. Nobody had ever looked at it.',
          'So I did not have to build a baseline. There were already three years of the same measure, over the same months of each year, from before I touched anything.',
        ],
      },
      {
        heading: 'What changed',
        paragraphs: [
          'A receiver now scans the tracking barcode on the box. One screen answers the question: this is the order, this is what should be inside this carton, and this is how sure I am. Then they count it in. It took thirty days to build and went live on the first of February.',
          'The tool changed nothing else. NOMOS was not changed, and nobody types anything they did not type before. The tool sits in front of the order system and answers the one question that was costing the week.',
          'Orders stuck a week or more fell from one in ten to one in forty. That is the finding I would defend hardest, because it is the one that held up every time I attacked it.',
          'Speed moved much less. Receiving takes about half a day less per order than it did in the two normal years before this, and a full day less on the largest orders. Orders reach customers about half a day sooner, and the dock accounts for all of it. Production gave a little back. On the smallest orders, which are most of them, the dock got faster and the customer never felt it.',
          'The biggest change is one an average hides. Receiving used to come apart in the busy months, when up to one order in four sat a week or more. It did that in each of those three years, and it has not so far in 2026.',
          'One change nobody asked for: when the pile got bad, people from other jobs used to be pulled onto the dock to help, and that has mostly stopped.',
        ],
      },
      {
        heading: 'What I checked before I believed it',
        paragraphs: [
          "First, whether the crew had simply started typing better dates. They had. It makes the result bigger, not smaller: measured against the carrier's own delivery times instead of anything staff entered, the share of orders stuck a week fell from 7.7% to 0.7%.",
          'Then, whether there was simply less work. There was. Orders were down, and the orders themselves got smaller. So I threw the year-on-year comparison away and rebuilt it. I lined up only the weeks where the crew handled the same weight of work, garment for garment: thirty eight weeks before, seventeen weeks after, with the weeks after running slightly heavier. Stuck orders came out at 10.6% before and 2.6% after. Matching on workload did not move the answer.',
          "Third, which year I was measuring against. 2025 was a slow year here for reasons that have nothing to do with receiving. Comparing 2026 against 2025 alone credits the tool with recovering somebody else's bad year. Against the two normal years, holding order size steady, about half a day came off the total, not the three days I first wrote down.",
          "The correction also made one result stronger. Time at the dock fell in every size of order, and it fell further the bigger the order was: about half a day under 25 garments, three quarters at 25 to 49, a full day over 100. More garments means more boxes, and more boxes means more identification, so a tool that fixes identification should help the big orders most. It does, in order, with no exceptions. The starting point was about the same for every size, so big numbers shrinking faster does not explain it. That pattern is the tool's fingerprint, and it is the best evidence I have that the tool caused the drop.",
          'On the smallest orders, which are most of them, the half day gained at the dock went back out again in production, so those customers did not get their work any sooner. That problem sits in production, and it is the next thing worth looking at.',
          'Fourth, my own number. I had written that the busy weeks now held room worth about $128,000 a year, on the assumption there were ten such weeks a year. So I counted them. In three years of weekly records there were four, not thirty. Then I checked the assumption underneath that one: whether being busy had ever been what made orders stick. It had not. How busy a week was explains about 2% of whether its orders got stuck, and the single busiest week in the whole record had an ordinary rate of delays, a little below average. The $128,000 rested on a ceiling that was never there, so I deleted it rather than making it smaller.',
          'The same counting cuts into the labor number. Receiving hours fell, but so did the garments arriving, so some of those hours left with the work rather than because of the tool. What I can measure directly is the lookup itself: twenty seven seconds saved on every box, worth roughly $2,800 a year. Above that sits the re-handling that stopped happening, which is real and which I have not measured. So the range is $2,800 to $21,000 a year, and the number I stand behind is the floor.',
        ],
      },
    ],
  },
  {
    slug: 'apparel-redefined-invoicing',
    label: 'invoice coding',
    name: 'Apparel Redefined',
    business: 'Apparel decoration, Chicago',
    problem: 'Every sale landed in QuickBooks blank, for one accountant to code by hand.',
    description:
      'Every sale landed in QuickBooks blank for one accountant to code by hand. We automated the coding, so invoices arrive ready and 150 hours a year are freed.',
    teaser: "We automated the coding, so invoices arrive ready and the rules no longer live in one person's head.",
    value: '150',
    valueUnit: 'hrs/yr',
    valueLabel: 'Accounting time freed',
    basis:
      "74 invoices a month now arrive built and coded, at 10 to 20 minutes each by the accountant's own count. 150 is the low end.",
    took: '40 days',
    finished: '2026-08',
    outcomes: ['Reduce labor', 'Remove frustrating manual work', 'Eliminate recurring errors'],
    image: apparelRedefinedDesk,
    imageAlt:
      'An accounting desk in a print shop, buried in stacks of paper invoices and purchase orders, with screen printing presses visible through the window behind it.',
    story: [
      {
        heading: 'What was going wrong',
        paragraphs: [
          'Apparel Redefined prints and embroiders clothing in Chicago. Sales closes deals in Zoho, their sales system, and each closed deal becomes an invoice in QuickBooks.',
          "Those invoices arrived blank. Every line was marked as a general service, with no product and no sales channel. Someone had to open each one and code it by hand, and the rules for how to code it lived in one head: their accountant's.",
          'The owners also wanted to see which kinds of work make money: screen print, embroidery, and the rest. Blank invoices could not tell them. Almost none of the revenue carried the kind of work on it.',
          'Two quieter problems sat underneath. When a deal was closed twice, the order got made twice, six times in fourteen months. And when the handoff to the order system failed, it failed without telling anyone.',
        ],
      },
      {
        heading: 'What I found',
        paragraphs: [
          'A rep knows what each line is when they write the quote, and the order system already held it. But the link from Zoho to QuickBooks carried no product and no channel, never updated when a quote changed, and treated every close as a brand new deal.',
          'Asking the accountant to go faster would not fix it, and neither would another review step. The fix was to capture the answer where it is first known: on the quote line, when the rep writes it.',
          'Finance had just rebuilt their accounts so each kind of work has its own income line, and each sales channel is tagged. That gave the invoices somewhere to go. That part was their work, not mine.',
          'I also counted where the money is. Deals that run through Zoho are a small share of the orders, but a much bigger share of the revenue, because they are the larger jobs.',
        ],
      },
      {
        heading: 'What changed',
        paragraphs: [
          'Reps now tag what each quote line is, once. When the deal closes, the invoice is built and coded: the right income line, the right channel. If a tag is missing, the system holds the invoice instead of guessing, and an email says what is missing.',
          'When a quote changes, the invoice follows it. A deal closed twice no longer makes two orders. A failure sends an email instead of vanishing, and the deal in Zoho shows whether its invoice went through. It shipped in pieces, on top of a link another vendor built before me.',
          'In the three weeks after the last fix, 48 of 67 deals were invoiced and coded the moment they closed. Before, it was none. That is about 74 invoices a month the accountant no longer builds. She puts a hand-built one at 10 to 20 minutes, so that is 12 to 25 hours a month, or 150 to 300 hours a year. I stand behind the low end.',
          "The bigger change is harder to count. How to code an invoice used to live in one person's head, and now it lives in the system. When something is missing, a hold email says exactly what to finish, so nobody has to walk the floor to find out.",
        ],
      },
      {
        heading: 'What I checked before I believed it',
        paragraphs: [
          'First, whether invoices go out faster. They do, from about two weeks after a job finished to a day or two. But that started in April, months before any of this shipped, from changes on the accounting side. My work did not cause it, so I do not claim it.',
          'Second, whether accounting touches each invoice less. Not yet. A Zoho invoice that has been sent and paid is still edited about four times, the same as before. Two of those are just sending it and marking it paid. The other two are probably card fees, due dates, or shipping, and that is worth asking accounting about.',
          'Third, what the hours really are. They are building time removed, not all accounting time. Accounting still reviews and sends every invoice, and I have not timed how long that takes on one the system built. Until I do, the true saving is lower than the table by whatever review costs. No one was let go and no bill got smaller, so I left it in hours and did not turn it into dollars.',
          'Fourth, the double orders. There have been none since the fix. But they only happened about once every two months, so five weeks without one proves very little. The cause is gone. The count will take most of a year to show it.',
          "One thing did not last. I also had reps add the supplier's order number to garment lines, so the dock could match boxes faster. It went from about 1 line in 70 to 1 in 4 within a month. Then, the week of July 20, it fell to almost none, with no change on our side. Nobody noticed, because nothing was watching. A check that says when a field stops getting filled in is the next thing worth building.",
          'The other piece left is the rest of the business. Orders that do not come through Zoho are most of them by count, and every one of them is still coded by hand. That is where most of the hand work still sits.',
        ],
      },
    ],
  },
  {
    slug: 'apparel-redefined-late-orders',
    label: 'late orders',
    name: 'Apparel Redefined',
    business: 'Apparel decoration, Chicago',
    problem: 'The shop found out an order was late when the customer did.',
    description:
      'The shop found out an order was late when the customer did. A live list of orders about to run late lets the team step in. 62% fewer finish 5+ days late.',
    teaser:
      "We built a live list of orders about to run late, each judged against its own customer's normal pace, so the team can step in before the date slips.",
    value: '62%',
    valueUnit: 'fewer',
    valueLabel: 'Orders finishing 5+ days late',
    basis:
      'Down from 6.4% of orders to 2.4%, April to August, against the 2023 and 2024 average. Lower in each of the five largest accounts.',
    took: '63 days',
    finished: '2026-03',
    outcomes: ['Improve visibility', 'Improve customer experience'],
    onHome: false,
    image: apparelRedefinedFloorWatch,
    imageAlt:
      'The Floor Watch dashboard, shown with sample data: a list of orders at risk of running late with what is holding each one, turn time over 26 weeks, and each account measured against its own normal pace.',
    story: [
      {
        heading: 'What was going wrong',
        paragraphs: [
          'Apparel Redefined prints and embroiders clothing in Chicago. They make thousands of orders a year, for wholesale partners, online stores, and customers who order direct.',
          "Every order passes through four systems: the one that runs production, the one sales uses, the supplier's, and accounting. None of them could answer the questions the owners asked every day. How long do our jobs really take? What is in the queue right now? Which orders are about to miss their date?",
          'So the team found out an order was late when the customer did. Every fix came after the fact.',
        ],
      },
      {
        heading: 'What I found',
        paragraphs: [
          'Once I put the order history in one place, two things everyone believed turned out to be wrong.',
          'The first was skipped steps. Lots of orders seemed to skip a step, and it looked like sloppy work. It was not. Each kind of decoration has its own normal path through the shop. Screen print jobs skip the in-production step 62% of the time, because that is how screen print works. Judging every order against one path made healthy orders look broken, and hid the ones that really were.',
          "The second was what makes a job slow. Mostly it was the customer, not the job. A few large accounts make up most of the orders, and the same kind of decoration can take more than twice as long for one of them as for another. A shop-wide average would warn about the wrong orders. Each order had to be judged against its own customer's normal pace.",
        ],
      },
      {
        heading: 'What changed',
        paragraphs: [
          'I joined the four systems into one order history that refreshes every four hours.',
          "On top of it sits a list of orders at risk. Every open order gets a score for how much of its time it has used, measured against that customer's normal pace. The list also flags what is holding an order up: art, sizing, paperwork, or blank garments that have not arrived.",
          'The owners can now see on-time and turn time by customer and by kind of decoration. And when an order is taken, a model suggests the earliest due date the shop can really hit. Half its guesses land within four working days.',
          'It went live in March 2026. From April to August, 2.4% of orders finished more than five days late. In the same months of 2023 and 2024, it was 6.4%. Orders ten or more days late fell from 2.8% to 1.2%.',
        ],
        quote: {
          text: 'Our managers are back to leading with clear and reliable data. Working with Rapid Insights has been a win for our team. They delivered exactly what we needed through smart data analysis, performance tracking, dashboard development, and production capacity planning. Nothing feels impossible when Rapid Insights is involved. We highly recommend their work.',
          source: 'John Laroy, CEO, Apparel Redefined',
        },
      },
      {
        heading: 'What I checked before I believed it',
        paragraphs: [
          'First, whether 2025 was just a bad year. For this measure it was not. Badly late orders were 7.4% in 2023, 5.6% in 2024, and 6.7% in 2025. I still left 2025 out of the baseline and compared against the average of 2023 and 2024.',
          'Second, whether the mix of work changed. A drop in one big customer could be luck. So I checked the five largest one at a time. Every one of them is lower in 2026 than in any year before, and the one that had been worst dropped the most.',
          'Third, turn time. I do not claim it. Jobs got faster than in 2025, but not faster than in 2023 and 2024, because a large customer with longer jobs grew into a big share of the orders.',
          'Fourth, the money. A late order costs the shop in credits, discounts, and reprints. The books show what the shop spends each year on credits and rework. If a badly late order draws 5 to 10 times the average credit, the drop is worth $11,000 to $22,000 a year. That multiple is my estimate, not a measurement, so it stays off the headline. The true cost is higher than the books show, because the garments, ink, and press time for a reprint are booked as normal production.',
          'Fifth, the part I have not settled. The receiving fix went live a month earlier, at the same shop. An order stuck on the dock for a week is very likely to finish late, so some of this drop may belong to that fix. I have not split the two apart yet. The test is to look only at orders that never got stuck at the dock. Until I run it, read this result as what the two fixes did together.',
          'Two things would make this number stronger. Credit memos already have a field for the production order number. If staff fill it in, the guessed cost of a late order becomes a measured one. And logging what the team does when an order shows up at risk would show which of those fixes work.',
        ],
      },
    ],
  },
];

export const readMinutes = (c: Case): number => {
  const words = c.story
    .flatMap((s) => s.paragraphs)
    .join(' ')
    .split(/\s+/).length;
  return Math.max(1, Math.round(words / 230));
};

export const finishedMonth = (c: Case, month: 'short' | 'long'): string =>
  new Date(`${c.finished}-01`).toLocaleDateString('en-US', { month, year: 'numeric', timeZone: 'UTC' });

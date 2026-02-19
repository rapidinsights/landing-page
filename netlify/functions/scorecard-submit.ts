import type { Handler } from '@netlify/functions';

// Note: In production, install the Resend package in this functions directory
// or use a fetch-based approach to the Resend API

interface ScorecardSubmission {
  email: string;
  score: number;
  industry: string;
  revenueBand: string;
  answers: Record<string, number>;
  weakestAreas: string[];
}

const handler: Handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  // Parse body
  let data: ScorecardSubmission;
  try {
    data = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  // Validate required fields
  if (!data.email || typeof data.score !== 'number') {
    return { statusCode: 400, body: 'Missing required fields' };
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { statusCode: 400, body: 'Invalid email address' };
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    // In development without Resend key, return success but log warning
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Scorecard received (email sending not configured)' }),
    };
  }

  // Build the email HTML using the same logic as the client-side template
  // Note: We inline the template here to avoid import complexity in Netlify Functions
  const emailHtml = buildEmailHtml(data);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Rapid Insights <scorecard@rapidinsightsconsulting.com>',
        to: [data.email],
        subject: `Your Visibility Score: ${data.score}/24 — Here's What It Means`,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Failed to send email' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Report sent successfully' }),
    };
  } catch (error) {
    console.error('Email send error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to send email' }),
    };
  }
};

// Inline email builder for Netlify Functions (avoids complex imports)
function buildEmailHtml(data: ScorecardSubmission): string {
  const maxScore = 24;

  // Determine tier
  let tierLabel: string;
  let tierResult: string;
  let showBookCall: boolean;

  if (data.score >= 20) {
    tierLabel = 'You can see your business.';
    tierResult =
      "You're ahead of most businesses your size. If anything starts slipping, you'll notice — and that's the point.";
    showBookCall = false;
  } else if (data.score >= 13) {
    tierLabel = 'You have visibility in some areas. Not the ones that matter most.';
    tierResult =
      "You have some reporting, some answers — but the gaps are where margin quietly disappears. Below you'll find your weakest areas and what they typically cost.";
    showBookCall = true;
  } else if (data.score >= 6) {
    tierLabel = "You're running a growing business with serious blind spots.";
    tierResult =
      "You're not alone — this is more common than most owners realize. Your business has outgrown its tools but enterprise solutions don't fit. The short version: it's fixable, and faster than you think.";
    showBookCall = true;
  } else {
    tierLabel = "You're flying blind. But now you know it.";
    tierResult =
      "Most businesses at your score don't realize how much the gap is costing them — they've just gotten used to firefighting and guessing. None of this is hard to fix. It just hasn't been fixed yet.";
    showBookCall = true;
  }

  // Weak area labels
  const weakAreaMap: Record<string, { label: string; actionItem: string }> = {
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

  // Dollar estimate
  const dollarMap: Record<string, { label: string; range: string; improvement: string }> = {
    'under-2m': { label: 'under $2M', range: '$20K – $80K', improvement: '2-4%' },
    '2m-10m': { label: '$2M – $10M', range: '$40K – $300K', improvement: '2-3%' },
    '10m-25m': { label: '$10M – $25M', range: '$150K – $750K', improvement: '1.5-3%' },
    '25m-50m': { label: '$25M – $50M', range: '$250K – $1M', improvement: '1-2%' },
    'over-50m': { label: 'over $50M', range: '$500K+', improvement: '1-2%' },
  };

  const dollars = dollarMap[data.revenueBand] || dollarMap['2m-10m'];

  const weakAreaRows = data.weakestAreas
    .filter((id) => weakAreaMap[id])
    .map(
      (id) => `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #e5e7eb;">
          <p style="margin: 0 0 6px 0; font-weight: 600; color: #111827; font-size: 16px;">${weakAreaMap[id].label}</p>
          <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">${weakAreaMap[id].actionItem}</p>
        </td>
      </tr>`
    )
    .join('');

  const dollarSection =
    data.score < 20
      ? `
    <div style="margin-top: 24px; padding-top: 24px; border-top: 2px solid #e5e7eb;">
      <p style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #111827;">What this is likely costing you</p>
      <p style="margin: 0; font-size: 16px; color: #374151; line-height: 1.6;">
        At your visibility score, even a ${dollars.improvement} margin improvement — which is conservative — would be ${dollars.range} annually for a ${dollars.label} operation. That's what becomes possible when you can see your own numbers.
      </p>
    </div>`
      : '';

  const ctaSection = showBookCall
    ? `
    <div style="background: white; border-radius: 12px; padding: 32px; margin-bottom: 24px; text-align: center;">
      <p style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #111827;">Want to see what's actually hiding in your numbers?</p>
      <a href="https://rapidinsightsconsulting.com/#contact" style="display: inline-block; padding: 14px 32px; background-color: #1e40af; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Book a 20-minute call</a>
      <p style="margin: 16px 0 0 0; font-size: 14px; color: #6b7280;">No obligation. We'll look at your results together and tell you what we see.</p>
    </div>`
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your Visibility Report</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <p style="margin: 0; font-size: 14px; color: #6b7280; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;">Rapid Insights</p>
    </div>
    <div style="background: white; border-radius: 12px; padding: 32px; margin-bottom: 24px; text-align: center;">
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">Your Visibility Score</p>
      <p style="margin: 0 0 16px 0; font-size: 48px; font-weight: 700; color: #1e40af;">${data.score}<span style="font-size: 24px; color: #9ca3af;">/${maxScore}</span></p>
      <p style="margin: 0; font-size: 20px; font-weight: 600; color: #111827;">${tierLabel}</p>
    </div>
    <div style="background: white; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
      <p style="margin: 0 0 24px 0; font-size: 16px; color: #374151; line-height: 1.6;">${tierResult}</p>
      ${
        data.weakestAreas.length > 0
          ? `
      <div style="margin-top: 24px; padding-top: 24px; border-top: 2px solid #e5e7eb;">
        <p style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #111827;">Your biggest blind spots</p>
        <table style="width: 100%; border-collapse: collapse;">${weakAreaRows}</table>
      </div>`
          : ''
      }
      ${dollarSection}
    </div>
    ${ctaSection}
    <div style="text-align: center; padding-top: 24px;">
      <p style="margin: 0; font-size: 12px; color: #9ca3af;">Rapid Insights Consulting Inc. &middot; <a href="https://rapidinsightsconsulting.com" style="color: #9ca3af;">rapidinsightsconsulting.com</a></p>
      <p style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af;">You received this because you completed the Business Visibility Scorecard.</p>
    </div>
  </div>
</body>
</html>`;
}

export { handler };

import {
  type Industry,
  type RevenueBand,
  weakAreaLabels,
  getDollarImpactCopy,
  getScoreTier,
  MAX_SCORE,
} from '../scorecard-data';

interface ReportData {
  email: string;
  score: number;
  industry: Industry;
  revenueBand: RevenueBand;
  weakestAreas: string[];
}

export function buildVisibilityReportEmail(data: ReportData): string {
  const tier = getScoreTier(data.score);
  const dollarCopy = getDollarImpactCopy(data.industry, data.revenueBand, data.score);

  const weakAreaRows = data.weakestAreas
    .filter((id) => weakAreaLabels[id])
    .map(
      (id) => `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #e5e7eb;">
          <p style="margin: 0 0 6px 0; font-weight: 600; color: #111827; font-size: 16px;">
            ${weakAreaLabels[id].label}
          </p>
          <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
            ${weakAreaLabels[id].actionItem}
          </p>
        </td>
      </tr>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your Visibility Report — Rapid Insights</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">

    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <p style="margin: 0; font-size: 14px; color: #6b7280; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;">
        Rapid Insights
      </p>
    </div>

    <!-- Score Card -->
    <div style="background: white; border-radius: 12px; padding: 32px; margin-bottom: 24px; text-align: center;">
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">Your Visibility Score</p>
      <p style="margin: 0 0 16px 0; font-size: 48px; font-weight: 700; color: #1e40af;">
        ${data.score}<span style="font-size: 24px; color: #9ca3af;">/${MAX_SCORE}</span>
      </p>
      <p style="margin: 0; font-size: 20px; font-weight: 600; color: #111827;">
        ${tier.label}
      </p>
    </div>

    <!-- Results -->
    <div style="background: white; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
      <p style="margin: 0 0 24px 0; font-size: 16px; color: #374151; line-height: 1.6;">
        ${tier.fullResult(data.industry, data.revenueBand).replace(/\n/g, '<br><br>')}
      </p>

      <!-- Weak Areas -->
      ${
        data.weakestAreas.length > 0
          ? `
      <div style="margin-top: 24px; padding-top: 24px; border-top: 2px solid #e5e7eb;">
        <p style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #111827;">
          Your biggest blind spots
        </p>
        <table style="width: 100%; border-collapse: collapse;">
          ${weakAreaRows}
        </table>
      </div>`
          : ''
      }

      <!-- Dollar Impact -->
      ${
        data.score < 20
          ? `
      <div style="margin-top: 24px; padding-top: 24px; border-top: 2px solid #e5e7eb;">
        <p style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #111827;">
          What this is likely costing you
        </p>
        <p style="margin: 0; font-size: 16px; color: #374151; line-height: 1.6;">
          ${dollarCopy}
        </p>
      </div>`
          : ''
      }
    </div>

    <!-- CTA -->
    ${
      tier.showBookCall
        ? `
    <div style="background: white; border-radius: 12px; padding: 32px; margin-bottom: 24px; text-align: center;">
      <p style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #111827;">
        Want to see what's actually hiding in your numbers?
      </p>
      <a href="https://rapidinsightsconsulting.com/#contact" style="display: inline-block; padding: 14px 32px; background-color: #1e40af; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Book a 20-minute call
      </a>
      <p style="margin: 16px 0 0 0; font-size: 14px; color: #6b7280;">
        No obligation. We'll look at your results together and tell you what we see.
      </p>
    </div>`
        : ''
    }

    <!-- Footer -->
    <div style="text-align: center; padding-top: 24px;">
      <p style="margin: 0; font-size: 12px; color: #9ca3af;">
        Rapid Insights Consulting Inc. &middot; <a href="https://rapidinsightsconsulting.com" style="color: #9ca3af;">rapidinsightsconsulting.com</a>
      </p>
      <p style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af;">
        You received this because you completed the Business Visibility Scorecard.
      </p>
    </div>

  </div>
</body>
</html>`;
}

import { Resend } from "resend";
import { getWeeklyArticles, type Article } from "./db";
import {
  PLATFORM_LABELS,
  PLATFORM_COLORS,
  IMPACT_LABELS,
  IMPACT_COLORS,
  type Platform,
  type ImpactLevel,
} from "./sources";
import { createDraftCampaign, isMailchimpConfigured } from "./mailchimp";
import { format } from "date-fns";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

function groupByPlatform(articles: Article[]): Record<string, Article[]> {
  const groups: Record<string, Article[]> = {};
  for (const article of articles) {
    if (!groups[article.platform]) {
      groups[article.platform] = [];
    }
    groups[article.platform].push(article);
  }
  return groups;
}

function impactBadgeHtml(level: ImpactLevel): string {
  const color = IMPACT_COLORS[level];
  const label = IMPACT_LABELS[level];
  const bgMap: Record<ImpactLevel, string> = {
    "action-required": "#FEF2F2",
    "may-impact": "#FFFBEB",
    "good-to-know": "#F0FDF4",
  };
  return `<span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;color:${color};background:${bgMap[level]};border:1px solid ${color}30;margin-right:6px;">${label}</span>`;
}

function buildEmailHtml(articles: Article[]): string {
  const grouped = groupByPlatform(articles);
  const weekOf = format(new Date(), "MMM d, yyyy");

  const actionRequired = articles.filter(
    (a) => a.impact_level === "action-required"
  );

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; max-width: 680px; margin: 0 auto; padding: 20px; background: #f9fafb; }
        .header { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: white; padding: 32px; border-radius: 12px; margin-bottom: 24px; }
        .header h1 { margin: 0 0 8px 0; font-size: 24px; }
        .header p { margin: 0; opacity: 0.8; font-size: 14px; }
        .alert-section { background: #FEF2F2; border: 2px solid #FECACA; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
        .alert-title { font-size: 16px; font-weight: 700; color: #DC2626; margin: 0 0 12px 0; }
        .platform-section { background: white; border-radius: 12px; padding: 24px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
        .platform-title { font-size: 18px; font-weight: 700; margin: 0 0 16px 0; padding-bottom: 12px; border-bottom: 3px solid; }
        .article { padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
        .article:last-child { border-bottom: none; }
        .article-title a { color: #1e293b; text-decoration: none; font-weight: 600; font-size: 15px; }
        .article-title a:hover { color: #4285F4; }
        .article-meta { font-size: 12px; color: #6b7280; margin: 4px 0 8px 0; }
        .article-summary { font-size: 14px; color: #4b5563; line-height: 1.5; }
        .footer { text-align: center; font-size: 12px; color: #9ca3af; margin-top: 24px; padding: 16px; }
        .count-badge { display: inline-block; background: #f1f5f9; color: #475569; padding: 2px 10px; border-radius: 12px; font-size: 13px; font-weight: 500; margin-left: 8px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>PPC News Weekly Digest</h1>
        <p>Week of ${weekOf} &mdash; ${articles.length} updates found</p>
      </div>
  `;

  if (articles.length === 0) {
    html += `
      <div class="platform-section">
        <p style="text-align:center; color:#6b7280;">No new updates this week. We'll keep monitoring!</p>
      </div>
    `;
  }

  // Action Required section at the top if any exist
  if (actionRequired.length > 0) {
    html += `
      <div class="alert-section">
        <h2 class="alert-title">&#9888; ${actionRequired.length} Action Required Update${actionRequired.length > 1 ? "s" : ""}</h2>
    `;
    for (const article of actionRequired) {
      const date = format(new Date(article.published_at), "MMM d, yyyy");
      const platformLabel = PLATFORM_LABELS[article.platform as Platform];
      html += `
        <div class="article">
          <div class="article-title">
            ${impactBadgeHtml("action-required")}
            <a href="${article.url}">${article.title}</a>
          </div>
          <div class="article-meta">${platformLabel} &bull; ${article.source_name} &bull; ${date}</div>
          <div class="article-summary">${article.summary}</div>
        </div>
      `;
    }
    html += `</div>`;
  }

  // Regular platform sections
  const platformOrder: Platform[] = [
    "google-ads",
    "microsoft-ads",
    "merchant-center",
  ];
  for (const platform of platformOrder) {
    const items = grouped[platform];
    if (!items || items.length === 0) continue;

    const color = PLATFORM_COLORS[platform];
    const label = PLATFORM_LABELS[platform];

    html += `
      <div class="platform-section">
        <h2 class="platform-title" style="border-color: ${color};">
          ${label} <span class="count-badge">${items.length}</span>
        </h2>
    `;

    for (const article of items) {
      const date = format(new Date(article.published_at), "MMM d, yyyy");
      const impact = (article.impact_level || "good-to-know") as ImpactLevel;
      html += `
        <div class="article">
          <div class="article-title">
            ${impactBadgeHtml(impact)}
            <a href="${article.url}">${article.title}</a>
          </div>
          <div class="article-meta">${article.source_name} &bull; ${date}</div>
          <div class="article-summary">${article.summary}</div>
        </div>
      `;
    }

    html += `</div>`;
  }

  html += `
      <div class="footer">
        <p>Sent by ZATO Marketing PPC News Dashboard</p>
        <p>This is an automated weekly digest of Google Ads, Microsoft Ads, and Google Merchant Center updates.</p>
      </div>
    </body>
    </html>
  `;

  return html;
}

export async function sendWeeklyDigest() {
  const articles = await getWeeklyArticles();
  const html = buildEmailHtml(articles);
  const weekOf = format(new Date(), "MMM d");

  const actionCount = articles.filter(
    (a) => a.impact_level === "action-required"
  ).length;
  const subjectPrefix =
    actionCount > 0 ? `[${actionCount} ACTION REQUIRED] ` : "";
  const subject = `${subjectPrefix}PPC News Digest — Week of ${weekOf} (${articles.length} updates)`;
  const previewText = `${articles.length} PPC updates this week${actionCount > 0 ? ` — ${actionCount} require action` : ""}`;

  // Use Mailchimp if configured — creates a DRAFT for human review before sending
  if (isMailchimpConfigured()) {
    const result = await createDraftCampaign(html, subject, previewText);
    return {
      provider: "mailchimp",
      campaignId: result.campaignId,
      archiveUrl: result.archiveUrl,
      articleCount: articles.length,
      note: "Draft created in Mailchimp — review and send manually from your Mailchimp dashboard",
    };
  }

  // Fallback: send directly via Resend
  const { data, error } = await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL || "PPC News <noreply@resend.dev>",
    to: [process.env.DIGEST_EMAIL || "info@zatomarketing.com"],
    subject,
    html,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return { provider: "resend", emailId: data?.id, articleCount: articles.length };
}

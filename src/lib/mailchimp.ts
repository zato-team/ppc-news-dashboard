/**
 * Mailchimp Marketing API integration.
 * Creates a draft campaign — does NOT send it automatically.
 * A human reviews and clicks "Send" in the Mailchimp dashboard.
 */

interface MailchimpConfig {
  apiKey: string;
  serverPrefix: string; // e.g. "us19"
  listId: string;
  fromName: string;
  fromEmail: string;
}

function getConfig(): MailchimpConfig {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  if (!apiKey) throw new Error("MAILCHIMP_API_KEY is not set");

  // Server prefix is after the dash in the API key: "abc123-us19" → "us19"
  const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX || apiKey.split("-").pop() || "";
  const listId = process.env.MAILCHIMP_LIST_ID;
  if (!listId) throw new Error("MAILCHIMP_LIST_ID is not set");

  return {
    apiKey,
    serverPrefix,
    listId,
    fromName: process.env.MAILCHIMP_FROM_NAME || "ZATO Marketing",
    fromEmail: process.env.MAILCHIMP_FROM_EMAIL || "info@zatomarketing.com",
  };
}

function authHeader(apiKey: string): string {
  // Mailchimp uses HTTP Basic Auth: any-string:api-key
  const encoded = Buffer.from(`anystring:${apiKey}`).toString("base64");
  return `Basic ${encoded}`;
}

export async function createDraftCampaign(
  html: string,
  subject: string,
  previewText: string
): Promise<{ campaignId: string; webId: number; archiveUrl: string }> {
  const config = getConfig();
  const baseUrl = `https://${config.serverPrefix}.api.mailchimp.com/3.0`;
  const headers = {
    Authorization: authHeader(config.apiKey),
    "Content-Type": "application/json",
  };

  // Step 1: Create the campaign as a draft
  const createRes = await fetch(`${baseUrl}/campaigns`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      type: "regular",
      recipients: {
        list_id: config.listId,
      },
      settings: {
        subject_line: subject,
        preview_text: previewText,
        title: `PPC News Draft — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
        from_name: config.fromName,
        reply_to: config.fromEmail,
      },
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(`Mailchimp create campaign failed: ${err.detail || JSON.stringify(err)}`);
  }

  const campaign = await createRes.json();
  const campaignId: string = campaign.id;
  const webId: number = campaign.web_id;
  const archiveUrl: string = campaign.archive_url || "";

  // Step 2: Set the HTML content
  const contentRes = await fetch(`${baseUrl}/campaigns/${campaignId}/content`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ html }),
  });

  if (!contentRes.ok) {
    const err = await contentRes.json();
    throw new Error(`Mailchimp set content failed: ${err.detail || JSON.stringify(err)}`);
  }

  // NOTE: We intentionally do NOT call /actions/send — campaign stays as a draft.
  // A human reviews in the Mailchimp dashboard and clicks Send manually.

  return { campaignId, webId, archiveUrl };
}

/** Returns true if Mailchimp is configured, false if we should fall back to Resend */
export function isMailchimpConfigured(): boolean {
  return !!(process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_LIST_ID);
}

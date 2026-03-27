import Parser from "rss-parser";
import { FEED_SOURCES, PLATFORM_KEYWORDS, type Platform, type FeedSource } from "./sources";
import { insertArticle } from "./db";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "PPC-News-Dashboard/1.0 (RSS Reader)",
  },
});

function extractSummary(content: string | undefined, maxSentences = 3): string {
  if (!content) return "No summary available.";

  // Strip HTML tags
  const text = content
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

  // Split into sentences and take the first N
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  return sentences.slice(0, maxSentences).join(" ").trim() || "No summary available.";
}

function detectPlatform(
  title: string,
  content: string,
  source: FeedSource
): Platform | null {
  // Official sources always map directly
  if (
    source.name === "Google Ads Blog" ||
    source.name === "Google Ads Developer Blog"
  ) {
    return "google-ads";
  }
  if (source.name === "Microsoft Advertising Blog") {
    return "microsoft-ads";
  }
  if (source.name === "Google Merchant Center Blog") {
    return "merchant-center";
  }

  // For industry sources, check keywords
  const combined = `${title} ${content}`.toLowerCase();

  for (const [platform, keywords] of Object.entries(PLATFORM_KEYWORDS)) {
    if (keywords.some((kw) => combined.includes(kw))) {
      return platform as Platform;
    }
  }

  return null; // Not relevant — skip this article
}

export async function fetchAllFeeds(): Promise<{
  inserted: number;
  skipped: number;
  errors: string[];
}> {
  let inserted = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const source of FEED_SOURCES) {
    try {
      const feed = await parser.parseURL(source.url);

      for (const item of feed.items || []) {
        if (!item.title || !item.link) {
          skipped++;
          continue;
        }

        const content = item.contentSnippet || item.content || item.summary || "";
        const platform = detectPlatform(item.title, content, source);

        if (!platform) {
          skipped++;
          continue;
        }

        const summary = extractSummary(
          item.contentSnippet || item.content || item.summary
        );

        const publishedAt = item.pubDate
          ? new Date(item.pubDate).toISOString()
          : new Date().toISOString();

        const didInsert = await insertArticle({
          title: item.title,
          url: item.link,
          summary,
          source_name: source.name,
          platform,
          published_at: publishedAt,
        });

        if (didInsert) {
          inserted++;
        } else {
          skipped++;
        }
      }
    } catch (err) {
      const msg = `Failed to fetch ${source.name}: ${err instanceof Error ? err.message : "Unknown error"}`;
      errors.push(msg);
      console.error(msg);
    }
  }

  return { inserted, skipped, errors };
}

import { sql } from "@vercel/postgres";
import type { Article } from "./db";
import type { ImpactLevel } from "./sources";

export type OpportunityTier = "gold" | "silver" | "saturated";

export interface Opportunity {
  article: Article;
  coverageCount: number;
  tier: OpportunityTier;
  daysSincePublished: number;
  matchedArticleTitles: string[];
}

// Stop words to exclude from key term extraction
const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "it", "as", "be", "was", "are",
  "been", "has", "have", "had", "do", "does", "did", "will", "would",
  "could", "should", "may", "might", "can", "this", "that", "these",
  "those", "i", "you", "he", "she", "we", "they", "my", "your", "his",
  "her", "our", "their", "its", "not", "no", "so", "if", "up", "out",
  "about", "into", "over", "after", "how", "what", "when", "where",
  "which", "who", "why", "all", "each", "every", "both", "few", "more",
  "most", "other", "some", "such", "than", "too", "very", "just",
  "new", "now", "also", "here", "there", "then", "only", "own",
  "get", "got", "make", "made", "go", "going", "come", "take",
  "use", "used", "using", "way", "well", "back", "even", "still",
  "first", "last", "long", "great", "little", "right", "old", "big",
  "high", "different", "small", "large", "next", "early", "young",
  "important", "public", "bad", "same", "able",
]);

export function extractKeyTerms(text: string): string[] {
  const cleaned = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = cleaned.split(" ").filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  // Generate bigrams for better matching
  const bigrams: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    bigrams.push(`${words[i]} ${words[i + 1]}`);
  }

  return [...words, ...bigrams];
}

export function computeSimilarity(termsA: string[], termsB: string[]): number {
  if (termsA.length === 0 || termsB.length === 0) return 0;

  const setB = new Set(termsB);
  let matches = 0;

  for (const term of termsA) {
    if (setB.has(term)) matches++;
  }

  // Weighted: bigram matches count more
  return matches / termsA.length;
}

const IMPACT_WEIGHT: Record<ImpactLevel, number> = {
  "action-required": 3,
  "may-impact": 2,
  "good-to-know": 1,
};

function computeTier(coverageCount: number, impactLevel: ImpactLevel): OpportunityTier {
  if (coverageCount === 0 && (impactLevel === "action-required" || impactLevel === "may-impact")) {
    return "gold";
  }
  if (coverageCount <= 1) {
    return "silver";
  }
  return "saturated";
}

export async function findOpportunities(days: number): Promise<Opportunity[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Expanded window for industry articles (±7 days)
  const expandedStart = new Date(startDate);
  expandedStart.setDate(expandedStart.getDate() - 7);

  // Get official articles in range
  const officialResult = await sql`
    SELECT * FROM articles
    WHERE source_type = 'official'
    AND published_at >= ${startDate.toISOString()}
    ORDER BY published_at DESC
  `;
  const officialArticles = officialResult.rows as Article[];

  // Get industry articles in expanded range
  const industryResult = await sql`
    SELECT * FROM articles
    WHERE source_type = 'industry'
    AND published_at >= ${expandedStart.toISOString()}
    ORDER BY published_at DESC
  `;
  const industryArticles = industryResult.rows as Article[];

  // Pre-compute key terms for industry articles
  const industryTerms = industryArticles.map((a) => ({
    article: a,
    terms: extractKeyTerms(`${a.title} ${a.summary}`),
  }));

  const now = new Date();
  const opportunities: Opportunity[] = [];

  for (const official of officialArticles) {
    const officialTerms = extractKeyTerms(`${official.title} ${official.summary}`);
    const publishedDate = new Date(official.published_at);
    const daysSince = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24));

    // Find industry articles that cover this topic (within ±7 days of the official article)
    const matchedTitles: string[] = [];
    let coverageCount = 0;

    for (const ind of industryTerms) {
      const indDate = new Date(ind.article.published_at);
      const dayDiff = Math.abs((indDate.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24));

      // Only compare articles within 14 days of each other
      if (dayDiff > 14) continue;

      const similarity = computeSimilarity(officialTerms, ind.terms);
      if (similarity >= 0.25) {
        coverageCount++;
        matchedTitles.push(ind.article.title);
      }
    }

    const tier = computeTier(coverageCount, official.impact_level as ImpactLevel);

    opportunities.push({
      article: official,
      coverageCount,
      tier,
      daysSincePublished: daysSince,
      matchedArticleTitles: matchedTitles,
    });
  }

  // Sort: gold first, then silver, then saturated. Within tier, sort by impact weight * freshness
  const tierOrder: Record<OpportunityTier, number> = { gold: 0, silver: 1, saturated: 2 };

  opportunities.sort((a, b) => {
    if (tierOrder[a.tier] !== tierOrder[b.tier]) {
      return tierOrder[a.tier] - tierOrder[b.tier];
    }
    // Within same tier, higher impact + more recent = higher priority
    const scoreA = IMPACT_WEIGHT[a.article.impact_level as ImpactLevel] * (1 / (a.daysSincePublished + 1));
    const scoreB = IMPACT_WEIGHT[b.article.impact_level as ImpactLevel] * (1 / (b.daysSincePublished + 1));
    return scoreB - scoreA;
  });

  return opportunities;
}

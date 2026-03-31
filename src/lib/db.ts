import { sql } from "@vercel/postgres";
import type { Platform, ImpactLevel, SourceType } from "./sources";

export interface Article {
  id: number;
  title: string;
  url: string;
  summary: string;
  source_name: string;
  platform: Platform;
  impact_level: ImpactLevel;
  source_type: SourceType;
  published_at: string;
  fetched_at: string;
}

export async function createTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS articles (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT UNIQUE NOT NULL,
      summary TEXT NOT NULL,
      source_name TEXT NOT NULL,
      platform TEXT NOT NULL,
      impact_level TEXT DEFAULT 'good-to-know',
      published_at TIMESTAMPTZ NOT NULL,
      fetched_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_articles_platform ON articles(platform)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at DESC)
  `;

  // Migration: add impact_level column to existing tables that don't have it
  // Use a check to see if the column exists first, then add it without NOT NULL
  // constraint (which would fail on existing rows)
  const colCheck = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'impact_level'
  `;

  if (colCheck.rows.length === 0) {
    await sql`ALTER TABLE articles ADD COLUMN impact_level TEXT DEFAULT 'good-to-know'`;
    await sql`UPDATE articles SET impact_level = 'good-to-know' WHERE impact_level IS NULL`;
  }

  await sql`
    CREATE INDEX IF NOT EXISTS idx_articles_impact ON articles(impact_level)
  `;

  // Migration: add source_type column
  const sourceTypeCheck = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'source_type'
  `;

  if (sourceTypeCheck.rows.length === 0) {
    await sql`ALTER TABLE articles ADD COLUMN source_type TEXT DEFAULT 'industry'`;
    // Backfill official sources
    await sql`UPDATE articles SET source_type = 'official' WHERE source_name IN ('Google Ads Blog', 'Google Ads Developer Blog', 'Google Merchant Center Blog', 'Microsoft Advertising Blog')`;
  }

  await sql`
    CREATE INDEX IF NOT EXISTS idx_articles_source_type ON articles(source_type)
  `;
}

export async function insertArticle(article: Omit<Article, "id" | "fetched_at">) {
  try {
    await sql`
      INSERT INTO articles (title, url, summary, source_name, platform, impact_level, source_type, published_at)
      VALUES (${article.title}, ${article.url}, ${article.summary}, ${article.source_name}, ${article.platform}, ${article.impact_level}, ${article.source_type}, ${article.published_at})
      ON CONFLICT (url) DO UPDATE SET impact_level = ${article.impact_level}, source_type = ${article.source_type}
    `;
    return true;
  } catch {
    return false;
  }
}

export async function getAllArticlesForReclassify(): Promise<{ id: number; title: string; summary: string }[]> {
  const result = await sql`SELECT id, title, summary FROM articles`;
  return result.rows as { id: number; title: string; summary: string }[];
}

export async function updateArticleImpact(id: number, impactLevel: ImpactLevel) {
  await sql`UPDATE articles SET impact_level = ${impactLevel} WHERE id = ${id}`;
}

export async function getArticles({
  platform,
  limit = 50,
  offset = 0,
  startDate,
  endDate,
  search,
  impactLevel,
}: {
  platform?: Platform;
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  impactLevel?: ImpactLevel;
} = {}) {
  // Build dynamic query
  let query = `SELECT * FROM articles WHERE 1=1`;
  const params: (string | number)[] = [];
  let paramIndex = 1;

  if (platform) {
    query += ` AND platform = $${paramIndex++}`;
    params.push(platform);
  }
  if (impactLevel) {
    query += ` AND impact_level = $${paramIndex++}`;
    params.push(impactLevel);
  }
  if (startDate) {
    query += ` AND published_at >= $${paramIndex++}`;
    params.push(startDate);
  }
  if (endDate) {
    query += ` AND published_at <= $${paramIndex++}`;
    params.push(endDate);
  }
  if (search) {
    query += ` AND (LOWER(title) LIKE $${paramIndex} OR LOWER(summary) LIKE $${paramIndex})`;
    params.push(`%${search.toLowerCase()}%`);
    paramIndex++;
  }

  // Sort: action-required first, then may-impact, then good-to-know, then by date
  query += ` ORDER BY CASE impact_level WHEN 'action-required' THEN 0 WHEN 'may-impact' THEN 1 ELSE 2 END, published_at DESC`;
  query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  params.push(limit, offset);

  const result = await sql.query(query, params);
  return result.rows as Article[];
}

export async function getArticleCount({
  platform,
  startDate,
  endDate,
  impactLevel,
}: {
  platform?: Platform;
  startDate?: string;
  endDate?: string;
  impactLevel?: ImpactLevel;
} = {}) {
  let query = `SELECT COUNT(*) as count FROM articles WHERE 1=1`;
  const params: string[] = [];
  let paramIndex = 1;

  if (platform) {
    query += ` AND platform = $${paramIndex++}`;
    params.push(platform);
  }
  if (impactLevel) {
    query += ` AND impact_level = $${paramIndex++}`;
    params.push(impactLevel);
  }
  if (startDate) {
    query += ` AND published_at >= $${paramIndex++}`;
    params.push(startDate);
  }
  if (endDate) {
    query += ` AND published_at <= $${paramIndex++}`;
    params.push(endDate);
  }

  const result = await sql.query(query, params);
  return parseInt(result.rows[0].count, 10);
}

export async function getStats() {
  const totalResult = await sql`SELECT COUNT(*) as count FROM articles`;
  const platformCounts = await sql`
    SELECT platform, COUNT(*) as count
    FROM articles
    GROUP BY platform
  `;
  const thisWeek = await sql`
    SELECT COUNT(*) as count FROM articles
    WHERE published_at >= NOW() - INTERVAL '7 days'
  `;
  const latestArticle = await sql`
    SELECT published_at FROM articles
    ORDER BY published_at DESC LIMIT 1
  `;

  return {
    total: parseInt(totalResult.rows[0].count, 10),
    thisWeek: parseInt(thisWeek.rows[0].count, 10),
    byPlatform: Object.fromEntries(
      platformCounts.rows.map((r) => [r.platform, parseInt(r.count, 10)])
    ),
    lastUpdated: latestArticle.rows[0]?.published_at || null,
  };
}

export async function getWeeklyArticles() {
  const result = await sql`
    SELECT * FROM articles
    WHERE published_at >= NOW() - INTERVAL '7 days'
    ORDER BY CASE impact_level WHEN 'action-required' THEN 0 WHEN 'may-impact' THEN 1 ELSE 2 END, platform, published_at DESC
  `;
  return result.rows as Article[];
}

export async function getImpactStats() {
  const result = await sql`
    SELECT impact_level, COUNT(*) as count
    FROM articles
    WHERE published_at >= NOW() - INTERVAL '30 days'
    GROUP BY impact_level
  `;
  return Object.fromEntries(
    result.rows.map((r) => [r.impact_level, parseInt(r.count, 10)])
  ) as Record<string, number>;
}

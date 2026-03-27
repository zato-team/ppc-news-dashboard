import { sql } from "@vercel/postgres";
import type { Platform } from "./sources";

export interface Article {
  id: number;
  title: string;
  url: string;
  summary: string;
  source_name: string;
  platform: Platform;
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
}

export async function insertArticle(article: Omit<Article, "id" | "fetched_at">) {
  try {
    await sql`
      INSERT INTO articles (title, url, summary, source_name, platform, published_at)
      VALUES (${article.title}, ${article.url}, ${article.summary}, ${article.source_name}, ${article.platform}, ${article.published_at})
      ON CONFLICT (url) DO NOTHING
    `;
    return true;
  } catch {
    return false;
  }
}

export async function getArticles({
  platform,
  limit = 50,
  offset = 0,
  startDate,
  endDate,
  search,
}: {
  platform?: Platform;
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
} = {}) {
  // Build dynamic query
  let query = `SELECT * FROM articles WHERE 1=1`;
  const params: (string | number)[] = [];
  let paramIndex = 1;

  if (platform) {
    query += ` AND platform = $${paramIndex++}`;
    params.push(platform);
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

  query += ` ORDER BY published_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  params.push(limit, offset);

  const result = await sql.query(query, params);
  return result.rows as Article[];
}

export async function getArticleCount({
  platform,
  startDate,
  endDate,
}: {
  platform?: Platform;
  startDate?: string;
  endDate?: string;
} = {}) {
  let query = `SELECT COUNT(*) as count FROM articles WHERE 1=1`;
  const params: string[] = [];
  let paramIndex = 1;

  if (platform) {
    query += ` AND platform = $${paramIndex++}`;
    params.push(platform);
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
    ORDER BY platform, published_at DESC
  `;
  return result.rows as Article[];
}

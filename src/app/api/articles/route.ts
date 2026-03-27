import { NextRequest, NextResponse } from "next/server";
import { getArticles, getArticleCount, createTables } from "@/lib/db";
import type { Platform, ImpactLevel } from "@/lib/sources";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const platform = searchParams.get("platform") as Platform | null;
  const impactLevel = searchParams.get("impactLevel") as ImpactLevel | null;
  const search = searchParams.get("search") || undefined;
  const startDate = searchParams.get("startDate") || undefined;
  const endDate = searchParams.get("endDate") || undefined;
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  try {
    // Ensure tables + migration have run before querying
    await createTables();

    const [articles, total] = await Promise.all([
      getArticles({ platform: platform || undefined, impactLevel: impactLevel || undefined, search, startDate, endDate, limit, offset }),
      getArticleCount({ platform: platform || undefined, impactLevel: impactLevel || undefined, startDate, endDate }),
    ]);

    return NextResponse.json({
      articles,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error("Articles API error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

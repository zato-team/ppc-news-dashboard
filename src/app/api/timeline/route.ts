import { NextRequest, NextResponse } from "next/server";
import { createTables } from "@/lib/db";
import { sql } from "@vercel/postgres";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "30", 10);
  const platform = searchParams.get("platform") || undefined;
  const impactLevel = searchParams.get("impactLevel") || undefined;

  try {
    await createTables();

    // Determine grouping: days (7-30), weeks (90), months (365)
    let groupBy: "day" | "week" | "month";
    if (days <= 30) {
      groupBy = "day";
    } else if (days <= 90) {
      groupBy = "week";
    } else {
      groupBy = "month";
    }

    let truncExpr: string;
    if (groupBy === "day") {
      truncExpr = "DATE_TRUNC('day', published_at)";
    } else if (groupBy === "week") {
      truncExpr = "DATE_TRUNC('week', published_at)";
    } else {
      truncExpr = "DATE_TRUNC('month', published_at)";
    }

    let query = `
      SELECT ${truncExpr} AS period, COUNT(*) AS count
      FROM articles
      WHERE published_at >= NOW() - INTERVAL '${days} days'
    `;
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

    query += ` GROUP BY period ORDER BY period ASC`;

    const result = await sql.query(query, params);

    return NextResponse.json({
      groupBy,
      days,
      data: result.rows.map((r) => ({
        period: r.period,
        count: parseInt(r.count, 10),
      })),
    });
  } catch (error) {
    console.error("Timeline API error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

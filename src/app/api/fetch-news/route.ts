import { NextRequest, NextResponse } from "next/server";
import { createTables } from "@/lib/db";
import { fetchAllFeeds } from "@/lib/fetcher";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  // Verify cron secret for automated calls
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Ensure tables exist
    await createTables();

    // Fetch all feeds
    const result = await fetchAllFeeds();

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Fetch news error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

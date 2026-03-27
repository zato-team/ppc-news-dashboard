import { NextResponse } from "next/server";
import { getStats, createTables } from "@/lib/db";

export async function GET() {
  try {
    await createTables();
    const stats = await getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

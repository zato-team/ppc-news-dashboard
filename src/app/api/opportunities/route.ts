import { NextRequest, NextResponse } from "next/server";
import { findOpportunities } from "@/lib/opportunities";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30", 10);

    const opportunities = await findOpportunities(days);

    return NextResponse.json({ opportunities });
  } catch (error) {
    console.error("Failed to compute opportunities:", error);
    return NextResponse.json(
      { error: "Failed to compute opportunities" },
      { status: 500 }
    );
  }
}

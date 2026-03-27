import { NextResponse } from "next/server";
import { createTables } from "@/lib/db";

export async function POST() {
  try {
    await createTables();
    return NextResponse.json({ success: true, message: "Database tables created" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

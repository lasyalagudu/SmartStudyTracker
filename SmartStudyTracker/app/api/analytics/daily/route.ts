import { NextResponse } from "next/server";
import { getDailyAnalytics } from "@/lib/analytics/getDailyAnalytics";

export async function GET() {
  try {
    const data = await getDailyAnalytics();
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Daily analytics failed";
    const status =
      message === "Unauthorized"
        ? 401
        : message === "User not found"
          ? 404
          : message === "No active exam found"
            ? 400
            : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

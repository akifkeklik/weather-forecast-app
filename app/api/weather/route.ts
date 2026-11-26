import { NextResponse } from "next/server";
import { getWeatherByCity } from "@/lib/services/weather";
import { createErrorResponse } from "@/lib/utils/errors";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city") ?? "";
    const data = await getWeatherByCity(city);

    return NextResponse.json(data, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error: unknown) {
    const { statusCode, body } = createErrorResponse(error);
    if (statusCode >= 500) {
      logger.error(
        "Weather request failed",
        { code: body.code, statusCode },
        error instanceof Error ? error : undefined
      );
    }
    const headers: Record<string, string> = { "Cache-Control": "no-store" };
    if (statusCode === 503) headers["Retry-After"] = "1";
    return NextResponse.json(body, { status: statusCode, headers });
  }
}

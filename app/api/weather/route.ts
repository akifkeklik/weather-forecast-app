import { NextResponse } from "next/server";
import { getWeatherByCity } from "@/lib/services/weather";
import { createErrorResponse } from "@/lib/utils/errors";

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
    return NextResponse.json(body, { status: statusCode });
  }
}

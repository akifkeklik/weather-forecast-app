import { NextResponse } from "next/server";
import { getWeatherByCity } from "@/lib/services/weather";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city") || "";

    const data = await getWeatherByCity(city);
    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: e?.message || "Error" },
      { status: 400 }
    );
  }
}

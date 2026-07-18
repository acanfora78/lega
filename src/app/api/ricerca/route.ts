import { NextResponse } from "next/server";
import { ricercaGlobale } from "@/lib/data/search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  return NextResponse.json(await ricercaGlobale(q));
}

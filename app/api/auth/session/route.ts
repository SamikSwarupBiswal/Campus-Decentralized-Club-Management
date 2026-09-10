import { NextResponse } from "next/server";
import { getSession } from "@/lib/server/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  return NextResponse.json({ address: session?.address ?? null }, {
    headers: { "Cache-Control": "no-store" },
  });
}

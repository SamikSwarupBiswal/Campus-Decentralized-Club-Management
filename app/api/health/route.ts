import { NextResponse } from "next/server";
import { contractAddresses } from "@/lib/contracts";
import { getDatabase } from "@/lib/server/mongodb";

export const runtime = "nodejs";

export async function GET() {
  let database = "demo";
  try {
    const db = await getDatabase();
    if (db) {
      await db.command({ ping: 1 });
      database = "connected";
    }
  } catch {
    database = "unavailable";
  }
  const contracts = Object.fromEntries(
    Object.entries(contractAddresses).map(([key, value]) => [
      key,
      value ? "configured" : "missing",
    ]),
  );
  return NextResponse.json({
    ok: database !== "unavailable",
    service: "campus-dao",
    network: { name: "polygon-amoy", chainId: 80002 },
    database,
    contracts,
    timestamp: new Date().toISOString(),
  });
}

import { NextResponse } from "next/server";
import { members } from "@/lib/demo-data";
import { getDatabase } from "@/lib/server/mongodb";
import { memberSchema } from "@/lib/server/schemas";
import { requireAdmin } from "@/lib/server/session";

export const runtime = "nodejs";

export async function GET() {
  const db = await getDatabase();
  if (!db) return NextResponse.json({ members, mode: "demo" });
  const records = await db
    .collection("members")
    .find({}, { projection: { _id: 0 } })
    .sort({ joinedAt: -1 })
    .toArray();
  return NextResponse.json({ members: records, mode: "database" });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admin wallet authentication required" }, { status: 401 });
  const parsed = memberSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid member" },
      { status: 400 },
    );
  }
  const db = await getDatabase();
  if (!db) {
    return NextResponse.json({ error: "Configure MongoDB before storing member profiles" }, { status: 503 });
  }
  try {
    await db.collection("members").insertOne({
      ...parsed.data,
      status: "Pending on-chain registration",
      joinedAt: new Date(),
    });
  } catch {
    return NextResponse.json(
      { error: "This wallet is already registered" },
      { status: 409 },
    );
  }
  return NextResponse.json({
    ok: true,
    message: "Member profile stored. Complete the MembershipRegistry transaction.",
  });
}

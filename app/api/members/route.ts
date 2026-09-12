import { NextResponse } from "next/server";
import { members } from "@/lib/demo-data";
import { getDatabase } from "@/lib/server/mongodb";
import { memberSchema } from "@/lib/server/schemas";
import { MemberRecord, customMembers, requireAdmin, isAdminWallet } from "@/lib/server/session";
import type { Member } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  const db = await getDatabase();
  const memoryList = Array.from(customMembers.values());
  let records: MemberRecord[] = [];
  if (db) {
    try {
      records = (await db
        .collection("members")
        .find({}, { projection: { _id: 0 } })
        .sort({ joinedAt: -1 })
        .toArray()) as unknown as MemberRecord[];
    } catch (e) {
      console.error("Failed to load members from MongoDB:", e);
    }
  }

  const seenWallets = new Set<string>();
  const combined: (Member | MemberRecord)[] = [];

  for (const m of [...records, ...memoryList]) {
    const w = String(m.wallet || "").toLowerCase();
    if (w && !seenWallets.has(w)) {
      seenWallets.add(w);
      const isRishav = Boolean(m.name && m.name.toLowerCase().includes("rishav"));
      combined.push({
        ...m,
        role: isAdminWallet(w) || isRishav ? "Admin" : (m.role || "Member"),
      });
    }
  }

  for (const m of members) {
    const w = String(m.wallet || "").toLowerCase();
    if (w && !seenWallets.has(w)) {
      seenWallets.add(w);
      const isRishav = Boolean(m.name && m.name.toLowerCase().includes("rishav"));
      combined.push({
        ...m,
        role: isAdminWallet(w) || isRishav ? "Admin" : (m.role || "Member"),
      });
    }
  }

  return NextResponse.json({
    members: combined,
    count: combined.length,
    mode: db ? "database" : "demo",
  });
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
  const memberRecord = {
    ...parsed.data,
    wallet: parsed.data.wallet.toLowerCase(),
    role: isAdminWallet(parsed.data.wallet) ? "Admin" : "Member",
    status: "Active",
    joinedAt: new Date(),
    participation: 0,
  };

  const db = await getDatabase();
  if (db) {
    try {
      await db.collection("members").insertOne({
        ...memberRecord,
        status: "Pending on-chain registration",
      });
    } catch {
      return NextResponse.json(
        { error: "This wallet is already registered" },
        { status: 409 },
      );
    }
  }

  customMembers.set(memberRecord.wallet, memberRecord);

  return NextResponse.json({
    ok: true,
    member: memberRecord,
    message: "Member profile stored. Complete the MembershipRegistry transaction.",
  });
}

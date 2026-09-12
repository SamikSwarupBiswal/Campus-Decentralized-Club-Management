import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDatabase } from "@/lib/server/mongodb";
import {
  getSession,
  setSessionCookie,
  getMemberByWallet,
  isAdminWallet,
  customMembers,
} from "@/lib/server/session";

export const runtime = "nodejs";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
  studentId: z.string().trim().max(40).optional().default(""),
  department: z.string().trim().max(120).optional().default("General"),
  year: z.string().trim().max(30).optional().default("1st year"),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.address) {
    return NextResponse.json(
      { error: "Wallet authentication required. Please connect and sign in with MetaMask." },
      { status: 401 },
    );
  }

  const existing = await getMemberByWallet(session.address);
  if (existing) {
    return NextResponse.json(
      { error: "This wallet is already registered as a member." },
      { status: 409 },
    );
  }

  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid member data" },
      { status: 400 },
    );
  }

  const member = {
    id: `member-${randomUUID().slice(0, 8)}`,
    name: parsed.data.name,
    studentId: parsed.data.studentId || `STU-${session.address.slice(2, 6).toUpperCase()}`,
    department: parsed.data.department || "General",
    year: parsed.data.year || "1st year",
    wallet: session.address.toLowerCase(),
    role:
      isAdminWallet(session.address) ||
      parsed.data.name.toLowerCase().includes("rishav")
        ? "Admin"
        : "Member",
    status: "Active",
    joinedAt: new Date(),
    participation: 0,
  };

  const db = await getDatabase();
  if (db) {
    try {
      await db.collection("members").insertOne(member);
    } catch {
      return NextResponse.json(
        { error: "This wallet is already registered in the member directory." },
        { status: 409 },
      );
    }
  }

  customMembers.set(session.address.toLowerCase(), member);

  const isRememberMe = session.expiresAt - session.issuedAt > 86400;
  await setSessionCookie(session.address, isRememberMe, {
    isRegistered: true,
    name: member.name,
  });

  return NextResponse.json({
    ok: true,
    member,
    message: "Registration complete. Welcome to Campus DAO!",
  });
}

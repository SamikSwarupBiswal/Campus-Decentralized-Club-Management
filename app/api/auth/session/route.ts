import { NextResponse } from "next/server";
import { getSession, isAdminWallet, getMemberByWallet } from "@/lib/server/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session?.address) {
    return NextResponse.json(
      { address: null, isAdmin: false, isRegistered: false, member: null },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
  const member = await getMemberByWallet(session.address);
  const isAdmin = isAdminWallet(session.address);
  const isRegistered = Boolean(member) || isAdmin;

  return NextResponse.json(
    {
      address: session.address,
      isAdmin,
      isRegistered,
      name: member?.name ?? session.name ?? null,
      member: member ? { name: member.name, studentId: member.studentId, department: member.department, role: member.role } : null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

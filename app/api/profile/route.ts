import { NextResponse } from "next/server";
import { formatEther } from "viem";
import { getAttendanceForWallet } from "@/lib/server/attendance";
import { publicClient } from "@/lib/server/blockchain";
import { getAllEvents } from "@/lib/server/events";
import { getAllProposals } from "@/lib/server/proposals";
import {
  getMemberByWallet,
  getSession,
  isAdminWallet,
} from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedWallet = searchParams.get("wallet");
  const session = await getSession();

  const targetWallet = (requestedWallet || session?.address || "")
    .trim()
    .toLowerCase() as `0x${string}`;

  if (!targetWallet || !/^0x[a-f0-9]{40}$/.test(targetWallet)) {
    return NextResponse.json(
      { error: "No wallet address specified or signed in." },
      { status: 400 },
    );
  }

  const isAdmin = isAdminWallet(targetWallet);
  const member = await getMemberByWallet(targetWallet);

  // Fetch on-chain Sepolia ETH balance
  let ethBalance = "0.0000";
  try {
    const rawBalance = await publicClient.getBalance({ address: targetWallet });
    const formatted = parseFloat(formatEther(rawBalance));
    ethBalance = formatted.toFixed(4);
  } catch (err) {
    console.warn("Could not query on-chain balance:", err);
  }

  // Fetch attendance records
  const userAttendance = await getAttendanceForWallet(targetWallet);
  const attendedEventMap = new Map(userAttendance.map((a) => [a.eventId, a]));

  const allEvents = await getAllEvents();
  const pastEvents = allEvents.filter(
    (e) => e.attendanceStatus === "Finalized" || e.attendanceStatus === "Closed",
  );

  const attendedEventDetails = allEvents
    .filter((e) => attendedEventMap.has(e.id))
    .map((e) => ({
      id: e.id,
      name: e.name,
      date: e.date,
      venue: e.venue,
      attendanceStatus: e.attendanceStatus,
      checkedInAt: attendedEventMap.get(e.id)?.checkedInAt,
    }));

  const attendedCount = attendedEventDetails.length;
  const attendanceRate =
    pastEvents.length > 0
      ? Math.round((attendedCount / pastEvents.length) * 100)
      : attendedCount > 0
        ? 100
        : 0;

  // Fetch proposals by this wallet
  const allProposals = await getAllProposals();
  const userProposals = allProposals.filter(
    (p) => String(p.proposer || "").toLowerCase() === targetWallet,
  );

  return NextResponse.json({
    ok: true,
    profile: {
      wallet: targetWallet,
      name: member?.name || (isAdmin ? "Administrator" : "Club Member"),
      studentId: member?.studentId || null,
      department: member?.department || "Engineering",
      year: member?.year || "1st year",
      role: isAdmin ? "Admin" : (member?.role || "Member"),
      status: member?.status || (isAdmin ? "Active" : "Unregistered"),
      joinedAt: member?.joinedAt || null,
      ethBalance,
      attendance: {
        attendedCount,
        totalEvents: allEvents.length,
        pastEventsCount: pastEvents.length,
        rate: attendanceRate,
        records: attendedEventDetails,
      },
      proposals: {
        count: userProposals.length,
        list: userProposals,
      },
    },
  });
}

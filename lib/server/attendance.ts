import { keccak256, stringToBytes } from "viem";
import type { AttendanceRecord } from "@/lib/types";
import { getDatabase } from "./mongodb";

declare global {
  // eslint-disable-next-line no-var
  var __campusDaoAttendance: AttendanceRecord[] | undefined;
}

const memoryAttendance =
  global.__campusDaoAttendance || (global.__campusDaoAttendance = []);

export async function attendanceExists(eventId: string, wallet: string) {
  const db = await getDatabase();
  if (db) {
    return Boolean(
      await db
        .collection("attendance")
        .findOne({ eventId, wallet: wallet.toLowerCase() }),
    );
  }
  return memoryAttendance.some(
    (record) =>
      record.eventId === eventId &&
      record.wallet.toLowerCase() === wallet.toLowerCase(),
  );
}

export interface UserAttendanceItem {
  eventId: string;
  checkedInAt: string;
}

export async function getAttendanceForWallet(
  wallet?: string | null,
): Promise<UserAttendanceItem[]> {
  if (!wallet) return [];
  const normalized = wallet.toLowerCase();
  const db = await getDatabase();
  if (db) {
    try {
      const records = await db
        .collection<{ eventId: string; checkedInAt?: string | Date }>("attendance")
        .find({ wallet: normalized })
        .sort({ checkedInAt: -1 })
        .toArray();
      return records.map((r) => ({
        eventId: r.eventId,
        checkedInAt:
          typeof r.checkedInAt === "string"
            ? r.checkedInAt
            : r.checkedInAt instanceof Date
              ? r.checkedInAt.toISOString()
              : new Date().toISOString(),
      }));
    } catch (e) {
      console.error("Failed to query user attendance:", e);
    }
  }

  return memoryAttendance
    .filter((record) => record.wallet.toLowerCase() === normalized)
    .map((r) => ({
      eventId: r.eventId,
      checkedInAt: r.checkedInAt || new Date().toISOString(),
    }));
}

export async function saveAttendance(
  record: Omit<AttendanceRecord, "id">,
) {
  const normalized = {
    ...record,
    wallet: record.wallet.toLowerCase() as `0x${string}`,
  };
  const db = await getDatabase();
  if (db) {
    await db.collection("attendance").insertOne(normalized);
    return;
  }
  memoryAttendance.push({
    ...normalized,
    id: `attendance-${memoryAttendance.length + 1}`,
  });
}

export async function canonicalAttendance(eventId: string) {
  const db = await getDatabase();
  const wallets = db
    ? await db
        .collection<{ wallet: string }>("attendance")
        .find({ eventId })
        .project<{ wallet: string }>({ wallet: 1, _id: 0 })
        .toArray()
        .then((items) => items.map((item) => item.wallet))
    : memoryAttendance
        .filter((record) => record.eventId === eventId)
        .map((record) => record.wallet);
  const normalized = [...new Set(wallets.map((wallet) => wallet.toLowerCase()))].sort();
  const canonical = JSON.stringify({ eventId, wallets: normalized });
  return {
    canonical,
    wallets: normalized,
    hash: keccak256(stringToBytes(canonical)),
  };
}

export interface AttendanceAttendee {
  wallet: string;
  checkedInAt: string;
  name?: string;
  studentId?: string;
  department?: string;
  year?: string;
  role?: string;
}

export async function getAttendanceList(eventId: string): Promise<AttendanceAttendee[]> {
  const { getMemberByWallet } = await import("./session");
  const db = await getDatabase();
  let rawRecords: Array<{ wallet: string; checkedInAt?: string | Date }>;
  if (db) {
    rawRecords = await db
      .collection<{ wallet: string; checkedInAt?: string | Date }>("attendance")
      .find({ eventId })
      .sort({ checkedInAt: -1 })
      .toArray();
  } else {
    rawRecords = memoryAttendance
      .filter((record) => record.eventId === eventId)
      .map((r) => ({ wallet: r.wallet, checkedInAt: r.checkedInAt }))
      .slice()
      .reverse();
  }

  const attendees: AttendanceAttendee[] = await Promise.all(
    rawRecords.map(async (rec) => {
      const member = await getMemberByWallet(rec.wallet);
      return {
        wallet: rec.wallet,
        checkedInAt:
          typeof rec.checkedInAt === "string"
            ? rec.checkedInAt
            : rec.checkedInAt instanceof Date
            ? rec.checkedInAt.toISOString()
            : new Date().toISOString(),
        name: member?.name,
        studentId: member?.studentId,
        department: member?.department,
        year: member?.year,
        role: member?.role,
      };
    }),
  );

  return attendees;
}


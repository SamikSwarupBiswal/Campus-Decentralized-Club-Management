import { keccak256, stringToBytes } from "viem";
import type { AttendanceRecord } from "@/lib/types";
import { getDatabase } from "./mongodb";

declare global {
  // eslint-disable-next-line no-var
  var __campusDaoAttendance: AttendanceRecord[] | undefined;
}

const SEED_ATTENDANCE: AttendanceRecord[] = [
  // evt-design-critique (Interface Design Critique, July 19, 2026)
  {
    id: "attendance-seed-1",
    eventId: "evt-design-critique",
    wallet: "0x7A8f113604769cb18483B1Ac4B99a6cc9872f71B",
    checkedInAt: "2026-07-19T16:04:12.000Z",
    nonce: "seed-nonce-dc-1",
  },
  {
    id: "attendance-seed-2",
    eventId: "evt-design-critique",
    wallet: "0x62C18C31bd7d6822D93147E650FeB18d6A331CA7",
    checkedInAt: "2026-07-19T16:08:45.000Z",
    nonce: "seed-nonce-dc-2",
  },
  {
    id: "attendance-seed-3",
    eventId: "evt-design-critique",
    wallet: "0x19B25aAF70169B7E58D45770926315656544b3Ce",
    checkedInAt: "2026-07-19T16:11:30.000Z",
    nonce: "seed-nonce-dc-3",
  },
  {
    id: "attendance-seed-4",
    eventId: "evt-design-critique",
    wallet: "0x34e2520d8cEd68d26A8B84B40EBb7BE9A3d06cb1",
    checkedInAt: "2026-07-19T16:15:02.000Z",
    nonce: "seed-nonce-dc-4",
  },
  {
    id: "attendance-seed-5",
    eventId: "evt-design-critique",
    wallet: "0xC44914D08Dda9C6864a77817607A2E4b06Ca9894",
    checkedInAt: "2026-07-19T16:18:22.000Z",
    nonce: "seed-nonce-dc-5",
  },
  // evt-robotics-workshop (Robotics Build Workshop, July 24, 2026)
  {
    id: "attendance-seed-6",
    eventId: "evt-robotics-workshop",
    wallet: "0x62C18C31bd7d6822D93147E650FeB18d6A331CA7",
    checkedInAt: "2026-07-24T14:05:10.000Z",
    nonce: "seed-nonce-rw-1",
  },
  {
    id: "attendance-seed-7",
    eventId: "evt-robotics-workshop",
    wallet: "0x19B25aAF70169B7E58D45770926315656544b3Ce",
    checkedInAt: "2026-07-24T14:09:55.000Z",
    nonce: "seed-nonce-rw-2",
  },
  {
    id: "attendance-seed-8",
    eventId: "evt-robotics-workshop",
    wallet: "0x7A8f113604769cb18483B1Ac4B99a6cc9872f71B",
    checkedInAt: "2026-07-24T14:14:40.000Z",
    nonce: "seed-nonce-rw-3",
  },
  {
    id: "attendance-seed-9",
    eventId: "evt-robotics-workshop",
    wallet: "0xC44914D08Dda9C6864a77817607A2E4b06Ca9894",
    checkedInAt: "2026-07-24T14:18:05.000Z",
    nonce: "seed-nonce-rw-4",
  },
];

const memoryAttendance =
  global.__campusDaoAttendance || (global.__campusDaoAttendance = [...SEED_ATTENDANCE]);

export async function attendanceExists(eventId: string, wallet: string) {
  const normalized = wallet.toLowerCase();
  const db = await getDatabase();
  if (db) {
    const found = await db
      .collection("attendance")
      .findOne({ eventId, wallet: normalized });
    if (found) return true;
  }
  return memoryAttendance.some(
    (record) =>
      record.eventId === eventId &&
      record.wallet.toLowerCase() === normalized,
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
  const items: UserAttendanceItem[] = [];
  const seenEvents = new Set<string>();

  if (db) {
    try {
      const records = await db
        .collection<{ eventId: string; checkedInAt?: string | Date }>("attendance")
        .find({ wallet: normalized })
        .sort({ checkedInAt: -1 })
        .toArray();
      for (const r of records) {
        if (!seenEvents.has(r.eventId)) {
          seenEvents.add(r.eventId);
          items.push({
            eventId: r.eventId,
            checkedInAt:
              typeof r.checkedInAt === "string"
                ? r.checkedInAt
                : r.checkedInAt instanceof Date
                  ? r.checkedInAt.toISOString()
                  : new Date().toISOString(),
          });
        }
      }
    } catch (e) {
      console.error("Failed to query user attendance:", e);
    }
  }

  for (const record of memoryAttendance) {
    if (record.wallet.toLowerCase() === normalized && !seenEvents.has(record.eventId)) {
      seenEvents.add(record.eventId);
      items.push({
        eventId: record.eventId,
        checkedInAt: record.checkedInAt || new Date().toISOString(),
      });
    }
  }

  return items;
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
  }
  const existing = memoryAttendance.find(
    (r) => r.eventId === normalized.eventId && r.wallet.toLowerCase() === normalized.wallet.toLowerCase(),
  );
  if (!existing) {
    memoryAttendance.push({
      ...normalized,
      id: `attendance-${memoryAttendance.length + 1}`,
    });
  }
}

export async function canonicalAttendance(eventId: string) {
  const db = await getDatabase();
  let wallets: string[] = [];
  if (db) {
    try {
      wallets = await db
        .collection<{ wallet: string }>("attendance")
        .find({ eventId })
        .project<{ wallet: string }>({ wallet: 1, _id: 0 })
        .toArray()
        .then((items) => items.map((item) => item.wallet));
    } catch {
      wallets = [];
    }
  }
  if (wallets.length === 0) {
    wallets = memoryAttendance
      .filter((record) => record.eventId === eventId)
      .map((record) => record.wallet);
  }
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
  let rawRecords: Array<{ wallet: string; checkedInAt?: string | Date }> = [];
  if (db) {
    try {
      rawRecords = await db
        .collection<{ wallet: string; checkedInAt?: string | Date }>("attendance")
        .find({ eventId })
        .sort({ checkedInAt: -1 })
        .toArray();
    } catch {
      rawRecords = [];
    }
  }
  
  if (rawRecords.length === 0) {
    rawRecords = memoryAttendance
      .filter((record) => record.eventId === eventId)
      .map((r) => ({ wallet: r.wallet, checkedInAt: r.checkedInAt }))
      .slice()
      .reverse();
  }

  // Deduplicate by wallet
  const seenWallets = new Set<string>();
  const uniqueRecords: Array<{ wallet: string; checkedInAt?: string | Date }> = [];
  for (const rec of rawRecords) {
    const norm = rec.wallet.toLowerCase();
    if (!seenWallets.has(norm)) {
      seenWallets.add(norm);
      uniqueRecords.push(rec);
    }
  }

  const attendees: AttendanceAttendee[] = await Promise.all(
    uniqueRecords.map(async (rec) => {
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

export async function getAttendanceCountsByEvent(): Promise<Record<string, number>> {
  const db = await getDatabase();
  const counts: Record<string, number> = {};

  for (const item of memoryAttendance) {
    counts[item.eventId] = (counts[item.eventId] || 0) + 1;
  }

  if (db) {
    try {
      const records = await db
        .collection<{ _id: string; count: number }>("attendance")
        .aggregate([
          { $group: { _id: "$eventId", count: { $sum: 1 } } },
        ])
        .toArray();
      for (const rec of records) {
        if (rec._id) {
          counts[rec._id] = rec.count;
        }
      }
    } catch (e) {
      console.warn("Could not aggregate attendance counts:", e);
    }
  }

  return counts;
}

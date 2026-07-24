import { createHash } from "node:crypto";
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
  const digest = createHash("sha256").update(canonical).digest("hex");
  return {
    canonical,
    wallets: normalized,
    hash: `0x${digest}` as `0x${string}`,
  };
}

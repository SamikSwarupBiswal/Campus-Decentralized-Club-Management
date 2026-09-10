import { randomBytes } from "node:crypto";
import { getDatabase } from "./mongodb";

export interface StoredNonce {
  nonce: string;
  kind: "auth" | "attendance";
  wallet: string;
  message: string;
  eventId?: string;
  createdAt: Date;
  expiresAt: Date;
  consumedAt?: Date;
}

declare global {
  // eslint-disable-next-line no-var
  var __campusDaoNonces: Map<string, StoredNonce> | undefined;
}

const memoryNonces =
  global.__campusDaoNonces || (global.__campusDaoNonces = new Map());

export async function issueNonce(
  data: Omit<StoredNonce, "nonce" | "createdAt" | "expiresAt">,
  lifetimeSeconds: number,
) {
  const now = new Date();
  const record: StoredNonce = {
    ...data,
    nonce: randomBytes(24).toString("hex"),
    createdAt: now,
    expiresAt: new Date(now.getTime() + lifetimeSeconds * 1000),
  };
  const db = await getDatabase();
  if (db) {
    await db.collection<StoredNonce>("nonces").insertOne(record);
  } else {
    memoryNonces.set(record.nonce, record);
  }
  return record;
}

export async function replaceNonceMessage(nonce: string, message: string) {
  const db = await getDatabase();
  if (db) {
    await db.collection<StoredNonce>("nonces").updateOne(
      { nonce, consumedAt: { $exists: false } },
      { $set: { message } },
    );
    return;
  }
  const record = memoryNonces.get(nonce);
  if (record) record.message = message;
}

export async function consumeNonce(
  nonce: string,
  kind: StoredNonce["kind"],
) {
  const now = new Date();
  const db = await getDatabase();
  if (db) {
    return db.collection<StoredNonce>("nonces").findOneAndUpdate(
      {
        nonce,
        kind,
        consumedAt: { $exists: false },
        expiresAt: { $gt: now },
      },
      { $set: { consumedAt: now } },
      { returnDocument: "before" },
    );
  }
  const record = memoryNonces.get(nonce);
  if (
    !record ||
    record.kind !== kind ||
    record.consumedAt ||
    record.expiresAt <= now
  ) {
    return null;
  }
  record.consumedAt = now;
  return record;
}

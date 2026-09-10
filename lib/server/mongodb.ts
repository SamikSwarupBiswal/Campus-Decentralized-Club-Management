import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB || "campus_dao";

declare global {
  // eslint-disable-next-line no-var
  var __campusDaoMongoPromise: Promise<MongoClient> | undefined;
}

export const isDemoMode = !uri;

export async function getDatabase(): Promise<Db | null> {
  if (!uri) return null;
  if (!global.__campusDaoMongoPromise) {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 8_000,
    });
    global.__campusDaoMongoPromise = client.connect();
  }
  const client = await global.__campusDaoMongoPromise;
  return client.db(databaseName);
}

export async function ensureIndexes() {
  const db = await getDatabase();
  if (!db) return;
  await Promise.all([
    db.collection("nonces").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection("nonces").createIndex({ nonce: 1 }, { unique: true }),
    db
      .collection("attendance")
      .createIndex({ eventId: 1, wallet: 1 }, { unique: true }),
    db.collection("members").createIndex({ wallet: 1 }, { unique: true }),
    db.collection("events").createIndex({ id: 1 }, { unique: true }),
  ]);
}

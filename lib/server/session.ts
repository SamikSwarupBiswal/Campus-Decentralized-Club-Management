import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getDatabase } from "./mongodb";

const COOKIE_NAME = "campus_dao_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const PERSISTENT_SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export interface SessionPayload {
  address: `0x${string}`;
  issuedAt: number;
  expiresAt: number;
  isRegistered?: boolean;
  name?: string;
}

export interface MemberRecord {
  id: string;
  name: string;
  studentId: string;
  department: string;
  year: string;
  wallet: string;
  role: string;
  status: string;
  joinedAt: Date;
  participation: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __campusDaoCustomMembers: Map<string, MemberRecord> | undefined;
}

export const customMembers =
  global.__campusDaoCustomMembers || (global.__campusDaoCustomMembers = new Map());

export function isAdminWallet(address?: string | null): boolean {
  if (!address) return false;
  const admins = (process.env.ADMIN_WALLETS || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(address.toLowerCase());
}

export async function getMemberByWallet(address?: string | null) {
  if (!address) return null;
  const normalized = address.toLowerCase();
  const db = await getDatabase();
  if (db) {
    const doc = await db.collection("members").findOne({
      wallet: { $regex: new RegExp(`^${normalized}$`, "i") },
    });
    if (doc) return doc;
  }
  if (customMembers.has(normalized)) {
    return customMembers.get(normalized);
  }
  return null;
}

export async function isMemberRegistered(address?: string | null): Promise<boolean> {
  const member = await getMemberByWallet(address);
  return Boolean(member);
}

function secret() {
  const configured = process.env.SESSION_SECRET;
  if (configured && configured.length >= 32) return configured;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must contain at least 32 characters");
  }
  return "campus-dao-local-demo-secret-change-before-deploy";
}

function encode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function signature(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(
  address: `0x${string}`,
  rememberMe = false,
  extra?: { isRegistered?: boolean; name?: string },
) {
  const now = Math.floor(Date.now() / 1000);
  const data: SessionPayload = {
    address: address.toLowerCase() as `0x${string}`,
    issuedAt: now,
    expiresAt: now + (rememberMe ? PERSISTENT_SESSION_TTL_SECONDS : SESSION_TTL_SECONDS),
    ...(extra?.isRegistered !== undefined ? { isRegistered: extra.isRegistered } : {}),
    ...(extra?.name ? { name: extra.name } : {}),
  };
  const payload = encode(JSON.stringify(data));
  return `${payload}.${signature(payload)}`;
}

export function verifySessionToken(token?: string): SessionPayload | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, suppliedSignature] = parts;
  if (!payload || !suppliedSignature) return null;
  const expected = signature(payload);
  const suppliedBuffer = Buffer.from(suppliedSignature);
  const expectedBuffer = Buffer.from(expected);
  if (
    suppliedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(suppliedBuffer, expectedBuffer)
  ) {
    return null;
  }
  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as SessionPayload;
    if (
      typeof parsed.address !== "string" ||
      !/^0x[a-f0-9]{40}$/.test(parsed.address) ||
      typeof parsed.expiresAt !== "number" ||
      parsed.expiresAt <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function setSessionCookie(
  address: `0x${string}`,
  rememberMe = false,
  extra?: { isRegistered?: boolean; name?: string },
) {
  const store = await cookies();
  store.set(COOKIE_NAME, createSessionToken(address, rememberMe, extra), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    ...(rememberMe ? { maxAge: PERSISTENT_SESSION_TTL_SECONDS } : {}),
    path: "/",
  });
}

export async function getSession() {
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE_NAME)?.value);
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    expires: new Date(0),
    path: "/",
  });
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) return null;
  return isAdminWallet(session.address) ? session : null;
}

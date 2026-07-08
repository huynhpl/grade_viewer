import crypto from "node:crypto";

export interface TokenPayload {
  role: "student" | "instructor";
  studentId?: string;
  name?: string;
  exp: number; // epoch ms
}

const SECRET = process.env.AUTH_SECRET || "dev-insecure-secret-change-me";
const TTL_MS = 1000 * 60 * 60 * 12; // 12 giờ

function b64url(buf: Buffer | string): string {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function sign(data: string): string {
  return b64url(crypto.createHmac("sha256", SECRET).update(data).digest());
}

export function createToken(
  payload: Omit<TokenPayload, "exp">,
  now: number
): string {
  const full: TokenPayload = { ...payload, exp: now + TTL_MS };
  const body = b64url(JSON.stringify(full));
  return `${body}.${sign(body)}`;
}

export function verifyToken(token: string | undefined, now: number): TokenPayload | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expected = sign(body);
  // Constant-time compare to avoid timing leaks.
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(body.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString()
    ) as TokenPayload;
    if (typeof payload.exp !== "number" || payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}

export function bearer(headers: Record<string, string | undefined>): string | undefined {
  const h = headers["authorization"] || headers["Authorization"];
  if (!h) return undefined;
  const m = /^Bearer\s+(.+)$/i.exec(h);
  return m?.[1];
}

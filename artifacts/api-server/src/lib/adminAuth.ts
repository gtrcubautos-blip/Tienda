import crypto from "crypto";
import type { RequestHandler } from "express";
import { logger } from "./logger";

// Admin session tokens are valid for 7 days.
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const SIGNING_CONTEXT = "gtr-admin-session-v1";

let warnedMissingPassword = false;

/**
 * The admin password is read from the ADMIN_PASSWORD secret. There is no
 * fallback on purpose: without the secret configured, no one can authenticate
 * and every admin-write endpoint stays locked.
 */
function getAdminPassword(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || pw.length === 0) {
    if (!warnedMissingPassword) {
      logger.warn(
        "ADMIN_PASSWORD is not configured — admin login is disabled and all admin-write endpoints will reject requests."
      );
      warnedMissingPassword = true;
    }
    return null;
  }
  return pw;
}

/**
 * The token signing key is derived from the admin password so we don't need a
 * second secret. It is stable across restarts (as long as the password is
 * unchanged) and unforgeable without knowing the password. Changing the
 * password automatically invalidates every previously issued token.
 */
function getSigningKey(): Buffer | null {
  const pw = getAdminPassword();
  if (!pw) return null;
  return crypto.createHmac("sha256", pw).update(SIGNING_CONTEXT).digest();
}

function sign(payload: string, key: Buffer): string {
  return crypto.createHmac("sha256", key).update(payload).digest("base64url");
}

function timingSafeEqualStr(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/** Validate a plaintext password against the configured admin password. */
export function verifyAdminPassword(password: string): boolean {
  const pw = getAdminPassword();
  if (!pw) return false;
  return timingSafeEqualStr(password, pw);
}

/** Issue a signed admin session token, or null if auth is not configured. */
export function createAdminToken(): string | null {
  const key = getSigningKey();
  if (!key) return null;
  const payload = Buffer.from(
    JSON.stringify({ exp: Date.now() + TOKEN_TTL_MS })
  ).toString("base64url");
  return `${payload}.${sign(payload, key)}`;
}

/** Verify an admin session token's signature and expiry. */
export function verifyAdminToken(token: string): boolean {
  const key = getSigningKey();
  if (!key) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;
  if (!timingSafeEqualStr(signature, sign(payload, key))) return false;
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof decoded.exp === "number" && Date.now() < decoded.exp;
  } catch {
    return false;
  }
}

/**
 * Express middleware that rejects any request lacking a valid admin session
 * token in the `Authorization: Bearer <token>` header.
 *
 * Typed as a bare `RequestHandler` (rather than annotating the params
 * individually) so that adding it to a route does not degrade Express 5's
 * path-based `req.params` inference for the following handler.
 */
export const requireAdmin: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7).trim() : null;
  if (!token || !verifyAdminToken(token)) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }
  next();
};

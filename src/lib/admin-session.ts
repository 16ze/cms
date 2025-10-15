import crypto from "crypto";
export const ADMIN_SESSION_COOKIE = "admin_session" as const;
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface AdminSessionPayload {
  email: string;
  name: string;
  id: string;
  role: "admin" | "super_admin";
  loginTime: string;
}

export interface AdminSessionClaims extends AdminSessionPayload {
  iat: number;
  exp: number;
}

export type AdminSessionVerificationResult =
  | { valid: true; claims: AdminSessionClaims }
  | { valid: false; reason: AdminSessionErrorCode };

export type AdminSessionErrorCode =
  | "MISSING_TOKEN"
  | "INVALID_FORMAT"
  | "INVALID_SIGNATURE"
  | "EXPIRED_TOKEN"
  | "MISSING_SECRET";

const toBase64Url = (buffer: Buffer) =>
  buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const fromBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + "=".repeat(padLength);
  return Buffer.from(padded, "base64");
};

const timingSafeCompare = (a: Buffer, b: Buffer) => {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};

export const getAdminSessionSecret = () => {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw Object.assign(
      new Error(
        "ADMIN_SESSION_SECRET must be set and at least 32 characters long"
      ),
      { code: "MISSING_SECRET" }
    );
  }
  return secret;
};

export const signAdminSession = (
  payload: AdminSessionPayload,
  secret: string,
  maxAgeSeconds: number = ADMIN_SESSION_MAX_AGE_SECONDS
) => {
  if (secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must be at least 32 characters long");
  }

  const header = { alg: "HS256", typ: "JWT" };
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + maxAgeSeconds;

  const claims: AdminSessionClaims = {
    ...payload,
    iat: issuedAt,
    exp: expiresAt,
  };

  const encodedHeader = toBase64Url(Buffer.from(JSON.stringify(header)));
  const encodedPayload = toBase64Url(Buffer.from(JSON.stringify(claims)));

  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest();

  return `${encodedHeader}.${encodedPayload}.${toBase64Url(signature)}`;
};

export const verifyAdminSession = (
  token: string | undefined,
  secret: string
): AdminSessionVerificationResult => {
  if (!token) return { valid: false, reason: "MISSING_TOKEN" };

  const parts = token.split(".");
  if (parts.length !== 3) {
    return { valid: false, reason: "INVALID_FORMAT" };
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest();

  const actualSignature = fromBase64Url(encodedSignature);

  if (!timingSafeCompare(expectedSignature, actualSignature)) {
    return { valid: false, reason: "INVALID_SIGNATURE" };
  }

  try {
    const payloadBuffer = fromBase64Url(encodedPayload);
    const claims = JSON.parse(
      payloadBuffer.toString("utf8")
    ) as AdminSessionClaims;

    if (!claims || typeof claims.exp !== "number") {
      return { valid: false, reason: "INVALID_FORMAT" };
    }

    const now = Math.floor(Date.now() / 1000);
    if (claims.exp <= now) {
      return { valid: false, reason: "EXPIRED_TOKEN" };
    }

    return { valid: true, claims };
  } catch (error) {
    return { valid: false, reason: "INVALID_FORMAT" };
  }
};

export const ADMIN_SESSION_COOKIE = "admin_session" as const;

type VerifyResult =
  | { valid: true; claims: any }
  | {
      valid: false;
      reason: "MISSING_TOKEN" | "INVALID_FORMAT" | "INVALID_SIGNATURE" | "EXPIRED_TOKEN";
    };

const b64uToUint8 = (b64u: string) => {
  const b64 = b64u.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((b64u.length + 3) % 4);
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) {
    buf[i] = bin.charCodeAt(i);
  }
  return buf;
};

const encoder = new TextEncoder();

export async function verifyAdminSessionOnEdge(
  token: string | undefined,
  secret: string
): Promise<VerifyResult> {
  if (!token) return { valid: false, reason: "MISSING_TOKEN" };

  const parts = token.split(".");
  if (parts.length !== 3) return { valid: false, reason: "INVALID_FORMAT" };

  const [header, payload, signature] = parts;

  if (!globalThis.crypto?.subtle) {
    return { valid: false, reason: "INVALID_FORMAT" };
  }

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const expectedSignature = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, encoder.encode(`${header}.${payload}`))
  );

  const actualSignature = b64uToUint8(signature);

  if (
    expectedSignature.length !== actualSignature.length ||
    !expectedSignature.every((value, index) => value === actualSignature[index])
  ) {
    return { valid: false, reason: "INVALID_SIGNATURE" };
  }

  try {
    const decodedPayload = JSON.parse(
      new TextDecoder().decode(b64uToUint8(payload))
    );

    const now = Math.floor(Date.now() / 1000);
    if (typeof decodedPayload.exp !== "number" || decodedPayload.exp <= now) {
      return { valid: false, reason: "EXPIRED_TOKEN" };
    }

    return { valid: true, claims: decodedPayload };
  } catch (error) {
    return { valid: false, reason: "INVALID_FORMAT" };
  }
}

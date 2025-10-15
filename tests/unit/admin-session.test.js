require("ts-node").register({
  transpileOnly: true,
  compilerOptions: { module: "CommonJS", moduleResolution: "node" },
});
const test = require("node:test");
const assert = require("node:assert/strict");
const {
  ADMIN_SESSION_MAX_AGE_SECONDS,
  signAdminSession,
  verifyAdminSession,
} = require("../../src/lib/admin-session");

const SECRET = "development-session-secret-please-change-immediately-123456";

const payload = {
  email: "admin@example.com",
  name: "Admin",
  id: "admin-1",
  role: "SUPER_ADMIN",
  loginTime: new Date().toISOString(),
};

test("signs and verifies a token", () => {
  const token = signAdminSession(payload, SECRET, 60);
  const result = verifyAdminSession(token, SECRET);
  assert.equal(result.valid, true);
  assert.equal(result.claims.email, payload.email);
});

test("rejects tampered signatures", () => {
  const token = signAdminSession(payload, SECRET, 60);
  const parts = token.split(".");
  parts[2] = parts[2].slice(0, -1) + (parts[2].slice(-1) === "A" ? "B" : "A");
  const result = verifyAdminSession(parts.join("."), SECRET);
  assert.equal(result.valid, false);
  assert.equal(result.reason, "INVALID_SIGNATURE");
});

test("rejects expired tokens (no Jest)", () => {
  const expired = signAdminSession(payload, SECRET, -10);
  const result = verifyAdminSession(expired, SECRET);
  assert.equal(result.valid, false);
  assert.equal(result.reason, "EXPIRED_TOKEN");
});

test("exposes correct max age", () => {
  assert.equal(ADMIN_SESSION_MAX_AGE_SECONDS, 60 * 60 * 24 * 7);
});

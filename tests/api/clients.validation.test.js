require("ts-node").register({
  transpileOnly: true,
  compilerOptions: { module: "CommonJS", moduleResolution: "node" },
});
const test = require("node:test");
const assert = require("node:assert/strict");
const {
  clientQuerySchema,
  createClientSchema,
} = require("../../src/app/api/admin/clients/validators");

test("rejects invalid page value", () => {
  const parsed = clientQuerySchema.safeParse({ page: "0" });
  assert.equal(parsed.success, false);
  assert.deepEqual(parsed.error.issues[0].path, ["page"]);
});

test("normalizes search parameters", () => {
  const parsed = clientQuerySchema.safeParse({ search: " test " });
  assert.equal(parsed.success, true);
  assert.equal(parsed.data.search, "test");
});

test("rejects invalid email on creation", () => {
  const parsed = createClientSchema.safeParse({
    firstName: "John",
    lastName: "Doe",
    email: "invalid",
  });
  assert.equal(parsed.success, false);
});

import assert from "node:assert/strict";
import test from "node:test";
import { CHARACTER_SETS, containsSequentialRun, defaultPasswordOptions, generatePassword, PasswordGenerationError } from "../lib/password-generator";
import { calculatePasswordStrength } from "../lib/password-strength";

test("creates the requested length with every enabled category", () => {
  const password = generatePassword({ ...defaultPasswordOptions, length: 48 });
  assert.equal(password.length, 48);
  assert.match(password, /[A-Z]/); assert.match(password, /[a-z]/); assert.match(password, /[0-9]/); assert.match(password, /[-!@#$%^&*_=+?]/);
});
test("respects individual character category selection", () => {
  const password = generatePassword({ ...defaultPasswordOptions, length: 20, uppercase: false, lowercase: false, numbers: true, symbols: false });
  assert.match(password, /^[0-9]+$/);
});
test("excludes ambiguous characters", () => {
  const password = generatePassword({ ...defaultPasswordOptions, length: 100, excludeAmbiguous: true });
  assert.equal(/[O0Il1]/.test(password), false);
});
test("avoids repeats and sequences when requested", () => {
  const password = generatePassword({ ...defaultPasswordOptions, length: 55, avoidRepeated: true, avoidSequential: true });
  assert.equal(new Set(password).size, password.length); assert.equal(containsSequentialRun(password), false);
});
test("rejects invalid and impossible configurations", () => {
  assert.throws(() => generatePassword({ ...defaultPasswordOptions, length: 7 }), PasswordGenerationError);
  assert.throws(() => generatePassword({ ...defaultPasswordOptions, uppercase: false, lowercase: false, numbers: false, symbols: false }), PasswordGenerationError);
  assert.throws(() => generatePassword({ ...defaultPasswordOptions, length: 128, uppercase: false, lowercase: false, numbers: true, symbols: false, avoidRepeated: true }), PasswordGenerationError);
});
test("uses browser cryptography rather than Math.random", () => {
  const original = globalThis.crypto.getRandomValues.bind(globalThis.crypto); let calls = 0;
  Object.defineProperty(globalThis, "crypto", { configurable: true, value: { getRandomValues: (array: Uint32Array) => { calls += 1; return original(array); } } });
  try { generatePassword(defaultPasswordOptions); assert.ok(calls > 0); } finally { Object.defineProperty(globalThis, "crypto", { configurable: true, value: { getRandomValues: original } }); }
});
test("strength rating increases with length and available character set", () => {
  const weak = calculatePasswordStrength("pass", { ...defaultPasswordOptions, uppercase: false, numbers: false, symbols: false, length: 4 });
  const strong = calculatePasswordStrength("example", { ...defaultPasswordOptions, length: 32 });
  assert.ok(strong.entropy > weak.entropy); assert.ok(strong.score > weak.score); assert.equal(Object.values(CHARACTER_SETS).length, 4);
});

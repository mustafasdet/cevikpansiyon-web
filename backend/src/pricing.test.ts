import { test } from "node:test";
import assert from "node:assert/strict";
import { isValidNightlyPrice } from "./pricing.js";

test("Rejects 499 TL because it is below the 500 TL minimum", () => {
  assert.equal(isValidNightlyPrice(499), false);
});

test("Accepts 500 TL at the inclusive minimum", () => {
  assert.equal(isValidNightlyPrice(500), true);
});

test("Accepts 501 TL above the minimum", () => {
  assert.equal(isValidNightlyPrice(501), true);
});

test("Rejects 500.5 TL because prices must use whole TL", () => {
  assert.equal(isValidNightlyPrice(500.5), false);
});

test("Rejects text even when it contains a numeric-looking price", () => {
  assert.equal(isValidNightlyPrice("500"), false);
});

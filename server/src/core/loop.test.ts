import assert from "node:assert/strict";
import test from "node:test";
import { runLoop, type LoopSpec } from "./loop.js";

/**
 * A trivial loop over a numeric counter. Every candidate scores above the
 * bar, so without minRounds it converges on round 1; correct() bumps the
 * counter each round so we can observe how many correction rounds ran.
 */
function counterSpec(minRounds?: number): LoopSpec<{ value: number }, number, null> {
  return {
    name: "counter",
    bar: 5,
    maxRounds: 10,
    minRounds,
    candidateKey: (value) => String(value),
    async act(state) {
      return state.value;
    },
    async observe() {
      return null;
    },
    async score(candidate) {
      return { score: 9, critique: {} };
    },
    async correct(state) {
      return { state: { value: state.value + 1 }, note: `bump to ${state.value + 1}` };
    },
  };
}

test("without minRounds, a candidate over the bar converges on round 1 with no correction", async () => {
  const result = await runLoop(counterSpec(), { value: 0 });
  assert.equal(result.rounds.length, 1);
  assert.equal(result.converged, true);
  assert.equal(result.rounds[0].correction, undefined); // never corrected
});

test("minRounds forces a correction round even when the bar is already cleared", async () => {
  const result = await runLoop(counterSpec(2), { value: 0 });
  // Round 1 cannot end the loop; correct() runs, then round 2 clears the bar.
  assert.equal(result.rounds.length, 2);
  assert.equal(result.converged, true);
  assert.ok(result.rounds[0].correction, "round 1 should record a correction");
  assert.equal(result.rounds[1].candidate, 1); // the corrected candidate was rendered
});

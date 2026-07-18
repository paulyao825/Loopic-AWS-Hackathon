import type { Frame, FrameQuality } from "../domain/types.js";

/**
 * Fast per-frame scorer for Loop 1 (sharpness / face / eyes-open).
 * Must be cheap — it runs on every extracted frame.
 * Real impl (step 2): laplacian variance + face detector.
 */
export interface FrameScorer {
  /** Optional one-time batch preparation for remote vision scorers. */
  prepare?(frames: Frame[]): Promise<void>;
  score(frame: Frame): Promise<FrameQuality>;
  /** Similarity 0..1 between two frames (1 = near-identical). */
  similarity(a: Frame, b: Frame): Promise<number>;
}

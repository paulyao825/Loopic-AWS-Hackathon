import { readFile } from "node:fs/promises";
import type { GeminiConfig } from "../appConfig.js";
import type { Frame } from "../domain/types.js";
import { interactionImage, requestGeminiInteraction } from "./gemini.js";

const REPAIR_PROMPT = `Repair accidental camera shake and focus blur in this real photograph.
Preserve every person, object, face, hand, text, geometry, composition, crop, and lighting relationship.
Do not add, remove, relocate, or invent visual details. Do not change the scene, pose, or story.
Return a faithful photo repair only; if a safe repair is not possible, preserve the original image as closely as possible.`;

export class NanoBananaBlurRepair {
  constructor(private readonly cfg: GeminiConfig) {}

  async repair(frame: Frame): Promise<{ dataUrl: string }> {
    const image = await readFile(frame.uri);
    const response = await requestGeminiInteraction({
      cfg: this.cfg,
      label: "blur repair",
      body: {
        model: this.cfg.imageModel,
        input: [
          { type: "text", text: REPAIR_PROMPT },
          { type: "image", mime_type: "image/jpeg", data: image.toString("base64") },
        ],
        // Supported image_size values are "512", "1K", "2K", "4K". Source
        // frames are extracted at ~640px, so "512" keeps the repair at a
        // comparable resolution without upscaling / inventing detail.
        response_format: { type: "image", mime_type: "image/jpeg", image_size: "512" },
      },
    });
    const output = interactionImage(response);
    if (!output) throw new Error("AI blur repair returned no image");
    return { dataUrl: `data:${output.mimeType};base64,${output.data}` };
  }
}

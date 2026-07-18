import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type { EditedImage, Frame, Recipe } from "../domain/types.js";
import type { Editor } from "./editor.js";
import { recipeSlug } from "./editor.js";

const OUTPUT_WIDTH = 640;

export async function renderRecipe(srcPath: string, recipe: Recipe, outPath: string): Promise<void> {
  const meta = await sharp(srcPath).metadata();
  const width = meta.width ?? OUTPUT_WIDTH;
  const height = meta.height ?? OUTPUT_WIDTH;
  const crop = recipe.crop;
  const region = {
    left: Math.round(crop.x * width),
    top: Math.round(crop.y * height),
    width: Math.max(16, Math.round(crop.w * width)),
    height: Math.max(16, Math.round(crop.h * height)),
  };
  region.left = Math.min(region.left, width - region.width);
  region.top = Math.min(region.top, height - region.height);

  const gain = Math.pow(2, recipe.exposureEv);
  const contrast = recipe.contrast;
  const contrastOffset = 128 * (1 - contrast);
  const warmth = recipe.temperature * 0.12;
  const channelGains = [gain * (1 + warmth), gain, gain * (1 - warmth)];

  let image = sharp(srcPath)
    .extract(region)
    .resize({ width: OUTPUT_WIDTH })
    .linear(
      channelGains.map((channelGain) => channelGain * contrast),
      channelGains.map(() => contrastOffset),
    );

  if (recipe.saturation !== 1) image = image.modulate({ saturation: recipe.saturation });
  if (recipe.sharpen > 0.01) image = image.sharpen({ sigma: 0.5 + recipe.sharpen * 1.5 });

  await mkdir(path.dirname(outPath), { recursive: true });
  await image.jpeg({ quality: 90 }).toFile(outPath);
}

export class SharpLocalEditor implements Editor {
  readonly backend = "sharp";

  constructor(
    private readonly outDir: string,
    private readonly urlFor: (absPath: string) => string,
  ) {}

  async edit(frame: Frame, recipe: Recipe): Promise<EditedImage> {
    const outPath = path.join(this.outDir, `${frame.id}_${recipeSlug(recipe)}.jpg`);
    await renderRecipe(frame.uri, recipe, outPath);
    return { frameId: frame.id, uri: this.urlFor(outPath), recipe, backend: this.backend };
  }
}

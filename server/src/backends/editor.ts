import type { EditedImage, Frame, Recipe } from "../domain/types.js";

export interface Editor {
  readonly backend: string;
  edit(frame: Frame, recipe: Recipe): Promise<EditedImage>;
}

export function recipeSlug(recipe: Recipe): string {
  const crop = recipe.crop;
  return [
    `c${crop.x.toFixed(2)}-${crop.y.toFixed(2)}-${crop.w.toFixed(2)}-${crop.h.toFixed(2)}`,
    `ev${recipe.exposureEv.toFixed(2)}`,
    `ct${recipe.contrast.toFixed(2)}`,
    `sa${recipe.saturation.toFixed(2)}`,
    `te${recipe.temperature.toFixed(2)}`,
    `sh${recipe.sharpen.toFixed(2)}`,
  ].join("_");
}

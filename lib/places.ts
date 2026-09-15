import data from "../data/shanghai.catalogue.json" with { type: "json" };
import { parseCatalogue } from "./catalogue-schema.ts";
export type { Place, Source, Category } from "./catalogue-schema.ts";

// UI and recommendations consume the same validated catalogue.
// New places and visit profiles are maintained entirely in the data file.
export const catalogue = parseCatalogue(data);
export const ALL_AREAS = catalogue.city.allAreasLabel;
export const areas = [ALL_AREAS, ...catalogue.city.areas];
export const catalogueUpdatedAt = catalogue.dataUpdatedAt;
export const places = catalogue.places;

export function validSavedIds(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id): id is number =>
    typeof id === "number" && places.some((p) => p.id === id)))];
}

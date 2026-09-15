import { z } from "zod";

const text = z.string().trim().min(1);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const parsed = new Date(value + "T00:00:00Z");
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}, "Invalid calendar date");
const source = z.object({ title: text, url: z.string().url().refine(value => {
  const url = new URL(value);
  return url.protocol === "https:" && url.pathname !== "/";
}, "Use a specific HTTPS source page"), date: date.optional() }).strict();
const activity = z.enum(["architecture", "exhibition", "snack", "cafe", "park", "browse", "reading", "meal", "concert", "opera", "musical", "drama", "jazz", "bar", "records", "film"]);
export const visitSchema = z.object({
  minutes: z.tuple([z.number().int().positive(), z.number().int().positive()]).refine(([min, max]) => min <= max, "Visit duration bounds are reversed"),
  activity, setting: z.enum(["室内为主", "户外为主", "室内外结合"]),
  conversation: z.enum(["可交流", "轻声交流", "以专注观看为主"]),
  participation: text, booking: text, cluster: text, evening: z.boolean(), adultExperience: z.boolean(), basis: z.literal("编辑建议"),
}).strict();
const geo = z.discriminatedUnion("status", [
  z.object({ status: z.literal("pending"), point: z.null(), source: z.null(), checkedAt: z.null() }).strict(),
  z.object({ status: z.literal("verified"), point: z.object({ latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180), crs: z.enum(["WGS84", "GCJ-02", "BD-09"]) }).strict(), source, checkedAt: date }).strict(),
]);
const operations = z.discriminatedUnion("status", [
  z.object({ status: z.literal("not_checked"), checkedAt: z.null(), source: z.null() }).strict(),
  z.object({ status: z.enum(["reported_open", "reported_closed", "temporarily_closed"]), checkedAt: date, source }).strict(),
]);
const placeSchema = z.object({
  id: z.number().int().positive(), name: text, category: z.enum(["吃", "喝", "玩", "看", "逛"]), type: text, area: text,
  address: text, duration: text, walking: text,
  moods: z.array(z.enum(["松弛", "有故事", "热闹", "小众"])).min(1), tags: z.array(text).min(1), why: text, watchout: text,
  opening: text, cost: text, sources: z.array(source).min(1), checkedAt: date,
  visit: visitSchema, geo, operations,
  externalRefs: z.array(z.object({ provider: text, placeId: text }).strict()),
}).strict();
export const catalogueSchema = z.object({
  schemaVersion: z.literal(1),
  city: z.object({ id: text, name: text, countryCode: z.string().length(2), allAreasLabel: text, areas: z.array(text).min(1) }).strict(),
  dataUpdatedAt: date, schemaUpdatedAt: date, retiredIds: z.array(z.number().int().positive()), places: z.array(placeSchema).min(1),
}).strict().superRefine((catalogue, context) => {
  const ids = new Set<number>(), identities = new Set<string>(), external = new Set<string>();
  if (new Set(catalogue.city.areas).size !== catalogue.city.areas.length || catalogue.city.areas.includes(catalogue.city.allAreasLabel)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["city", "areas"], message: "Browsing groups must be unique and separate from the all-areas label" });
  }
  catalogue.places.forEach((place, index) => {
    const issue = (field: string, message: string) => context.addIssue({ code: z.ZodIssueCode.custom, path: ["places", index, field], message });
    if (ids.has(place.id) || catalogue.retiredIds.includes(place.id) || [2, 3, 4].includes(place.id)) issue("id", "Duplicate or retired saved-place ID");
    ids.add(place.id);
    const identity = place.name.normalize("NFKC").trim() + "|" + place.address.normalize("NFKC").trim();
    if (identities.has(identity)) issue("name", "Duplicate place name and address");
    identities.add(identity);
    if (!catalogue.city.areas.includes(place.area)) issue("area", "Area must belong to this city's browsing groups");
    if (place.checkedAt > catalogue.dataUpdatedAt) issue("checkedAt", "Source check date cannot be later than the catalogue data date");
    for (const [field, record] of [["geo", place.geo], ["operations", place.operations]] as const) {
      if (record.checkedAt && record.checkedAt > catalogue.dataUpdatedAt) issue(field, "Verification date cannot be later than the catalogue data date");
    }
    for (const ref of place.externalRefs) {
      const key = ref.provider + ":" + ref.placeId;
      if (external.has(key)) issue("externalRefs", "Duplicate external place identity");
      external.add(key);
    }
  });
});

export type Catalogue = z.infer<typeof catalogueSchema>;
export type Place = z.infer<typeof placeSchema>;
export type Source = z.infer<typeof source>;
export type Category = Place["category"];
export type VisitProfile = z.infer<typeof visitSchema>;
export type Activity = VisitProfile["activity"];
export function parseCatalogue(value: unknown): Catalogue { return catalogueSchema.parse(value); }

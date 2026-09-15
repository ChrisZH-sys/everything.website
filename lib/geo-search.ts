import type { Place } from "./catalogue-schema.ts";

type Point = Extract<Place["geo"], { status: "verified" }>["point"];
export const radiusOptions = [500, 1000, 2000, 3000] as const;

// Approximate surface distance between map pins; never a walking route.
export function straightLineMeters(a: Point, b: Point): number | null {
  if (a.crs !== b.crs) return null;
  const rad = (n: number) => n * Math.PI / 180;
  const h = Math.sin(rad(b.latitude - a.latitude) / 2) ** 2 +
    Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(rad(b.longitude - a.longitude) / 2) ** 2;
  return 6371008.8 * 2 * Math.asin(Math.sqrt(Math.max(0, Math.min(1, h))));
}

export function distanceFrom(origin: Place, place: Place): number | null {
  if (origin.geo.status !== "verified" || place.geo.status !== "verified") return null;
  return straightLineMeters(origin.geo.point, place.geo.point);
}

export function withinRadius(candidates: Place[], origin: Place | null, radius: number) {
  if (!origin) return { places: candidates, excluded: 0, eligible: candidates.length };
  if (!Number.isFinite(radius) || radius < 0) throw new RangeError("Invalid radius");
  let eligible = 0;
  const matches = candidates.filter(place => {
    const distance = distanceFrom(origin, place);
    if (distance === null) return false;
    eligible++;
    return distance <= radius;
  });
  return { places: matches, excluded: candidates.length - eligible, eligible };
}

export function formatDistance(meters: number): string {
  if (meters < 50) return "不足50米";
  return meters < 1000 ? `约${Math.round(meters / 50) * 50}米` : `约${(meters / 1000).toFixed(1)}公里`;
}

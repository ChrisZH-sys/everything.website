import test from "node:test";
import assert from "node:assert/strict";
import { places } from "../lib/places.ts";
import { distanceFrom, straightLineMeters, withinRadius, formatDistance } from "../lib/geo-search.ts";

const point = (latitude, longitude, crs = "GCJ-02") => ({ latitude, longitude, crs });
test("distance handles zero, known arc, symmetry and mixed coordinate systems", () => {
  assert.equal(straightLineMeters(point(31, 121), point(31, 121)), 0);
  assert.ok(Math.abs(straightLineMeters(point(0, 0), point(0, 1)) - 111195.08) < 0.1);
  assert.equal(straightLineMeters(point(31, 121), point(32, 122)), straightLineMeters(point(32, 122), point(31, 121)));
  assert.equal(straightLineMeters(point(31, 121), point(31, 121, "WGS84")), null);
});

test("radius uses unrounded distance, includes boundary and excludes unknown coordinates", () => {
  const origin = places.find(p => p.id === 6), cafe = places.find(p => p.id === 103);
  const distance = distanceFrom(origin, cafe);
  assert.ok(distance > 700 && distance < 800);
  assert.deepEqual(withinRadius([cafe], origin, distance).places, [cafe]);
  assert.deepEqual(withinRadius([cafe], origin, distance - 0.001).places, []);
  assert.deepEqual(withinRadius([origin], origin, 0).places, [origin]);
  const unknown = places.find(p => p.geo.status === "pending");
  assert.equal(withinRadius([unknown], origin, 3000).excluded, 1);
  const mixed = structuredClone(cafe); mixed.geo.point.crs = "WGS84";
  assert.equal(withinRadius([mixed], origin, 3000).excluded, 1);
  assert.throws(() => withinRadius(places, origin, NaN), RangeError);
  assert.equal(formatDistance(0), "不足50米");
});

test("real origin and radius choices change the pool; removing radius restores all candidates", () => {
  const park = places.find(p => p.id === 6), theatre = places.find(p => p.id === 110);
  const ids = (origin, radius) => withinRadius(places, origin, radius).places.map(p => p.id);
  assert.deepEqual(ids(park, 500), [6]);
  assert.ok(ids(park, 1000).includes(103));
  assert.ok(!ids(park, 1000).includes(110));
  assert.ok(ids(park, 2000).includes(110));
  assert.notDeepEqual(ids(park, 500), ids(theatre, 500));
  assert.equal(withinRadius(places, null, 500).places.length, 60);
  assert.equal(withinRadius(places, park, 3000).excluded, 55);
  assert.deepEqual(withinRadius(places.filter(p => p.category === "看"), park, 500).places, []);
});

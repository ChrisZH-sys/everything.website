import assert from "node:assert/strict";
import test from "node:test";
import { places } from "../lib/places.ts";
import { recommend, rankPlaces, shortlist } from "../lib/recommendations.ts";

const solo = { duration: "2小时", companion: "一个人", mood: "松弛" };
const ids = rows => rows.map(r => r.place.id);

test("time budget demotes performances without excluding them from discovery", () => {
  const concert = places.find(p => p.id === 5);
  const short = recommend(concert, solo);
  const longer = recommend(concert, { ...solo, duration: "半天" });
  assert.equal(short.timeFits, false);
  assert.equal(longer.timeFits, true);
  assert.ok(longer.priority > short.priority);
  assert.match(short.caution, /交通会偏紧/);
  assert.equal(rankPlaces(places, solo).length, 30);
  assert.ok(shortlist(rankPlaces(places, solo)).every(r => r.timeFits));
});

test("companion and mood change recommendations with explicit reasons", () => {
  const friends = { ...solo, companion: "朋友" };
  assert.notDeepEqual(ids(shortlist(rankPlaces(places, solo))), ids(shortlist(rankPlaces(places, friends))));
  const coffee = places.find(p => p.id === 103);
  assert.ok(recommend(coffee, friends).reasons.some(r => r.includes("朋友")));
  const museum = places.find(p => p.id === 126);
  assert.ok(recommend(museum, { ...solo, mood: "有故事" }).priority > recommend(museum, solo).priority);
  assert.ok(recommend(museum, { ...solo, companion: "家人" }).reasons.some(r => r.includes("无障碍条件需另查")));
});

test("shortlist respects a restricted pool, empty state and category diversity", () => {
  assert.deepEqual(shortlist([]), []);
  const cafeOnly = places.filter(p => p.category === "喝");
  assert.deepEqual(new Set(ids(shortlist(rankPlaces(cafeOnly, solo)))), new Set(cafeOnly.map(p => p.id)));
  const narrowed = [places.find(p => p.id === 5)];
  assert.equal(shortlist(rankPlaces(narrowed, solo))[0].timeFits, false);
  const initial = shortlist(rankPlaces(places, solo));
  assert.equal(initial.length, 3);
  assert.equal(new Set(initial.map(r => r.place.category)).size, 3);
  for (const p of places) assert.ok(recommend(p, solo).caution);
});

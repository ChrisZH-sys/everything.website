import assert from "node:assert/strict";
import test from "node:test";
import { places } from "../lib/places.ts";
import { recommend, rankPlaces, shortlist } from "../lib/recommendations.ts";
import { visitFor, scenesFor, sceneNames } from "../lib/visit-profiles.ts";

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
  assert.equal(rankPlaces(places, solo).length, places.length);
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
  const cafePicks = shortlist(rankPlaces(cafeOnly, solo));
  assert.equal(cafePicks.length, 3);
  assert.ok(cafePicks.every(r => r.place.category === "喝"));
  const narrowed = [places.find(p => p.id === 5)];
  assert.equal(shortlist(rankPlaces(narrowed, solo))[0].timeFits, false);
  const initial = shortlist(rankPlaces(places, solo));
  assert.equal(initial.length, 3);
  assert.equal(new Set(initial.map(r => r.place.category)).size, 3);
  for (const p of places) assert.ok(recommend(p, solo).caution);
});

test("focus area has five independent candidates in each core scene", () => {
  const focus = places.filter(p => p.area === "武康—衡山");
  for (const scene of sceneNames) {
    const groups = new Set(focus.filter(p => scenesFor(p).includes(scene)).map(p => visitFor(p).cluster));
    assert.ok(groups.size >= 5, `${scene}: ${groups.size}`);
  }
});

test("all 48 outings preserve constraints, area filters and deterministic alternatives", () => {
  for (const duration of ["2小时", "半天", "一天"])
  for (const companion of ["一个人", "两个人", "朋友", "家人"])
  for (const mood of ["松弛", "有故事", "热闹", "小众"]) {
    const outing = { duration, companion, mood };
    for (const area of [null, "武康—衡山", "复兴—淮海", "思南—瑞金"]) {
      const pool = places.filter(p => !area || p.area === area);
      const picks = shortlist(rankPlaces(pool, outing));
      assert.equal(picks.length, 3);
      assert.equal(new Set(picks.map(r => visitFor(r.place).cluster)).size, 3);
      assert.ok(picks.every(r => pool.includes(r.place) && r.timeFits && r.suitable));
      if (duration === "2小时") assert.ok(picks.every(r => visitFor(r.place).minutes[1] <= 90));
      if (companion === "家人") assert.ok(picks.every(r => !visitFor(r.place).adultExperience));
      assert.deepEqual(ids(picks), ids(shortlist(rankPlaces([...pool].reverse(), outing))));
    }
  }
});

test("decision annotations are complete and do not imply bookable or quiet venues", () => {
  for (const p of places) {
    const v = visitFor(p);
    assert.equal(v.basis, "编辑建议");
    assert.ok(v.minutes[0] > 0 && v.minutes[1] >= v.minutes[0]);
    assert.ok(v.participation && v.booking && v.conversation);
  }
  assert.deepEqual(shortlist(rankPlaces(places, solo), 0), []);
  const familyBars = rankPlaces(places.filter(p => p.id === 215), { ...solo, companion: "家人" });
  assert.equal(familyBars.length, 1, "Keep unsuitable places discoverable in the full list");
  assert.deepEqual(shortlist(familyBars), []);
});

import assert from "node:assert/strict";
import test from "node:test";
import { places, areas, ALL_AREAS, validSavedIds } from "../lib/places.ts";

test("the expandable catalogue retains at least 60 distinct real-place records", () => {
  assert.ok(places.length >= 60);
  assert.equal(new Set(places.map(p => p.id)).size, places.length);
  assert.equal(new Set(places.map(p => p.name)).size, places.length);
  const counts = {};
  for (const p of places) {
    counts[p.category] = (counts[p.category] ?? 0) + 1;
    assert.ok(areas.includes(p.area) && p.area !== ALL_AREAS);
    assert.ok(p.address && p.opening && p.cost && p.watchout);
    assert.match(p.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(p.sources.length > 0, p.name);
    for (const source of p.sources) {
      assert.equal(new URL(source.url).protocol, "https:");
      assert.ok(source.title && new URL(source.url).pathname !== "/");
    }
    assert.doesNotMatch(p.name, /样本|休息点|散步段/);
  }
  for (const category of ["看", "吃", "喝", "玩", "逛"]) assert.ok(counts[category] >= 5);
});

test("saved sample IDs cannot become unrelated real places", () => {
  assert.deepEqual(validSavedIds([1, 2, 3, 4, 5, 6, 101, 1, "5", null, 999]), [1, 5, 6, 101]);
  assert.deepEqual(validSavedIds({ id: 1 }), []);
  assert.deepEqual(validSavedIds(null), []);
  assert.equal(places.find(p => p.id === 1).name, "武康大楼");
  assert.equal(places.find(p => p.id === 5).name, "上海交响乐团音乐厅");
  assert.equal(places.find(p => p.id === 6).name, "衡山公园");
});

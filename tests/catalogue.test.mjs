import assert from "node:assert/strict";
import test from "node:test";
import data from "../data/shanghai.catalogue.json" with { type: "json" };
import { parseCatalogue } from "../lib/catalogue-schema.ts";
import { recommend } from "../lib/recommendations.ts";
import { visitFor } from "../lib/visit-profiles.ts";

const changed = fn => { const copy = structuredClone(data); fn(copy); return copy; };
test("one complete data record is enough to add a recommendation candidate", () => {
  const copy = changed(c => {
    const next = structuredClone(c.places[0]);
    next.id = 999001; next.name = "测试记录（不发布）"; next.visit.cluster = "test-cluster";
    c.places.push(next);
  });
  const added = parseCatalogue(copy).places.at(-1);
  assert.equal(visitFor(added).cluster, "test-cluster");
  assert.equal(recommend(added, { duration: "2小时", companion: "一个人", mood: "松弛" }).place, added);
});

test("duplicate identities, retired IDs and unsupported browsing groups are rejected", () => {
  for (const mutate of [
    c => c.places.push(structuredClone(c.places[0])),
    c => { c.places[0].id = 2; c.retiredIds = []; },
    c => { c.places[0].area = "尚未定义的片区"; },
    c => { c.places[0].visit.minutes = [90, 30]; },
    c => { c.places[0].checkedAt = "2026-02-30"; },
    c => { c.places[0].sources = []; },
    c => { c.places[0].sources[0].url = "https://example.com/"; },
    c => { c.places[0].externalRefs = c.places[1].externalRefs = [{provider:"test",placeId:"same"}]; },
  ]) assert.throws(() => parseCatalogue(changed(mutate)));
});

test("coordinates need a source, verification date and declared coordinate system", () => {
  const point = { latitude: 31.2, longitude: 121.4, crs: "WGS84" };
  const source = { title: "测试坐标来源（不发布）", url: "https://example.com/fixture" };
  const valid = changed(c => { c.places[0].geo = {status:"verified",point,source,checkedAt:"2026-09-14"}; });
  assert.equal(parseCatalogue(valid).places[0].geo.point.crs, "WGS84");
  for (const geo of [
    {status:"verified",point,source:null,checkedAt:"2026-09-14"},
    {status:"verified",point,source,checkedAt:null},
    {status:"pending",point,source:null,checkedAt:null},
    {status:"verified",point:{...point,latitude:91},source,checkedAt:"2026-09-14"},
    {status:"verified",point:{latitude:31.2,longitude:121.4},source,checkedAt:"2026-09-14"},
  ]) assert.throws(() => parseCatalogue(changed(c => {c.places[0].geo = geo;})));
});

test("current operation claims cannot be silently inferred from source consultation", () => {
  assert.throws(() => parseCatalogue(changed(c => {c.places[0].operations = {status:"reported_open",checkedAt:null,source:null};})));
  const record = parseCatalogue(data).places[0];
  assert.ok(record.checkedAt);
  assert.equal(record.operations.status, "not_checked");
});

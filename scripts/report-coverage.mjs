import { readFile } from "node:fs/promises";
import { places, areas } from "../lib/places.ts";
import { rankPlaces, shortlist } from "../lib/recommendations.ts";
import { sceneNames, scenesFor, visitFor } from "../lib/visit-profiles.ts";

const rows = [];
for (const duration of ["2小时", "半天", "一天"])
for (const companion of ["一个人", "两个人", "朋友", "家人"])
for (const mood of ["松弛", "有故事", "热闹", "小众"])
  rows.push({ duration, companion, mood, ids: shortlist(rankPlaces(places, { duration, companion, mood })).map(r => r.place.id) });
const before = JSON.parse(await readFile(new URL("../tests/fixtures/coverage-before-2026-09-14.json", import.meta.url), "utf8"));
function metrics(data) {
  const key = r => [...r.ids].sort((a,b) => a-b).join(",");
  const pairs = field => {
    let unchanged = 0, total = 0;
    for (let i=0;i<data.length;i++) for(let j=i+1;j<data.length;j++) {
      if (["duration","companion","mood"].filter(k=>k!==field).every(k=>data[i][k]===data[j][k]) && data[i][field]!==data[j][field]) {
        total++; if(key(data[i])===key(data[j])) unchanged++;
      }
    }
    return { unchanged, total };
  };
  return { scenarios:data.length, distinctSets:new Set(data.map(key)).size, surfacedPlaces:new Set(data.flatMap(r=>r.ids)).size, durationPairs:pairs("duration"), companionPairs:pairs("companion"), moodPairs:pairs("mood") };
}
console.log(JSON.stringify({
  before:metrics(before),after:metrics(rows),
  coverage:areas.slice(1).map(area=>({area,total:places.filter(p=>p.area===area).length,
    scenes:Object.fromEntries(sceneNames.map(s=>[s,new Set(places.filter(p=>p.area===area&&scenesFor(p).includes(s)).map(p=>visitFor(p).cluster)).size]))})),
  rows
},null,2));


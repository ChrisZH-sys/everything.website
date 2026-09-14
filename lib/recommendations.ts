import type { Place } from "./places";
import { activityLabels, visitFor, type Activity } from "./visit-profiles.ts";

export type Outing = { duration: "2小时" | "半天" | "一天"; companion: "一个人" | "两个人" | "朋友" | "家人"; mood: "松弛" | "有故事" | "热闹" | "小众" };
export type Recommendation = { place: Place; priority: number; reasons: string[]; caution: string; timeFits: boolean; suitable: boolean };

// Editorial preference strengths, not ratings or learned scores.
const social: Record<Outing["companion"], Partial<Record<Activity, number>>> = {
  "一个人": { reading: 20, records: 18, exhibition: 16, architecture: 14, park: 12, snack: 10, cafe: 8, concert: 12, opera: 8 },
  "两个人": { cafe: 22, meal: 20, park: 12, browse: 10, exhibition: 8, film: 14, jazz: 14, bar: 16 },
  "朋友": { meal: 24, cafe: 14, film: 20, jazz: 22, musical: 18, drama: 16, browse: 12, park: 10, bar: 18 },
  "家人": { park: 20, exhibition: 16, meal: 14, browse: 12, architecture: 10, snack: 8, film: 8 },
};
export function recommend(place: Place, outing: Outing): Recommendation {
  const v = visitFor(place), [min, max] = v.minutes;
  const budget = { "2小时": 120, "半天": 240, "一天": 480 }[outing.duration];
  const target = { "2小时": 45, "半天": 90, "一天": 120 }[outing.duration];
  const timeFits = max <= budget - 30;
  const suitable = !(outing.companion === "家人" && v.adultExperience);
  const durationFit = Math.max(0, 18 - Math.abs((min + max) / 2 - target) / 5);
  let priority = (timeFits ? 30 : -40) + durationFit + (social[outing.companion][v.activity] ?? 0);
  if (!suitable) priority -= 100;
  if (place.moods.includes(outing.mood)) priority += 22;
  const reasons = [`这处可以${activityLabels[v.activity]}：${place.why}`];
  if (v.conversation === "可交流" && ["两个人", "朋友"].includes(outing.companion)) {
    reasons.push(`${outing.companion}同行，可以把这次停留留给交流；座位与环境需确认。`);
  } else if (outing.companion === "一个人" && ["reading", "records", "exhibition", "architecture"].includes(v.activity)) {
    reasons.push("一个人可以按自己的兴趣与节奏阅读、观察。");
  } else if (outing.companion === "家人") {
    reasons.push(v.adultExperience ? "以晚间酒吧或爵士体验为主，家人同行时不放入默认推荐。" : "家人同行可一起选择主题；无障碍条件需另查。");
  } else {
    reasons.push(v.conversation === "以专注观看为主" ? "适合共同观看；观看期间不适合聊天，先确认大家对节目有兴趣。" : v.participation);
  }
  reasons.push(`单点建议${min}–${max}分钟（编辑估计），${outing.duration === "2小时" ? "另预留30分钟余量，交通与排队需自行核对" : `可作为${outing.duration}出行中的一站；其余行程需另作安排`}。`);
  if (v.evening) reasons.push("这是晚间候选；当前没有按出发时刻核对营业。");
  const caution = !timeFits ? "加上交通会偏紧；建议缩短停留或选择更短的活动，场次时长请另查。"
    : v.evening ? "晚间体验：先确认营业日、消费与入场要求。"
    : v.conversation === "以专注观看为主" ? "先确认场次、时长与余票；不保证当天有合适节目。"
    : v.setting !== "室内为主" ? "户外部分受天气影响；当前开放范围与人流待确认。"
    : ["两个人", "朋友"].includes(outing.companion) && v.conversation === "轻声交流" ? "阅读、看展或选唱片以轻声交流为宜；主要想聊天可选咖啡与餐厅。"
    : "当天营业、座位、费用及预约要求请在出发前确认。";
  return { place, priority, reasons, caution, timeFits, suitable };
}
export function rankPlaces(places: Place[], outing: Outing): Recommendation[] {
  return places.map(p => recommend(p, outing)).sort((a, b) =>
    b.priority - a.priority || a.place.name.localeCompare(b.place.name, "zh-CN"));
}
// Diversify activities within 18 points of the best remaining match.
// A precinct and tenant cannot fill two slots. Ties use names only for display;
// no ID preference or random rotation. All alternatives remain in the full list.
export function shortlist(ranked: Recommendation[], limit = 3): Recommendation[] {
  if (limit <= 0) return [];
  const suitable = ranked.filter(r => r.suitable);
  const pool = suitable.some(r => r.timeFits) ? suitable.filter(r => r.timeFits) : suitable;
  const chosen: Recommendation[] = [];
  while (chosen.length < limit) {
    const remaining = pool.filter(r => !chosen.some(c => visitFor(c.place).cluster === visitFor(r.place).cluster));
    if (!remaining.length) break;
    const candidates = remaining.filter(r => r.priority >= remaining[0].priority - 18);
    const adjusted = (r: Recommendation) => r.priority
      - (chosen.some(c => visitFor(c.place).activity === visitFor(r.place).activity) ? 18 : 0)
      - (chosen.some(c => c.place.category === r.place.category) ? 4 : 0);
    candidates.sort((a, b) => adjusted(b) - adjusted(a) || b.priority - a.priority || a.place.name.localeCompare(b.place.name, "zh-CN"));
    chosen.push(candidates[0]);
  }
  return chosen;
}

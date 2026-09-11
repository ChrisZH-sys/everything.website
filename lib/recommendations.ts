import type { Place } from "./places";

export type Outing = { duration: "2小时" | "半天" | "一天"; companion: "一个人" | "两个人" | "朋友" | "家人"; mood: "松弛" | "有故事" | "热闹" | "小众" };
export type Recommendation = { place: Place; priority: number; reasons: string[]; caution: string; timeFits: boolean };

// Editorial visit-time ranges, consistent with the displayed suggestions.
// They exclude journeys, queues and real-time event running lengths.
const minutes: Record<number, [number, number]> = {
  1: [30, 60], 101: [45, 60], 102: [30, 60], 103: [30, 60], 5: [120, 120],
  6: [30, 60], 104: [45, 60], 105: [15, 30], 106: [30, 60], 107: [60, 120],
  108: [120, 120], 109: [120, 120], 110: [120, 120], 111: [45, 90],
  112: [30, 60], 113: [30, 60], 114: [45, 60], 115: [30, 60], 116: [30, 45],
  117: [30, 45], 118: [30, 45], 119: [60, 90], 120: [45, 75], 121: [30, 45],
  122: [30, 45], 123: [30, 45], 124: [60, 90], 125: [60, 90], 126: [60, 90], 127: [60, 90],
};
const outdoor = new Set([1, 6, 106, 111]);
const reading = new Set([107, 112, 113, 114, 115]);

export function recommend(place: Place, outing: Outing): Recommendation {
  const range = minutes[place.id];
  if (!range) throw new Error(`Missing visit-time annotation for ${place.id}`);
  const performance = place.category === "玩";
  const food = place.category === "吃" || place.category === "喝";
  const budget = { "2小时": 120, "半天": 240, "一天": 480 }[outing.duration];
  // Reserve 30 minutes as an editorial buffer, NOT a calculated journey.
  const timeFits = range[1] <= budget - 30;
  let priority = timeFits ? 20 : -30;
  const reasons: string[] = [];
  let companionReason = "";
  if (outing.companion === "一个人" && (reading.has(place.id) || place.category === "看")) {
    priority += 8;
    companionReason = "一个人也能按自己的兴趣观察、阅读或看展。";
  } else if (outing.companion === "两个人" && (food || place.category === "看")) {
    priority += 8;
    companionReason = food ? "两个人可以围绕一顿饭或一杯饮品安排相处时间。" : "两个人可以选一个共同感兴趣的主题一起看。";
  } else if (outing.companion === "朋友" && (food || outdoor.has(place.id))) {
    priority += 12;
    companionReason = food ? "和朋友同行，可以把用餐或喝东西作为碰面的活动。" : "和朋友一起走走，停留节奏可以商量着来。";
  } else if (outing.companion === "家人" && !performance && !food) {
    priority += 8;
    companionReason = "家人同行，可按大家的兴趣调整停留长短；无障碍条件需另查。";
  }

  if (place.moods.includes(outing.mood)) {
    priority += 12;
    reasons.push({
      "松弛": "想松弛一点：这处地点被编辑标为可慢慢体验的候选。",
      "有故事": "想看点故事：这里的历史、人物或作品可以作为探索主题。",
      "热闹": "想热闹一点：优先考虑用餐、商业街区或共同活动，实际人流待确认。",
      "小众": "想换点新鲜的：这里有相对具体的阅读、艺术或体验主题。",
    }[outing.mood]);
  }
  if (companionReason) reasons.push(companionReason);
  if (timeFits) {
    reasons.push(outing.duration === "2小时"
      ? `单点建议停留${range[0]}–${range[1]}分钟，可以在两小时里留出一些余量。`
      : performance ? "时间预算较宽裕，可以先确认场次，再围绕演出安排这次出行。"
        : `单点建议停留${range[0]}–${range[1]}分钟，可以作为${outing.duration}出行中的一站。`);
  }
  const caution = !timeFits
    ? performance ? "演出本身约需2小时或更久，加上交通会偏紧；须另查排期和余票。"
      : "按建议停留上限计算，留给交通的余量偏少；可缩短停留或换个候选。"
    : performance ? "请先确认当天场次、演出时长与余票。"
    : outdoor.has(place.id) ? "户外体验受天气影响；这里不提供实时人流或天气判断。"
    : reading.has(place.id) && outing.companion === "朋友" ? "书店、阅览区以阅读为主；如果主要想聊天，可以优先看看咖啡或用餐候选。"
    : "当天营业、预约和费用未逐项确认，出发前请查看地点资料。";
  return { place, priority, reasons, caution, timeFits };
}

export function rankPlaces(places: Place[], outing: Outing): Recommendation[] {
  return places.map(p => recommend(p, outing)).sort((a, b) => b.priority - a.priority || a.place.id - b.place.id);
}

// Show different activities among time-fitting candidates, then fill remaining
// slots. Search/category/area filtering happens before this function.
export function shortlist(ranked: Recommendation[], limit = 3): Recommendation[] {
  const chosen: Recommendation[] = [];
  const pool = ranked.some(r => r.timeFits) ? ranked.filter(r => r.timeFits) : ranked;
  for (const r of pool) {
    if (!chosen.some(c => c.place.category === r.place.category)) chosen.push(r);
    if (chosen.length === limit) return chosen;
  }
  for (const r of pool) {
    if (!chosen.some(c => c.place.id === r.place.id)) chosen.push(r);
    if (chosen.length === limit) break;
  }
  return chosen;
}

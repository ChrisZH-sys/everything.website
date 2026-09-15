import { places } from "./places.ts";
import type { Activity, VisitProfile } from "./catalogue-schema.ts";
export type { Activity, VisitProfile } from "./catalogue-schema.ts";
export const activityLabels: Record<Activity, string> = {
  architecture: "观察建筑", exhibition: "主题看展", snack: "简餐补给", cafe: "饮品与小坐",
  park: "公园慢走", browse: "街区浏览", reading: "阅读与选书", meal: "坐下来用餐",
  concert: "听交响音乐", opera: "看歌剧", musical: "看音乐剧", drama: "看舞台或放映",
  jazz: "听爵士现场", bar: "晚间调酒", records: "挑选唱片", film: "一起看电影",
};

const profiles = new Map(places.map(place => [place.id, place.visit]));
export function visitFor(place: { id: number; visit?: VisitProfile }): VisitProfile {
  const profile = place.visit ?? profiles.get(place.id);
  if (!profile) throw new Error("Missing visit profile: " + place.id);
  return profile;
}

export const sceneNames = ["独自阅读或观察", "两个人交流", "朋友聚会或共同活动", "随意走走", "专注文化体验"] as const;
export type Scene = typeof sceneNames[number];
// Potential candidates, not proof of current seats, bookings or opening.
// Overlapping precinct/tenant records count once per scene in coverage reports.
export function scenesFor(place: { id: number }): Scene[] {
  const p = visitFor(place), result: Scene[] = [];
  if (["reading","records","architecture","exhibition"].includes(p.activity)) result.push("独自阅读或观察");
  if (["cafe","meal"].includes(p.activity)) result.push("两个人交流");
  if (["meal","cafe","film","concert","opera","musical","drama","jazz"].includes(p.activity)) result.push("朋友聚会或共同活动");
  if (["park","browse","architecture"].includes(p.activity)) result.push("随意走走");
  if (["exhibition","architecture","concert","opera","musical","drama","jazz"].includes(p.activity)) result.push("专注文化体验");
  return result;
}

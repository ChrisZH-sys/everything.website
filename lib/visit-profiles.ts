export type Activity = "architecture" | "exhibition" | "snack" | "cafe" | "park" | "browse" | "reading" | "meal" | "concert" | "opera" | "musical" | "drama" | "jazz" | "bar" | "records" | "film";
export type VisitProfile = {
  minutes: [number, number]; activity: Activity; setting: "室内为主" | "户外为主" | "室内外结合";
  conversation: "可交流" | "轻声交流" | "以专注观看为主";
  participation: string; booking: string; cluster: string; evening: boolean;
  adultExperience: boolean; basis: "编辑建议";
};
export const activityLabels: Record<Activity, string> = {
  architecture: "观察建筑", exhibition: "主题看展", snack: "简餐补给", cafe: "饮品与小坐",
  park: "公园慢走", browse: "街区浏览", reading: "阅读与选书", meal: "坐下来用餐",
  concert: "听交响音乐", opera: "看歌剧", musical: "看音乐剧", drama: "看舞台或放映",
  jazz: "听爵士现场", bar: "晚间调酒", records: "挑选唱片", film: "一起看电影",
};
// All ranges and experience classifications are editorial, not measured visits.
// No noise, available seating, current opening, prices or booking facts are inferred.
const annotations: Record<number, [number, number, Activity]> = {
  "1": [
    30,
    60,
    "architecture"
  ],
  "5": [
    120,
    120,
    "concert"
  ],
  "6": [
    30,
    60,
    "park"
  ],
  "101": [
    45,
    60,
    "exhibition"
  ],
  "102": [
    30,
    60,
    "snack"
  ],
  "103": [
    30,
    60,
    "cafe"
  ],
  "104": [
    45,
    60,
    "exhibition"
  ],
  "105": [
    15,
    30,
    "browse"
  ],
  "106": [
    30,
    60,
    "browse"
  ],
  "107": [
    60,
    120,
    "reading"
  ],
  "108": [
    120,
    120,
    "opera"
  ],
  "109": [
    120,
    120,
    "musical"
  ],
  "110": [
    120,
    120,
    "drama"
  ],
  "111": [
    45,
    90,
    "park"
  ],
  "112": [
    30,
    60,
    "reading"
  ],
  "113": [
    30,
    60,
    "reading"
  ],
  "114": [
    45,
    60,
    "reading"
  ],
  "115": [
    30,
    60,
    "reading"
  ],
  "116": [
    30,
    45,
    "cafe"
  ],
  "117": [
    30,
    45,
    "cafe"
  ],
  "118": [
    30,
    45,
    "snack"
  ],
  "119": [
    60,
    90,
    "meal"
  ],
  "120": [
    45,
    75,
    "meal"
  ],
  "121": [
    30,
    45,
    "snack"
  ],
  "122": [
    30,
    45,
    "snack"
  ],
  "123": [
    30,
    45,
    "snack"
  ],
  "124": [
    60,
    90,
    "exhibition"
  ],
  "125": [
    60,
    90,
    "exhibition"
  ],
  "126": [
    60,
    90,
    "exhibition"
  ],
  "127": [
    60,
    90,
    "exhibition"
  ],
  "201": [
    60,
    120,
    "meal"
  ],
  "202": [
    60,
    90,
    "meal"
  ],
  "203": [
    60,
    120,
    "meal"
  ],
  "204": [
    60,
    90,
    "meal"
  ],
  "205": [
    30,
    60,
    "cafe"
  ],
  "206": [
    30,
    60,
    "cafe"
  ],
  "207": [
    45,
    90,
    "cafe"
  ],
  "208": [
    30,
    45,
    "cafe"
  ],
  "209": [
    45,
    90,
    "cafe"
  ],
  "210": [
    45,
    60,
    "exhibition"
  ],
  "211": [
    20,
    40,
    "browse"
  ],
  "212": [
    30,
    60,
    "browse"
  ],
  "213": [
    90,
    150,
    "jazz"
  ],
  "214": [
    60,
    120,
    "meal"
  ],
  "215": [
    60,
    120,
    "bar"
  ],
  "216": [
    30,
    60,
    "records"
  ],
  "217": [
    45,
    90,
    "reading"
  ],
  "218": [
    100,
    160,
    "film"
  ],
  "219": [
    100,
    180,
    "film"
  ],
  "220": [
    100,
    180,
    "drama"
  ],
  "221": [
    100,
    160,
    "film"
  ],
  "222": [
    45,
    90,
    "park"
  ],
  "223": [
    20,
    45,
    "park"
  ],
  "224": [
    60,
    120,
    "browse"
  ],
  "225": [
    45,
    90,
    "browse"
  ],
  "226": [
    60,
    90,
    "exhibition"
  ],
  "227": [
    45,
    90,
    "exhibition"
  ],
  "228": [
    60,
    90,
    "exhibition"
  ],
  "229": [
    45,
    90,
    "meal"
  ],
  "230": [
    45,
    60,
    "exhibition"
  ]
};
const scheduled = new Set<Activity>(["concert", "opera", "musical", "drama", "jazz", "film"]);
const clusters: Record<number, string> = {
  103: "wukang-courtyard", 106: "wukang-courtyard", 201: "wukang-courtyard", 202: "wukang-courtyard",
  203: "hengshan199", 204: "hengshan199", 211: "hengshan8", 213: "hengshan8",
};
export function visitFor(place: { id: number }): VisitProfile {
  const row = annotations[place.id];
  if (!row) throw new Error("Missing visit profile: " + place.id);
  const [min, max, activity] = row;
  const ticketed = scheduled.has(activity);
  const quiet = ["exhibition", "reading", "records"].includes(activity);
  const outside = ["architecture", "park"].includes(activity);
  return {
    minutes: [min, max], activity,
    setting: outside ? "户外为主" : activity === "browse" ? "室内外结合" : "室内为主",
    conversation: ticketed ? "以专注观看为主" : quiet ? "轻声交流" : "可交流",
    participation: ticketed ? "先选节目，观看时需遵守场内礼仪"
      : quiet ? "自主观看或翻阅；聊天与座位条件需现场确认"
      : ["meal", "cafe", "snack", "bar"].includes(activity) ? "消费型停留；座位、菜单与消费条件需向店家确认"
      : "按自己的节奏浏览；开放区域以现场为准",
    booking: ticketed ? "需查当天场次、时长、余票与入场要求" : "预约或订位要求待确认；请结合下方提醒查阅来源",
    cluster: clusters[place.id] ?? String(place.id),
    evening: [213, 214, 215].includes(place.id),
    adultExperience: [213, 215].includes(place.id),
    basis: "编辑建议",
  };
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


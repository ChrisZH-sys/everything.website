export type Category = "吃" | "喝" | "玩" | "看" | "逛";
export type Source = { title: string; url: string; date?: string };
export type Place = {
  id: number; name: string; category: Category; type: string; area: string;
  address: string; duration: string; walking: string;
  moods: string[]; tags: string[]; why: string; watchout: string;
  opening: string; cost: string; sources: Source[]; checkedAt: string;
};

export const ALL_AREAS = "衡复及周边";
// Browsing groups, not administrative boundaries or distance-based searches.
export const areas = [ALL_AREAS, "武康—衡山", "复兴—淮海", "思南—瑞金"];
export const checkedAt = "2026-09-11";
const gov = (title: string, path: string, date?: string): Source => ({
  title: `上海市政府国际服务门户｜${title}`, url: `https://english.shanghai.gov.cn/${path}`, date,
});
const wiki = (title: string): Source => ({ title: `维基百科｜${title}（基础资料）`, url: `https://zh.wikipedia.org/wiki/${title}` });
const wukang = gov("武康路建筑导览", "en-ScenicSpots/20231218/596192f5f59048bbbc3fa54d92304e93.html", "2025-08-14");
const brands = gov("上海老字号门店导览", "en-TimeHonored-travelinshanghai/20240523/56f24344b37443478f9aa0ed281a1a61.html", "2024-05-23");
const noodles = gov("黄浦面馆导览", "en-TimeHonored-travelinshanghai/20250414/e62a71db9da54e6fbfecadadcb0dbeff.html", "2025-04-14");
const books = gov("特色书店导览", "en-BookstoresLibraries/20260422/c2ff0ece50d940838a35422c9629e311.html", "2026-04-22");
const sinan = gov("思南书局", "en-BookstoresLibraries/20231221/8576791e48014165a74d8be2d17640b6.html", "2025-08-19");

type PlaceInput = Omit<Place, "checkedAt" | "opening" | "cost" | "walking"> & Partial<Pick<Place, "opening" | "cost" | "walking">>;
function place(input: PlaceInput): Place {
  return {
    checkedAt,
    opening: "当天开放或营业时间未核实；出发前查看场馆、门店公告。",
    cost: "当前费用未核实；以现场菜单或官方票务为准。",
    walking: "活动量参考：室内为主",
    ...input,
  };
}

// IDs 1, 5, 6 retain the original real-place identities. Retired sample IDs
// 2, 3, 4 must never be reassigned, to avoid changing users' saved-place meaning.
// Names and addresses below are source facts; moods, tags, visit ideas and
// suggested durations are editorial annotations, not on-site verification.
export const places: Place[] = [
  place({ id: 1, name: "武康大楼", category: "看", type: "建筑 · 城市观察", area: "武康—衡山",
    address: "淮海中路1842—1858号，武康路口", duration: "建议30–60分钟", walking: "活动量参考：户外短停留",
    moods: ["有故事", "松弛"], tags: ["海派建筑", "建筑外观", "街角观察"],
    why: "从街角观察武康大楼的立面，把建筑细节作为这次散步的主题。", watchout: "建筑含居民住宅；请在公共区域观看，不进入住宅门厅。",
    cost: "公共街道观看外观无需门票；楼内商户消费另计。", sources: [wiki("武康大楼")] }),
  place({ id: 101, name: "衡复风貌馆", category: "看", type: "展馆 · 街区历史", area: "复兴—淮海",
    address: "复兴西路62号（修道院公寓）", duration: "建议45–60分钟", moods: ["有故事", "小众"], tags: ["街区历史", "老建筑", "展馆"],
    why: "把风貌馆作为了解衡复街区历史的入口，再带着线索去看周边建筑。", watchout: "基础资料确认场馆身份；当前展览、预约方式与开放状态待复核。", sources: [wiki("修道院公寓")] }),
  place({ id: 102, name: "乔家栅（襄阳南路店）", category: "吃", type: "老字号 · 中式点心", area: "复兴—淮海",
    address: "襄阳南路313号", duration: "建议30–60分钟", moods: ["有故事", "热闹"], tags: ["中式点心", "老字号", "八宝饭"],
    why: "用一份中式点心安排街区散步中的补给。", watchout: "来源为2024年门店介绍；具体品种、堂食安排与营业状态请先确认。", sources: [brands] }),
  place({ id: 103, name: "% Arabica（武康路店）", category: "喝", type: "咖啡 · 庭院", area: "武康—衡山",
    address: "武康路374号武康庭1层112室", duration: "建议30–60分钟", moods: ["松弛", "热闹"], tags: ["咖啡", "武康庭", "散步补给"],
    why: "在武康庭喝杯咖啡，为散步留一段休息时间。", watchout: "有无空座、是否排队需到店确认；不保证庭院座位。",
    opening: "品牌门店页列每日09:00–20:00；临时调整以门店公告为准。",
    sources: [{ title: "% Arabica｜Wukang Lu 官方门店页", url: "https://arabicacoffee.hk/locations/arabica-shanghai-wukang-lu" }] }),
  place({ id: 5, name: "上海交响乐团音乐厅", category: "玩", type: "演出 · 音乐", area: "复兴—淮海",
    address: "复兴中路1380号", duration: "建议预留约2小时，以场次为准", moods: ["有故事", "小众"], tags: ["交响乐", "音乐厅", "需看排期"],
    why: "先选一场想听的音乐会，再围绕开场时间安排用餐与散步。", watchout: "是否有演出、余票及入场要求均需查看当期公告。",
    opening: "按演出及活动排期开放；未核实当日场次。", sources: [gov("上海交响乐团音乐厅", "en-Theaters/20231207/8ad4b1623f6b4db3bec4e941cffbcf28.html", "2025-11-25"), wiki("上海交响乐团音乐厅")] }),
  place({ id: 6, name: "衡山公园", category: "逛", type: "公园 · 绿地", area: "武康—衡山",
    address: "广元路、衡山路、宛平路交会处（入口请现场确认）", duration: "建议30–60分钟", walking: "活动量参考：户外慢走",
    moods: ["松弛", "小众"], tags: ["树木", "绿地", "慢节奏"], why: "沿园内绿地慢走，给行程留一段不赶时间的空白。", watchout: "天气与园内维护会影响体验；入口及当天开放时间待复核。",
    sources: [gov("衡山公园", "en-Parks/20250422/ae6cfbf984bb4657a2355aa8809ebcc3.html", "2025-10-22"), wiki("衡山公园")] }),
  place({ id: 104, name: "巴金故居", category: "看", type: "故居 · 文学", area: "武康—衡山", address: "武康路113号", duration: "建议45–60分钟",
    moods: ["有故事", "小众"], tags: ["文学", "故居", "武康路"], why: "从作家的生活空间出发，把文学加入建筑散步。", watchout: "请先确认预约及开放要求，再安排入内参观。", sources: [wukang] }),
  place({ id: 105, name: "武康路旅游咨询中心", category: "逛", type: "旅游咨询 · 街区入口", area: "武康—衡山", address: "武康路393号", duration: "建议15–30分钟",
    moods: ["有故事", "松弛"], tags: ["街区信息", "散步起点", "旅游咨询"], why: "散步前先了解街区信息，也可以把这里当作集合点。", watchout: "咨询服务时间和现场资料供应请向中心确认。", sources: [wukang] }),
  place({ id: 106, name: "武康庭", category: "逛", type: "商业庭院 · 街区", area: "武康—衡山", address: "武康路376号（导览所列地址）", duration: "建议30–60分钟", walking: "活动量参考：庭院短走",
    moods: ["松弛", "热闹"], tags: ["庭院", "街区商业", "随意逛逛"], why: "把庭院作为街道散步中的一个停顿，随意看看店铺。", watchout: "这是商业空间；各店开放时间、入口和消费规则分别确认。", sources: [wukang] }),
  place({ id: 107, name: "上海图书馆（淮海中路馆）", category: "逛", type: "图书馆 · 阅读", area: "复兴—淮海", address: "淮海中路1555号", duration: "建议60–120分钟",
    moods: ["松弛", "小众"], tags: ["阅读", "室内", "图书馆"], why: "带着一个阅读主题来，在行程中安排一段专心看书的时间。", watchout: "入馆、阅览及借阅可能适用不同规则；请查阅本馆公告。",
    sources: [gov("上海图书馆", "en-BookstoresLibraries/20231228/7c3aeb2c2502456d8f79c6226ace0478.html", "2025-08-19")] }),
  place({ id: 108, name: "上音歌剧院", category: "玩", type: "演出 · 歌剧", area: "复兴—淮海", address: "淮海中路与汾阳路路口（入场入口以票面为准）", duration: "建议预留约2小时，以场次为准",
    moods: ["有故事", "小众"], tags: ["歌剧", "音乐", "需看排期"], why: "如果想为一天设置一个主活动，可以先从歌剧或音乐演出的节目单挑起。", watchout: "参观与购票观演规则不同；不可根据历史介绍直接进入。",
    sources: [gov("上音歌剧院", "en-Theaters/20231222/5b695627676e47f79e56dd256399f228.html", "2025-11-25"), wiki("上音歌剧院")] }),
  place({ id: 109, name: "上海文化广场", category: "玩", type: "演出 · 音乐剧", area: "思南—瑞金", address: "复兴中路597号", duration: "建议预留约2小时，以场次为准",
    moods: ["有故事", "热闹"], tags: ["音乐剧", "剧场", "需看排期"], why: "用一场音乐剧作为行程的重点，前后再留出休息与用餐时间。", watchout: "核对具体剧场、开演时间和票务；演出总时长可能超过2小时。",
    sources: [gov("上海文化广场", "en-Theaters/20231227/6ee7bd2d539d4e66914223a3e7e82406.html", "2025-11-25")] }),
  place({ id: 110, name: "上海话剧艺术中心", category: "玩", type: "演出 · 话剧", area: "武康—衡山", address: "安福路288号", duration: "建议预留约2小时，以场次为准",
    moods: ["有故事", "小众"], tags: ["话剧", "安福路", "需看排期"], why: "从想看的故事出发选择话剧，观演后再和同行的人聊聊感受。", watchout: "所列报道为历史介绍；当前排期、具体剧场及日间开放需复核。",
    sources: [{ title: "中国新闻网｜探访上海话剧艺术中心", url: "https://www.chinanews.com.cn/m/sh/shipin/cns/2019/04-10/news811083.shtml", date: "2019-04-10" }, { title: "维基百科｜Shanghai Dramatic Arts Centre（地址）", url: "https://en.wikipedia.org/wiki/Shanghai_Dramatic_Arts_Centre" }] }),
  place({ id: 111, name: "复兴公园", category: "逛", type: "公园 · 园林", area: "思南—瑞金", address: "雁荡路105号", duration: "建议45–90分钟", walking: "活动量参考：户外慢走",
    moods: ["松弛", "热闹"], tags: ["园林", "绿地", "户外"], why: "沿园路看看花坛与树木，把公园作为城市散步的缓冲段。", watchout: "临时维护、天气和活动可能改变开放安排。",
    opening: "政府导览列每日05:00–21:00（2025年更新）；当天调整请复核。", cost: "政府导览列免费入园；特殊活动另查。",
    sources: [gov("复兴公园", "en-Parks/20250220/636b3df5761e4055b731a92d2abddcb3.html", "2025-12-30")] }),
  place({ id: 112, name: "牧云记书店（黑石公寓）", category: "逛", type: "书店 · 老建筑", area: "复兴—淮海", address: "复兴中路1331号101室", duration: "建议30–60分钟",
    moods: ["松弛", "有故事"], tags: ["书店", "黑石公寓", "阅读"], why: "逛书店时也留意建筑空间，把阅读和街区观察连在一起。", watchout: "按2026年导览使用现有书店名称；活动及营业时间请向门店确认。", sources: [books] }),
  place({ id: 113, name: "Paper Moon书店（天平路店）", category: "逛", type: "书店 · 女性主题", area: "武康—衡山", address: "天平路86号", duration: "建议30–60分钟",
    moods: ["小众", "有故事"], tags: ["主题书店", "女性阅读", "天平路"], why: "从女性主题选书出发，尝试平常书单之外的阅读方向。", watchout: "书店活动和可用空间可能变化；请先确认营业安排。", sources: [books] }),
  place({ id: 114, name: "思南书局（复兴中路店）", category: "逛", type: "书店 · 人文阅读", area: "思南—瑞金", address: "复兴中路517号", duration: "建议45–60分钟",
    moods: ["松弛", "有故事"], tags: ["人文书籍", "书店", "思南街区"], why: "从文学或历史书架挑一个主题，再去周边街区寻找呼应。", watchout: "与皋兰路诗歌店是两个地点；请核对所选门店。", sources: [sinan] }),
  place({ id: 115, name: "思南书局·诗歌店", category: "逛", type: "书店 · 诗歌", area: "思南—瑞金", address: "皋兰路16号", duration: "建议30–60分钟",
    moods: ["小众", "有故事"], tags: ["诗歌", "历史建筑", "主题阅读"], why: "留一段只读几首诗的时间，观察书店与历史建筑的空间关系。", watchout: "展陈、活动和入内规则请查阅书店当期公告。", sources: [sinan] }),
  place({ id: 116, name: "乔咖啡·邮局店", category: "喝", type: "咖啡 · 邮局空间", area: "武康—衡山", address: "淮海中路1883号", duration: "建议30–45分钟",
    moods: ["有故事", "热闹"], tags: ["咖啡", "邮局", "街区补给"], why: "在建筑散步中安排一杯咖啡，看看邮局空间。", watchout: "门店资料来自2024年；邮政业务与咖啡营业时间需分别确认。", sources: [brands] }),
  place({ id: 117, name: "乔咖啡·淮海店", category: "喝", type: "咖啡 · 中式点心", area: "复兴—淮海", address: "淮海中路1314号", duration: "建议30–45分钟",
    moods: ["松弛", "有故事"], tags: ["咖啡", "点心", "淮海中路"], why: "试试咖啡搭配中式点心，作为淮海路散步中的休息。", watchout: "与1883号邮局店地址不同；2024年资料中的营业情况需复核。", sources: [brands] }),
  place({ id: 118, name: "上海第二食品商店（淮海中路旗舰店）", category: "逛", type: "老字号 · 食品零售", area: "复兴—淮海", address: "淮海中路1000号", duration: "建议30–45分钟",
    moods: ["有故事", "热闹"], tags: ["食品零售", "伴手礼", "老字号"], why: "看看传统食品货架，为带回家的伴手礼找些想法。", watchout: "门店介绍为2024年资料；在售品种和价格以现场为准。", sources: [brands] }),
  place({ id: 119, name: "新利查西菜馆（广元路店）", category: "吃", type: "老字号 · 海派西餐", area: "武康—衡山", address: "广元路196号", duration: "建议60–90分钟",
    moods: ["有故事", "松弛"], tags: ["海派西餐", "咖喱鸡", "老字号"], why: "用一顿海派西餐，为这次街区探索换个口味。", watchout: "来源列英文名Richard Restaurant；门店菜单、座位和2024年后营业变化待确认。", sources: [brands] }),
  place({ id: 120, name: "老仁和（淮海中路店）", category: "吃", type: "老字号 · 本帮风味", area: "思南—瑞金", address: "淮海中路558号", duration: "建议45–75分钟",
    moods: ["有故事", "热闹"], tags: ["糟味", "本帮风味", "老字号"], why: "对上海糟味感兴趣时，可以从这里的菜单开始了解。", watchout: "具体菜品、堂食与营业时间以门店当日信息为准。",
    sources: [gov("老仁和", "en-TimeHonored-travelinshanghai/20260511/87fa3e8c551a47aabd5f2cbe370bb606.html", "2026-05-11")] }),
  place({ id: 121, name: "味香斋（雁荡路店）", category: "吃", type: "面馆 · 麻酱拌面", area: "思南—瑞金", address: "雁荡路14号", duration: "建议30–45分钟",
    moods: ["有故事", "热闹"], tags: ["麻酱拌面", "面馆", "本地风味"], why: "用一碗麻酱拌面安排散步中的一顿简餐。", watchout: "餐食涉及芝麻、花生等原料；有饮食限制请向店员询问。", sources: [noodles] }),
  place({ id: 122, name: "春园四如春（重庆南路店）", category: "吃", type: "面馆 · 上海面食", area: "思南—瑞金", address: "重庆南路183号", duration: "建议30–45分钟",
    moods: ["有故事", "松弛"], tags: ["面食", "冷面", "黄鱼面"], why: "从传统面食中选一碗自己喜欢的浇头，留意季节菜单。", watchout: "来源列英文名Chunyuan Siruchun；冷面及黄鱼面的供应以当日菜单为准。", sources: [noodles] }),
  place({ id: 123, name: "东泰祥（重庆北路店）", category: "吃", type: "生煎 · 面馆", area: "思南—瑞金", address: "重庆北路188号", duration: "建议30–45分钟",
    moods: ["热闹", "有故事"], tags: ["生煎", "辣肉面", "上海小吃"], why: "想吃生煎或一碗面时，可把这里作为小吃候选。", watchout: "位于本次覆盖范围东侧；请单独确认交通、菜单和营业时间。", sources: [noodles] }),
  place({ id: 124, name: "上海宋庆龄故居纪念馆", category: "看", type: "纪念馆 · 历史", area: "武康—衡山", address: "淮海中路1843号", duration: "建议60–90分钟",
    moods: ["有故事", "小众"], tags: ["人物历史", "故居", "纪念馆"], why: "围绕人物经历看展，让淮海路上的建筑有更具体的历史线索。", watchout: "当前预约、开放日期及票价尚未核实；请查阅纪念馆公告。", sources: [wiki("上海宋庆龄故居")] }),
  place({ id: 125, name: "上海孙中山故居纪念馆", category: "看", type: "纪念馆 · 近代史", area: "思南—瑞金", address: "香山路7号", duration: "建议60–90分钟",
    moods: ["有故事", "小众"], tags: ["近代史", "故居", "纪念馆"], why: "把人物历史作为思南街区散步的主题，参观后再回到周边街道。", watchout: "提前确认开放、预约与入场要求；基础资料不代表当天可入馆。", sources: [wiki("上海孙中山故居")] }),
  place({ id: 126, name: "上海工艺美术博物馆", category: "看", type: "博物馆 · 工艺", area: "复兴—淮海", address: "汾阳路79号", duration: "建议60–90分钟",
    moods: ["有故事", "小众"], tags: ["工艺美术", "雕刻", "织绣"], why: "以材料和手工技艺为线索看展，慢慢观察作品细节。", watchout: "当期展品、临时闭馆和票务安排尚未确认。", sources: [wiki("上海工艺美术博物馆")] }),
  place({ id: 127, name: "上海琉璃艺术博物馆", category: "看", type: "博物馆 · 琉璃艺术", area: "思南—瑞金", address: "泰康路25号", duration: "建议60–90分钟",
    moods: ["小众", "有故事"], tags: ["琉璃", "艺术", "材料之美"], why: "关注琉璃的颜色、光线与形态，尝试一种以材料为主题的看展方式。", watchout: "当期展览、门票、拍摄规定和营业状态请先向馆方确认。", sources: [wiki("上海琉璃艺术博物馆")] }),
];

export function validSavedIds(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id): id is number =>
    typeof id === "number" && places.some((p) => p.id === id)))];
}

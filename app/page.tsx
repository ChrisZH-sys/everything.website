"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bookmark,
  Check,
  ChevronDown,
  Clock3,
  Compass,
  Footprints,
  Heart,
  LocateFixed,
  MapPin,
  Navigation,
  Search,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Place = {
  id: number;
  name: string;
  category: "吃" | "喝" | "玩" | "看" | "逛";
  type: string;
  area: string;
  duration: string;
  walking: string;
  baseMatch: number;
  moods: string[];
  tags: string[];
  why: string;
  watchout: string;
  x: number;
  y: number;
  color: string;
};

const places: Place[] = [
  {
    id: 1,
    name: "武康大楼与街角观察点",
    category: "看",
    type: "建筑 · 城市观察",
    area: "衡复样板区",
    duration: "30–60分钟",
    walking: "步行友好",
    baseMatch: 96,
    moods: ["有故事", "松弛"],
    tags: ["海派建筑", "适合独处", "免费"],
    why: "与你偏好的“有故事、可慢慢看”高度一致，适合作为散步起点。",
    watchout: "周末午后人流较集中。",
    x: 30,
    y: 31,
    color: "#d9593f",
  },
  {
    id: 2,
    name: "复兴西路安静散步段",
    category: "逛",
    type: "街区 · City Walk",
    area: "衡复样板区",
    duration: "60–90分钟",
    walking: "约2.4公里",
    baseMatch: 93,
    moods: ["松弛", "小众"],
    tags: ["梧桐街区", "低商业感", "慢节奏"],
    why: "商业密度较低，适合在没有明确目的时随意走走。",
    watchout: "沿途休息点分布不均。",
    x: 46,
    y: 48,
    color: "#247167",
  },
  {
    id: 3,
    name: "湖南路社区小馆样本",
    category: "吃",
    type: "社区餐饮 · 样本",
    area: "衡复样板区",
    duration: "60–90分钟",
    walking: "距散步段8分钟",
    baseMatch: 91,
    moods: ["松弛", "有故事"],
    tags: ["本地口味", "社区感", "人均适中"],
    why: "更接近日常生活，适合希望避开热门榜单的用餐场景。",
    watchout: "样板数据，上线前需完成商户核验。",
    x: 53,
    y: 35,
    color: "#d99a32",
  },
  {
    id: 4,
    name: "永康路咖啡休息点样本",
    category: "喝",
    type: "咖啡 · 样本",
    area: "衡复样板区",
    duration: "45–75分钟",
    walking: "距地铁约9分钟",
    baseMatch: 88,
    moods: ["热闹", "松弛"],
    tags: ["街边座位", "适合聊天", "下午"],
    why: "适合把半日路线拆成两段，在中途留出一段不赶时间的停顿。",
    watchout: "临街座位可能较嘈杂。",
    x: 68,
    y: 58,
    color: "#8c664d",
  },
  {
    id: 5,
    name: "上海交响乐团音乐厅",
    category: "玩",
    type: "演出 · 建筑",
    area: "衡复样板区",
    duration: "约2小时",
    walking: "室内为主",
    baseMatch: 89,
    moods: ["有故事", "小众"],
    tags: ["夜间", "音乐", "需看排期"],
    why: "适合作为晚间主活动，与附近用餐或散步自然衔接。",
    watchout: "演出与开放信息请以官方渠道为准。",
    x: 73,
    y: 29,
    color: "#7d5aa6",
  },
  {
    id: 6,
    name: "衡山公园慢停留点",
    category: "逛",
    type: "公园 · 休息",
    area: "衡复样板区",
    duration: "30–60分钟",
    walking: "低活动量",
    baseMatch: 86,
    moods: ["松弛", "小众"],
    tags: ["绿地", "免费", "家人友好"],
    why: "适合降低路线密度，也适合作为带家人出行时的缓冲点。",
    watchout: "体验受天气影响较大。",
    x: 38,
    y: 71,
    color: "#568056",
  },
];

const categories = ["全部", "吃", "喝", "玩", "看", "逛"];
const moods = ["松弛", "小众", "有故事", "热闹"];
const companions = ["一个人", "两个人", "朋友", "家人"];
const durations = ["2小时", "半天", "一天"];

export default function Home() {
  const [category, setCategory] = useState("全部");
  const [mood, setMood] = useState("松弛");
  const [companion, setCompanion] = useState("一个人");
  const [duration, setDuration] = useState("半天");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(1);
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem("shanghai-guide-saved");
    if (raw) {
      try {
        setSavedIds(JSON.parse(raw));
      } catch {
        setSavedIds([]);
      }
    }
  }, []);

  const rankedPlaces = useMemo(() => {
    return places
      .filter((place) => category === "全部" || place.category === category)
      .filter((place) => !showSavedOnly || savedIds.includes(place.id))
      .filter((place) => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return true;
        return [place.name, place.category, place.type, ...place.tags]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      })
      .map((place) => ({
        ...place,
        match: Math.min(
          99,
          place.baseMatch +
            (place.moods.includes(mood) ? 3 : -2) +
            (duration === "2小时" && place.duration.includes("2小时") ? 2 : 0)
        ),
      }))
      .sort((a, b) => b.match - a.match);
  }, [category, duration, mood, query, savedIds, showSavedOnly]);

  const activePlace =
    places.find((place) => place.id === activeId) ?? rankedPlaces[0] ?? places[0];

  function toggleSaved(id: number) {
    setSavedIds((current) => {
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];
      window.localStorage.setItem(
        "shanghai-guide-saved",
        JSON.stringify(next)
      );
      return next;
    });
  }

  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="吃喝玩乐全攻略首页">
          <span className="brand-mark">沪</span>
          <span>
            <strong>吃喝玩乐全攻略</strong>
            <small>SHANGHAI · BETA</small>
          </span>
        </a>

        <nav className="top-actions" aria-label="网站导航">
          <button
            className={showSavedOnly ? "nav-button active" : "nav-button"}
            onClick={() => setShowSavedOnly((value) => !value)}
            type="button"
          >
            <Bookmark />
            已收藏
            {savedIds.length > 0 && <span>{savedIds.length}</span>}
          </button>
          <button
            className="profile-button"
            onClick={() => setProfileOpen(true)}
            type="button"
          >
            <span className="profile-dot">C</span>
            <span className="profile-copy">
              <small>我的偏好</small>
              <strong>松弛探索型</strong>
            </span>
            <ChevronDown />
          </button>
        </nav>
      </header>

      <section className="brief-panel" id="top">
        <div className="brief-heading">
          <Badge className="beta-badge">上海试点 · 首版示例数据</Badge>
          <h1>今天想在上海怎么过？</h1>
          <p>先说当下的状态，我们再缩小到真正适合你的选择。</p>
        </div>

        <div className="brief-controls">
          <div className="search-control">
            <Search aria-hidden="true" />
            <input
              aria-label="搜索地点、街区或体验"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜地点、街区，或输入“安静地走走”"
              type="search"
              value={query}
            />
            <button type="button" aria-label="使用当前位置">
              <LocateFixed />
            </button>
          </div>

          <div className="context-control">
            <MapPin />
            <span>
              <small>范围</small>
              <strong>衡复样板区</strong>
            </span>
            <ChevronDown />
          </div>
          <div className="context-control">
            <Clock3 />
            <span>
              <small>时间</small>
              <strong>{duration}</strong>
            </span>
            <ChevronDown />
          </div>
          <div className="context-control">
            <Users />
            <span>
              <small>同行</small>
              <strong>{companion}</strong>
            </span>
            <ChevronDown />
          </div>
        </div>

        <div className="quick-row">
          <div className="quick-group" aria-label="时间选择">
            <span>有多久</span>
            {durations.map((item) => (
              <button
                className={duration === item ? "chip selected" : "chip"}
                key={item}
                onClick={() => setDuration(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
          <div className="quick-group" aria-label="同行人选择">
            <span>和谁</span>
            {companions.map((item) => (
              <button
                className={companion === item ? "chip selected" : "chip"}
                key={item}
                onClick={() => setCompanion(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
          <div className="quick-group" aria-label="心情选择">
            <span>想要</span>
            {moods.map((item) => (
              <button
                className={mood === item ? "chip selected" : "chip"}
                key={item}
                onClick={() => setMood(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="discovery-toolbar">
        <div className="category-tabs" aria-label="地点分类">
          {categories.map((item) => (
            <button
              className={category === item ? "category active" : "category"}
              key={item}
              onClick={() => setCategory(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
        <div className="toolbar-status">
          <span className="live-dot" />
          按“{mood} · {duration} · {companion}”重新排序
          <Button
            className="filter-button"
            onClick={() => setProfileOpen(true)}
            size="sm"
            variant="outline"
          >
            <SlidersHorizontal />
            调整偏好
          </Button>
        </div>
      </section>

      <section className="workspace" aria-label="上海地点发现">
        <div className="map-panel">
          <div className="map-toolbar">
            <div>
              <strong>衡复—淮海样板区</strong>
              <span>已深度标注 6 个首版样本</span>
            </div>
            <button type="button">
              <Navigation />
              回到样板区
            </button>
          </div>

          <div className="schematic-map" aria-label="衡复样板区示意地图">
            <svg
              aria-hidden="true"
              className="street-grid"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
            >
              <path d="M-8 21 C18 18, 31 25, 108 18" />
              <path d="M-5 63 C22 58, 52 68, 107 57" />
              <path d="M5 82 C37 73, 69 86, 105 76" />
              <path d="M21 -5 C18 24, 30 56, 24 105" />
              <path d="M58 -4 C54 29, 64 66, 58 103" />
              <path d="M84 -5 C76 32, 88 57, 81 105" />
              <path className="minor" d="M-4 42 C20 45, 63 37, 105 43" />
              <path className="minor" d="M41 -4 C38 31, 44 71, 39 104" />
              <path className="minor" d="M70 -3 C68 25, 73 69, 72 103" />
            </svg>
            <div className="sample-boundary" />
            <span className="road-label north">延安中路</span>
            <span className="road-label south">肇嘉浜路</span>
            <span className="road-label west">华山路</span>
            <span className="road-label east">瑞金二路</span>
            <span className="area-label">
              <small>HIGH-CONFIDENCE AREA</small>
              衡复深度样板区
            </span>

            {places.map((place) => (
              <button
                aria-label={"查看" + place.name}
                className={
                  activePlace.id === place.id
                    ? "map-marker active"
                    : "map-marker"
                }
                key={place.id}
                onClick={() => setActiveId(place.id)}
                style={{
                  left: String(place.x) + "%",
                  top: String(place.y) + "%",
                  "--marker-color": place.color,
                } as React.CSSProperties}
                type="button"
              >
                <span>{place.id}</span>
              </button>
            ))}

            <div className="map-note">
              <Sparkles />
              <span>
                <strong>为什么从这里开始</strong>
                地点密集、体验差异大，适合校准“好”的不同定义。
              </span>
            </div>

            <Card className="map-preview">
              <CardHeader>
                <Badge variant="outline">{activePlace.type}</Badge>
                <CardTitle>{activePlace.name}</CardTitle>
                <CardDescription>{activePlace.area}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{activePlace.why}</p>
              </CardContent>
              <CardFooter>
                <Button size="sm">
                  查看推荐理由
                  <ArrowRight />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        <aside className="results-panel">
          <div className="results-heading">
            <div>
              <span>为你重新排序</span>
              <h2>{showSavedOnly ? "已收藏的地点" : "此刻更适合你的去处"}</h2>
            </div>
            <span className="result-count">{rankedPlaces.length} 个结果</span>
          </div>

          <div className="results-list">
            {rankedPlaces.length === 0 ? (
              <div className="empty-state">
                <Compass />
                <h3>暂时没有符合条件的地点</h3>
                <p>换一个分类，或者取消“只看收藏”。</p>
                <Button
                  onClick={() => {
                    setCategory("全部");
                    setShowSavedOnly(false);
                    setQuery("");
                  }}
                  variant="outline"
                >
                  查看全部
                </Button>
              </div>
            ) : (
              rankedPlaces.map((place, index) => (
                <article
                  className={
                    activePlace.id === place.id
                      ? "place-card active"
                      : "place-card"
                  }
                  key={place.id}
                  onClick={() => setActiveId(place.id)}
                >
                  <div className="place-rank">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div
                      className="match-ring"
                      style={{
                        "--match": String(place.match * 3.6) + "deg",
                      } as React.CSSProperties}
                    >
                      <strong>{place.match}</strong>
                      <small>%</small>
                    </div>
                  </div>

                  <div className="place-copy">
                    <div className="place-meta">
                      <Badge variant="secondary">{place.category}</Badge>
                      <span>{place.type}</span>
                    </div>
                    <h3>{place.name}</h3>
                    <p className="why-copy">
                      <Sparkles />
                      {place.why}
                    </p>
                    <div className="tag-row">
                      {place.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                    <div className="place-facts">
                      <span>
                        <Clock3 />
                        {place.duration}
                      </span>
                      <span>
                        <Footprints />
                        {place.walking}
                      </span>
                    </div>
                    <p className="watchout">留意：{place.watchout}</p>
                  </div>

                  <button
                    aria-label={
                      savedIds.includes(place.id)
                        ? "取消收藏" + place.name
                        : "收藏" + place.name
                    }
                    className={
                      savedIds.includes(place.id)
                        ? "save-button saved"
                        : "save-button"
                    }
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleSaved(place.id);
                    }}
                    type="button"
                  >
                    <Heart />
                  </button>
                </article>
              ))
            )}
          </div>

          <div className="confidence-note">
            <Check />
            <span>
              <strong>首版数据说明</strong>
              公共地点用于展示产品逻辑；餐饮与咖啡样本将在正式开放前完成人工核验。
            </span>
          </div>
        </aside>
      </section>

      <section className="concept-section">
        <div className="concept-image">
          <img alt="吃喝玩乐全攻略上海试点品牌视觉" src="/og.png" />
        </div>
        <div className="concept-copy">
          <Badge className="beta-badge">推荐会随着你而变化</Badge>
          <h2>你每次说“不合适”，都比再看一份榜单更有价值。</h2>
          <p>
            首版会记录收藏与选择偏好。后续加入“不想排队”“今天不想走太多”“太网红”等原因反馈，
            逐步把地点热度转换成与你有关的适合度。
          </p>
          <Button onClick={() => setProfileOpen(true)} size="lg">
            看看我的偏好画像
            <ArrowRight />
          </Button>
        </div>
      </section>

      <footer>
        <div className="brand footer-brand">
          <span className="brand-mark">沪</span>
          <span>
            <strong>吃喝玩乐全攻略</strong>
            <small>上海试点 · 产品原型</small>
          </span>
        </div>
        <p>地点与开放信息将在正式上线前逐项核验。</p>
      </footer>

      {profileOpen && (
        <div
          className="profile-backdrop"
          onClick={() => setProfileOpen(false)}
          role="presentation"
        >
          <aside
            aria-label="我的偏好画像"
            className="profile-drawer"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="drawer-heading">
              <div>
                <Badge className="beta-badge">动态偏好画像</Badge>
                <h2>松弛探索型</h2>
                <p>依据本次选择生成，随每次互动更新。</p>
              </div>
              <button
                aria-label="关闭偏好画像"
                onClick={() => setProfileOpen(false)}
                type="button"
              >
                <X />
              </button>
            </div>

            <div className="profile-summary">
              <div className="profile-score">72</div>
              <div>
                <strong>画像可信度</strong>
                <p>再完成3次地点选择，可提升推荐稳定性。</p>
              </div>
            </div>

            <div className="preference-list">
              {[
                ["安静", "热闹", 68],
                ["经典", "小众", 61],
                ["精致", "烟火气", 57],
                ["计划", "随性", 73],
                ["低活动量", "高活动量", 34],
              ].map(([left, right, value]) => (
                <div className="preference-item" key={String(left)}>
                  <div>
                    <span>{left}</span>
                    <span>{right}</span>
                  </div>
                  <div className="preference-track">
                    <span style={{ left: String(value) + "%" }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="drawer-question">
              <span>快速校准</span>
              <h3>同样是周末下午，你更想去哪一个？</h3>
              <div>
                <button type="button">
                  <strong>安静街区</strong>
                  <small>慢慢走，不设目的地</small>
                </button>
                <button type="button">
                  <strong>热闹市集</strong>
                  <small>人多一点，也更有新鲜感</small>
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}

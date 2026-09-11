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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ALL_AREAS, areas, checkedAt, places, validSavedIds, type Place } from "@/lib/places";

const categories = ["全部", "吃", "喝", "玩", "看", "逛"];
const moods = ["松弛", "小众", "有故事", "热闹"];
const companions = ["一个人", "两个人", "朋友", "家人"];
const durations = ["2小时", "半天", "一天"];

function ContextPicker({ label, value, options, onChange, icon, note }: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  icon: React.ReactNode;
  note?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className="context-control" aria-label={`${label}：${value}`}>
          {icon}
          <span><small>{label}</small><strong>{value}</strong></span>
          <ChevronDown aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="context-options" align="start" aria-label={`选择${label}`}>
        <h2>选择{label}</h2>
        <div role="group" aria-label={`${label}选项`}>
          {options.map((option) => (
            <button key={option} type="button" aria-pressed={value === option}
              onClick={() => { onChange(option); setOpen(false); }}>
              <span>{option}</span>
              {value === option && <Check aria-hidden="true" />}
            </button>
          ))}
        </div>
        {note && <p>{note}</p>}
      </PopoverContent>
    </Popover>
  );
}

function matchDetails(place: Place, mood: string, duration: string) {
  const moodBonus = place.moods.includes(mood) ? 3 : -2;
  const timeBonus = duration === "2小时" && place.duration.includes("2小时") ? 2 : 0;
  return { moodBonus, timeBonus, score: Math.min(99, place.baseMatch + moodBonus + timeBonus) };
}

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
  const [area, setArea] = useState(ALL_AREAS);
  const [reasonOpen, setReasonOpen] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem("shanghai-guide-saved");
    if (raw) {
      try {
        setSavedIds(validSavedIds(JSON.parse(raw)));
      } catch {
        setSavedIds([]);
      }
    }
  }, []);

  const rankedPlaces = useMemo(() => {
    return places
      .filter((place) => area === ALL_AREAS || place.area === area)
      .filter((place) => category === "全部" || place.category === category)
      .filter((place) => !showSavedOnly || savedIds.includes(place.id))
      .filter((place) => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return true;
        return [place.name, place.address, place.area, place.category, place.type, ...place.tags]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      })
      .map((place) => ({
        ...place,
        match: matchDetails(place, mood, duration).score,
      }))
      .sort((a, b) => b.match - a.match);
  }, [area, category, duration, mood, query, savedIds, showSavedOnly]);

  const activePlace =
    rankedPlaces.find((place) => place.id === activeId) ?? rankedPlaces[0];
  const activeMatch = activePlace ? matchDetails(activePlace, mood, duration) : undefined;

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
              placeholder="搜地点、地址或标签，例如“书店”"
              type="search"
              value={query}
            />
            <button type="button" aria-label="使用当前位置">
              <LocateFixed />
            </button>
          </div>

          <ContextPicker label="范围" value={area} options={areas}
            onChange={setArea} icon={<MapPin aria-hidden="true" />}
            note={`当前收录${places.length}个真实地点，按街区分组；暂不支持距离搜索。`} />
          <ContextPicker label="时间" value={duration} options={durations}
            onChange={setDuration} icon={<Clock3 aria-hidden="true" />} />
          <ContextPicker label="同行" value={companion} options={companions}
            onChange={setCompanion} icon={<Users aria-hidden="true" />} />
        </div>

        <div className="quick-row">
          <div className="quick-group" aria-label="时间选择">
            <span>有多久</span>
            {durations.map((item) => (
              <button
                className={duration === item ? "chip selected" : "chip"}
                aria-pressed={duration === item}
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
                aria-pressed={companion === item}
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
          当前选择：{mood} · {duration} · {companion}
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
              <strong>{area} · 地点索引</strong>
              <span>已收录 {places.length} 个真实地点</span>
            </div>
            <button type="button" onClick={() => {
              setArea(ALL_AREAS); setCategory("全部"); setQuery(""); setShowSavedOnly(false);
            }}>
              <Navigation aria-hidden="true" />
              查看全部
            </button>
          </div>
          <div className="place-directory">
            <p className="directory-note">按当前结果排列，不表示地理位置。点击地点查看地址与资料。</p>
            <div className="directory-grid" aria-label="地点索引">
              {rankedPlaces.map((place, index) => (
                <button type="button" key={place.id} aria-pressed={activePlace?.id === place.id}
                  onClick={() => setActiveId(place.id)}>
                  <span className="directory-number">{String(index + 1).padStart(2, "0")}</span>
                  <span><strong>{place.name}</strong><small>{place.category} · {place.area}</small></span>
                </button>
              ))}
            </div>
            {activePlace ? (
              <Card className="map-preview directory-preview">
                <CardHeader>
                  <Badge variant="outline">{activePlace.type}</Badge>
                  <CardTitle>{activePlace.name}</CardTitle>
                  <CardDescription>{activePlace.address}</CardDescription>
                </CardHeader>
                <CardContent><p>{activePlace.why}</p></CardContent>
                <CardFooter>
                  <Button size="sm" onClick={() => setReasonOpen(true)}>
                    查看推荐理由与资料 <ArrowRight />
                  </Button>
                </CardFooter>
              </Card>
            ) : <p className="directory-empty">当前条件下没有地点，请调整筛选。</p>}
          </div>
        </div>

        <aside className="results-panel">
          <div className="results-heading">
            <div>
              <span>按偏好演示排序 · 分数为示例</span>
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
                    setArea(ALL_AREAS);
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
                    activePlace?.id === place.id
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
                      <small>示例</small>
                    </div>
                  </div>

                  <div className="place-copy">
                    <div className="place-meta">
                      <Badge variant="secondary">{place.category}</Badge>
                      <span>{place.type}</span>
                    </div>
                    <h3><button type="button" className="place-title-button" onClick={() => { setActiveId(place.id); setReasonOpen(true); }}>{place.name}</button></h3>
                    <p className="place-address">{place.address}</p>
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
                    <button type="button" className="place-details-button" onClick={() => { setActiveId(place.id); setReasonOpen(true); }}>查看详情与来源 <ArrowRight aria-hidden="true" /></button>
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
              <strong>{places.length}个真实地点 · 资料查阅于{checkedAt}</strong>
              名称与地址附来源；部分资料较早，当天营业、价格及排期待复核。标签、停留建议与匹配分为编辑建议或演示。
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
        <p>名称与地址已按来源整理；开放、价格与排期请出发前复核。</p>
      </footer>

      {activePlace && activeMatch && <Dialog open={reasonOpen} onOpenChange={setReasonOpen}>
        <DialogContent className="reason-dialog" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{activePlace.name} · 推荐理由</DialogTitle>
            <DialogDescription>真实地点资料与编辑建议；当天营业和票务请出发前复核。</DialogDescription>
          </DialogHeader>
          <p>{activePlace.why}</p>
          <dl className="reason-facts">
            <div><dt>地址</dt><dd>{activePlace.address}</dd></div>
            <div><dt>开放与营业</dt><dd>{activePlace.opening}</dd></div>
            <div><dt>费用</dt><dd>{activePlace.cost}</dd></div>
            <div><dt>资料来源</dt><dd className="source-links">
              {activePlace.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">
                {source.title}{source.date ? `（资料日期：${source.date}）` : ""} ↗
              </a>)}
            </dd></div>
            <div><dt>资料查阅日期</dt><dd>{activePlace.checkedAt} · 非现场核验；来源链接需联网。</dd></div>
            <div><dt>当前选择</dt><dd>{area} · {duration} · {companion} · {mood}</dd></div>
            <div><dt>体验标签</dt><dd>{activePlace.tags.join(" · ")}</dd></div>
            <div><dt>停留建议</dt><dd>{activePlace.duration} · {activePlace.walking}</dd></div>
            <div><dt>示例匹配分</dt><dd>{activeMatch.score} / 100（上限 99）</dd></div>
            <div><dt>分数来源</dt><dd>
              预设基础分 {activePlace.baseMatch}；
              {activeMatch.moodBonus > 0 ? `符合“${mood}”，加 3 分` : `未标注“${mood}”，减 2 分`}；
              {activeMatch.timeBonus > 0 ? "2 小时活动匹配，加 2 分" : "时间项本次不加分"}。
            </dd></div>
          </dl>
          <p className="reason-note">同行选择已同步，但首版尚未用于评分；以上分数为演示规则计算，并非真实用户评价或到访概率。</p>
          <p className="reason-watchout">留意：{activePlace.watchout}</p>
          <DialogClose asChild><Button type="button">关闭推荐理由</Button></DialogClose>
        </DialogContent>
      </Dialog>}

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

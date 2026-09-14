"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Bookmark, Check, Clock3, Heart, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ALL_AREAS, areas, catalogueUpdatedAt, places, validSavedIds, type Place } from "@/lib/places";
import { visitFor } from "@/lib/visit-profiles";
import { rankPlaces, recommend, shortlist, type Outing, type Recommendation } from "@/lib/recommendations";

const durations: Outing["duration"][] = ["2小时", "半天", "一天"];
const companions: Outing["companion"][] = ["一个人", "两个人", "朋友", "家人"];
const moods: Outing["mood"][] = ["松弛", "有故事", "热闹", "小众"];
const moodLabels = { "松弛": "松弛一点", "有故事": "看点故事", "热闹": "热闹一点", "小众": "换点新鲜" };
const categories = ["全部", "吃", "喝", "玩", "看", "逛"];

function Choices({ label, value, options, onChange, labels = {} }: {
  label: string; value: string; options: string[]; onChange: (value: string) => void; labels?: Record<string, string>;
}) {
  return <fieldset className="choice-field">
    <legend>{label}</legend>
    <RadioGroup value={value} onValueChange={onChange} className="choice-group" aria-label={label}>
      {options.map(option => <label className={value === option ? "choice selected" : "choice"} key={option}>
        <RadioGroupItem value={option} aria-label={labels[option] ?? option} />
        <span>{labels[option] ?? option}</span>
      </label>)}
    </RadioGroup>
  </fieldset>;
}

export default function Home() {
  const [outing, setOuting] = useState<Outing>({ duration: "2小时", companion: "一个人", mood: "松弛" });
  const [area, setArea] = useState(ALL_AREAS);
  const [category, setCategory] = useState("全部");
  const [query, setQuery] = useState("");
  const [view, setView] = useState("pick");
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [storageNote, setStorageNote] = useState("");
  const [detail, setDetail] = useState<Place | null>(null);
  const [copyNote, setCopyNote] = useState("");
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("shanghai-guide-saved");
      if (raw) setSavedIds(validSavedIds(JSON.parse(raw)));
    } catch {
      setStorageNote("当前浏览器无法读取收藏；本次仍可选择和收藏地点。");
    }
  }, []);

  const ranked = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filtered = places.filter(p =>
      (area === ALL_AREAS || p.area === area) &&
      (category === "全部" || p.category === category) &&
      (!normalized || [p.name, p.address, p.area, p.type, ...p.tags].join(" ").toLowerCase().includes(normalized)));
    return rankPlaces(filtered, outing);
  }, [area, category, query, outing]);
  const suggestions = useMemo(() => shortlist(ranked), [ranked]);
  const saved = ranked.filter(r => savedIds.includes(r.place.id));
  const active = detail ? recommend(detail, outing) : null;
  const visible = view === "pick" ? suggestions : view === "saved" ? saved : ranked;
  const hasFilters = area !== ALL_AREAS || category !== "全部" || query.trim() !== "";

  function resetFilters() { setArea(ALL_AREAS); setCategory("全部"); setQuery(""); }
  function toggleSaved(id: number) {
    const next = savedIds.includes(id) ? savedIds.filter(i => i !== id) : [...savedIds, id];
    setSavedIds(next);
    try { window.localStorage.setItem("shanghai-guide-saved", JSON.stringify(next)); setStorageNote(""); }
    catch { setStorageNote("收藏已在本次打开期间保留；当前浏览器不允许跨次保存。"); }
  }
  function openDetail(place: Place) { setCopyNote(""); setDetail(place); }
  async function copyAddress() {
    if (!detail) return;
    try { await navigator.clipboard.writeText(detail.name + "，上海市" + detail.address); setCopyNote("地址已复制，可粘贴到你常用的地图中。"); }
    catch { setCopyNote("复制未完成，请选中或长按下方地址手动复制。"); }
  }

  function renderCard(result: Recommendation) {
    const p = result.place;
    return <article className="decision-card" key={p.id}>
      <div className="decision-card-top"><Badge variant="secondary">{p.category} · {p.type.split(" · ")[0]}</Badge>
        <button type="button" className={savedIds.includes(p.id) ? "heart-button saved" : "heart-button"}
          aria-label={(savedIds.includes(p.id) ? "取消收藏" : "收藏") + p.name}
          aria-pressed={savedIds.includes(p.id)} onClick={() => toggleSaved(p.id)}><Heart aria-hidden="true" /></button>
      </div>
      <h3><button type="button" onClick={() => openDetail(p)}>{p.name}</button></h3>
      <p className="visit-idea">{p.why}</p>
      <div className="decision-facts"><span><MapPin aria-hidden="true" />{p.area}</span><span><Clock3 aria-hidden="true" />{p.duration}</span></div>
      <div className="fit-reasons"><strong>为什么列入这次候选</strong>
        <ul>{result.reasons.slice(0, 2).map(reason => <li key={reason}>{reason}</li>)}</ul>
        {!result.reasons.length && <p>符合所选地区或分类；兴趣与同行方式没有明显匹配项。</p>}
      </div>
      <p className="decision-caution"><strong>{result.timeFits ? "先留意" : "时间偏紧"}：</strong>{result.caution}</p>
      <Button className="detail-button" onClick={() => openDetail(p)}>查看详情与地址 <ArrowRight aria-hidden="true" /></Button>
    </article>;
  }

  return <main className="decision-shell" id="top">
    <header className="decision-header">
      <a className="decision-brand" href="#top"><span className="decision-brand-mark">沪</span><span><strong>吃喝玩乐全攻略</strong><small>上海 · 衡复及周边</small></span></a>
      <button className="plain-button" type="button" onClick={() => setAboutOpen(true)}>推荐怎么来的</button>
    </header>

    <section className="decision-start" aria-labelledby="outing-title">
      <div className="decision-intro"><p className="eyebrow">有空了，去哪里？</p><h1 id="outing-title">这次，想在上海怎么过？</h1>
        <p>按你的时间和同行方式，先挑几个值得考虑的去处。</p></div>
      <div className="outing-choices">
        <Choices label="有多久" value={outing.duration} options={durations} onChange={duration => setOuting(o => ({ ...o, duration: duration as Outing["duration"] }))} />
        <Choices label="和谁去" value={outing.companion} options={companions} onChange={companion => setOuting(o => ({ ...o, companion: companion as Outing["companion"] }))} />
        <Choices label="想怎么过" value={outing.mood} options={moods} labels={moodLabels} onChange={mood => setOuting(o => ({ ...o, mood: mood as Outing["mood"] }))} />
      </div>
      <details className="extra-filters">
        <summary><SlidersHorizontal aria-hidden="true" />限定街区、分类，或搜索地点{hasFilters && <span> · 已筛选</span>}</summary>
        <div className="extra-filter-body">
          <Choices label="在哪一带" value={area} options={areas} onChange={setArea} />
          <Choices label="主要想做什么" value={category} options={categories} onChange={setCategory} />
          <label className="decision-search"><Search aria-hidden="true" /><input type="search" aria-label="搜索地点、地址或标签" placeholder="输入地点、地址或标签，例如“书店”" value={query} onChange={e => setQuery(e.target.value)} /></label>
          {hasFilters && <button type="button" className="plain-button" onClick={resetFilters}>清除街区、分类和搜索条件</button>}
        </div>
      </details>
    </section>

    <Tabs value={view} onValueChange={setView} className="decision-results">
      <div className="results-nav">
        <TabsList aria-label="查看候选或地点库" className="decision-tabs">
          <TabsTrigger value="pick">帮我选</TabsTrigger>
          <TabsTrigger value="all">全部地点（{places.length}）</TabsTrigger>
          <TabsTrigger value="saved"><Bookmark aria-hidden="true" />收藏（{savedIds.length}）</TabsTrigger>
        </TabsList>
        <span className="coverage-label">{area}</span>
      </div>
      {["pick", "all", "saved"].map(tab => <TabsContent key={tab} value={tab}>
        <div className="decision-results-heading">
          <h2>{tab === "pick" ? "先看看这几个" : tab === "saved" ? "留着下次再看" : "继续找找想去的地方"}</h2>
          <p aria-live="polite" role="status">{outing.duration} · {outing.companion} · {moodLabels[outing.mood]} · {visible.length}个候选</p>
        </div>
        {hasFilters && <div className="applied-filters"><span>当前筛选：{area} · {category}{query.trim() && " · “" + query.trim() + "”"}</span><button type="button" onClick={resetFilters}>清除筛选</button></div>}
        {visible.length ? <div className="decision-grid">{visible.map(renderCard)}</div> : <div className="decision-empty">
          <Search aria-hidden="true" /><h3>{tab === "saved" && savedIds.length === 0 ? "还没有收藏的地点" : "这些条件下，暂时没有候选"}</h3>
          <p>{tab === "saved" && savedIds.length === 0 ? "看到感兴趣的地点，点一下卡片上的爱心就能留下。" : `目前收录${places.length}个地点，可以放宽街区、分类或搜索条件，或在全部地点中查看其他选择。`}</p>
          <Button variant="outline" onClick={() => { resetFilters(); setView("all"); }}>浏览全部地点</Button>
        </div>}
        {tab === "pick" && ranked.length > suggestions.length && <div className="more-candidates"><p>这几个是不同活动方向的候选，可以任选一处；不构成连续路线。</p><Button variant="outline" onClick={() => setView("all")}>查看全部{ranked.length}个结果 <ArrowRight aria-hidden="true" /></Button></div>}
      </TabsContent>)}
      {storageNote && <p className="storage-message" role="status">{storageNote}</p>}
      <p className="decision-boundary">停留时间为编辑建议，未计交通、排队；营业、预约和费用请出发前确认。</p>
    </Tabs>

    <footer className="decision-footer">
      <img src="/og.png" alt="吃喝玩乐全攻略上海街区插画" width="160" height="84" loading="lazy" />
      <div><strong>从这次想去哪里开始。</strong><p>{places.length}个真实地点 · 地点库更新于{catalogueUpdatedAt}。每个地点的来源与查阅日期在详情中。</p><p>收藏保存在当前浏览器；分享网址不会带上你的收藏。</p></div>
    </footer>

    <Dialog open={detail !== null} onOpenChange={open => { if (!open) setDetail(null); }}>
      <DialogContent className="decision-dialog" showCloseButton={false}>
        {detail && active && <>
          <DialogHeader><DialogTitle>{detail.name}</DialogTitle><DialogDescription>{detail.type} · {detail.area}</DialogDescription></DialogHeader>
          <p>{detail.why}</p>
          <div className="detail-reasons"><h3>为什么列入这次候选</h3><ul>{active.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul><p>{active.caution}</p></div>
          <dl className="detail-facts">
            <div><dt>地址</dt><dd className="copyable-address">{detail.address}</dd></div>
            <div><dt>建议停留</dt><dd>{detail.duration}；未计交通与排队。</dd></div>
            <div><dt>怎么体验</dt><dd>{visitFor(detail).setting} · {visitFor(detail).conversation}（编辑建议，不代表实测噪声或有空座）。{visitFor(detail).participation}</dd></div>
            <div><dt>出发前确认</dt><dd>{visitFor(detail).booking}{visitFor(detail).evening && "；这是晚间候选。"}</dd></div>
            <div><dt>开放与营业</dt><dd>{detail.opening}</dd></div>
            <div><dt>费用</dt><dd>{detail.cost}</dd></div>
            <div><dt>其他提醒</dt><dd>{detail.watchout}</dd></div>
          </dl>
          <div className="detail-actions"><Button variant="outline" onClick={copyAddress}>复制地址</Button><Button variant="outline" onClick={() => toggleSaved(detail.id)}>{savedIds.includes(detail.id) ? <Check /> : <Heart />}{savedIds.includes(detail.id) ? "已收藏 · 点击取消" : "收藏这个地点"}</Button></div>
          {copyNote && <p role="status">{copyNote}</p>}
          {storageNote && <p role="status">{storageNote}</p>}
          <details className="source-details"><summary>查看资料来源与查阅日期</summary><p>名称、地址来自下列资料；体验标签和推荐理由为编辑建议。</p>
            <ul>{detail.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title} ↗</a>{source.date && <small>资料日期：{source.date}</small>}</li>)}</ul>
            <p>查阅日期：{detail.checkedAt}。部分来源较早，未进行现场核验。</p>
          </details>
          <DialogClose asChild><Button className="dialog-done">返回候选</Button></DialogClose>
        </>}
      </DialogContent>
    </Dialog>

    <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
      <DialogContent className="decision-dialog" showCloseButton={false}>
        <DialogHeader><DialogTitle>这些候选怎么来的</DialogTitle><DialogDescription>根据你这次的选择，从{places.length}个地点中筛选。</DialogDescription></DialogHeader>
        <dl className="detail-facts">
          <div><dt>时间</dt><dd>两小时优先短停留，半天或一天会增加较长活动的优先级。按建议上限预留30分钟余量，不能代替交通计算。三个候选可任选，单个地点不一定能填满半天或一天。</dd></div>
          <div><dt>同行</dt><dd>一个人时倾向自主阅读、观察或看展；朋友同行时倾向用餐或户外活动。家人同行不推定年龄，也不代表已核实无障碍条件。</dd></div>
          <div><dt>心情</dt><dd>依据编辑整理的体验标签。“换点新鲜”按主题特色选择，不代表冷门或人少；“松弛”也不保证安静或免排队。</dd></div>
          <div><dt>三个不同方向</dt><dd>在条件接近的候选中提供不同体验；同一街区空间和它里面的商户避免同时占位。同等条件按名称稳定展示，全部地点仍可查看。条件变化后保留部分合适地点是正常的。</dd></div>
        </dl>
        <p>目前没有接入实时营业、交通或票务。这些规则只帮助缩小候选范围，尚不能判断你一定会喜欢哪里。</p>
        <DialogClose asChild><Button>知道了</Button></DialogClose>
      </DialogContent>
    </Dialog>
  </main>;
}

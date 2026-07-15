"use client";

import { useMemo, useState } from "react";

type ItemKind = "floor" | "wall" | "door" | "bed" | "plant" | "lamp";
type Tile = { kind: ItemKind; tone: string };

const inventory: Array<{ kind: ItemKind; name: string; cost: number; tone: string; mark: string }> = [
  { kind: "floor", name: "人字橡木地板", cost: 80, tone: "oak", mark: "▦" },
  { kind: "wall", name: "奶油护墙板", cost: 120, tone: "cream", mark: "▤" },
  { kind: "door", name: "拱形玻璃门", cost: 150, tone: "rose", mark: "▥" },
  { kind: "bed", name: "藤编双人床", cost: 320, tone: "linen", mark: "▣" },
  { kind: "plant", name: "落地琴叶榕", cost: 90, tone: "leaf", mark: "✦" },
  { kind: "lamp", name: "黄铜壁灯", cost: 110, tone: "brass", mark: "✧" },
];

const tutorial = [
  "欢迎来到澜申里洋房。先看看这间待改造的大客厅。",
  "先选一块「人字橡木地板」，让这里有家的温度。",
  "点击中间的菱形格子，把地板铺下去。",
  "很好！再放一张藤编双人床和一盆绿植，试试搭配加成。",
  "房间已准备好。点击「开始营业」，迎接第一位住客吧！",
];

export default function Home() {
  const [selected, setSelected] = useState<ItemKind>("floor");
  const [tiles, setTiles] = useState<Record<string, Tile>>({
    "2-2": { kind: "floor", tone: "oak" },
    "3-2": { kind: "floor", tone: "oak" },
  });
  const [coins, setCoins] = useState(1280);
  const [day, setDay] = useState(1);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [showButler, setShowButler] = useState(false);
  const [butlerName, setButlerName] = useState("知夏");
  const [butlerGender, setButlerGender] = useState("女");
  const [butlerLook, setButlerLook] = useState("墨绿制服");

  const selectedItem = inventory.find((item) => item.kind === selected)!;
  const hasBed = Object.values(tiles).some((tile) => tile.kind === "bed");
  const hasPlant = Object.values(tiles).some((tile) => tile.kind === "plant");
  const comboActive = hasBed && hasPlant;
  const satisfaction = 42 + (hasBed ? 16 : 0) + (hasPlant ? 8 : 0) + (comboActive ? 12 : 0);

  const placedCount = useMemo(() => Object.keys(tiles).length, [tiles]);

  function choose(kind: ItemKind) {
    setSelected(kind);
    if (tutorialStep === 1 && kind === "floor") setTutorialStep(2);
    if (tutorialStep === 3 && (kind === "bed" || kind === "plant")) setTutorialStep(3);
  }

  function place(x: number, y: number) {
    const key = `${x}-${y}`;
    if (running || tiles[key] || coins < selectedItem.cost) return;
    setTiles((current) => ({ ...current, [key]: { kind: selected, tone: selectedItem.tone } }));
    setCoins((current) => current - selectedItem.cost);
    if (tutorialStep === 2) setTutorialStep(3);
    if (tutorialStep === 3 && (selected === "bed" || selected === "plant")) setTutorialStep(4);
  }

  function startDay() {
    if (!hasBed) return;
    setRunning(true);
    setCoins((current) => current + 420 + (comboActive ? 120 : 0));
    setDay((current) => current + 1);
    setTutorialStep(5);
    window.setTimeout(() => setRunning(false), 1200);
  }

  return (
    <main className="game-shell">
      <section className="game-frame" aria-label="澜申里洋房试玩版">
        <header className="topbar">
          <div className="date-badge"><strong>第 {day} 日</strong><span>春 · 09:20</span></div>
          <div className="villa-title"><span className="spark">✦</span> 澜申里洋房 <small>试营业</small></div>
          <div className="money">◉ {coins.toLocaleString()}</div>
        </header>

        <section className="status-row">
          <div><b>入住</b><span> 1 / 4 间</span></div>
          <div><b>满意度</b><span className="meter"><i style={{ width: `${satisfaction}%` }} /></span><em>{satisfaction}</em></div>
          <button className="butler-button" onClick={() => setShowButler(true)} aria-label="设置管家">管家</button>
        </section>

        <section className="inn-stage">
          <div className="street-line" />
          <div className="villa">
            <div className="villa-roof"><i /><i /><i /></div>
            <div className="villa-backdrop">
              <div className="arched-window" /><div className="arched-window" /><div className="arched-window" />
            </div>
            <div className="balcony"><i /><i /><i /><i /><i /></div>
            <div className="side-stair"><i /><i /><i /><i /></div>
            <div className="build-label">自由建造区 · {placedCount} 件陈设</div>
            <div className="tile-board" aria-label="可建造的等角方格">
              {Array.from({ length: 36 }, (_, index) => {
                const x = index % 6;
                const y = Math.floor(index / 6);
                const key = `${x}-${y}`;
                const tile = tiles[key];
                return <button key={key} className={`iso-tile ${tile ? `has-${tile.tone}` : ""}`} style={{ left: 116 + (x - y) * 30, top: 108 + (x + y) * 15 }} onClick={() => place(x, y)} aria-label={`地块 ${x + 1}-${y + 1}`}>
                  {tile && <span className={`furniture ${tile.kind}`}>{tile.kind === "plant" ? "♣" : tile.kind === "bed" ? "▰" : tile.kind === "lamp" ? "✦" : tile.kind === "door" ? "▥" : tile.kind === "wall" ? "▤" : ""}</span>}
                </button>;
              })}
            </div>
            <div className="front-door" /><div className="window-row"><i /><i /><i /><i /></div>
          </div>
          <div className="butler-sprite" data-gender={butlerGender}><div className="sprite-head" /><div className="sprite-body" /><small>{butlerName}</small></div>
          <div className="guest-sprite"><div /><small>住客</small></div>
        </section>

        <section className="catalog-strip" aria-label="搭配图册">
          <div className="catalog-book"><span>图册</span><b>{comboActive ? "1 / 8" : "0 / 8"}</b></div>
          <div className={`combo-card ${comboActive ? "unlocked" : ""}`}>
            <span className="combo-icon">♣</span><div><b>窗边绿意</b><small>{comboActive ? "已发现 · 满意度 +12" : "双人床 + 落地绿植"}</small></div>
          </div>
          <button className="run-button" disabled={!hasBed || running} onClick={startDay}>{running ? "结算中…" : "开始营业"}</button>
        </section>

        <section className="build-panel">
          <div className="tool-title"><span>建造</span><small>选择材料后点击格子</small></div>
          <div className="inventory">
            {inventory.map((item) => <button key={item.kind} className={`item-button ${selected === item.kind ? "selected" : ""}`} onClick={() => choose(item.kind)}>
              <span className={`item-pixel ${item.tone}`}>{item.mark}</span><b>{item.name}</b><small>◉ {item.cost}</small>
            </button>)}
          </div>
        </section>

        {tutorialStep < tutorial.length && <aside className="tutorial-card">
          <div className="tutorial-portrait"><span /></div>
          <div><b>{butlerName} · 管家</b><p>{tutorial[tutorialStep]}</p></div>
          {tutorialStep === 0 && <button onClick={() => setTutorialStep(1)}>开始</button>}
        </aside>}

        {showButler && <div className="modal-shade" role="dialog" aria-modal="true" aria-label="管家设置">
          <section className="butler-modal">
            <button className="close" onClick={() => setShowButler(false)}>×</button>
            <div className="modal-sprite"><div /><i /></div>
            <h2>我的管家</h2>
            <label>名字<input value={butlerName} maxLength={6} onChange={(event) => setButlerName(event.target.value || "知夏")} /></label>
            <label>性别<span className="choice-row">{["女", "男"].map((option) => <button className={butlerGender === option ? "on" : ""} key={option} onClick={() => setButlerGender(option)}>{option}</button>)}</span></label>
            <label>服装<span className="choice-row">{["墨绿制服", "奶油风衣", "红棕马甲"].map((option) => <button className={butlerLook === option ? "on" : ""} key={option} onClick={() => setButlerLook(option)}>{option}</button>)}</span></label>
            <button className="save-butler" onClick={() => setShowButler(false)}>保存设定</button>
          </section>
        </div>}
      </section>
    </main>
  );
}

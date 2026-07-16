"use client";

import { useMemo, useState } from "react";

type Tool = "floor" | "wall" | "door" | "bed" | "plant" | "lamp";

const GRID_SIZE = 5;
const tools: Array<{ id: Tool; name: string; cost: number; icon: string }> = [
  { id: "floor", name: "人字木地板", cost: 80, icon: "▦" },
  { id: "wall", name: "奶油护墙板", cost: 120, icon: "▤" },
  { id: "door", name: "拱形木门", cost: 150, icon: "▥" },
  { id: "bed", name: "藤编双人床", cost: 320, icon: "▣" },
  { id: "plant", name: "落地琴叶榕", cost: 90, icon: "♣" },
  { id: "lamp", name: "黄铜壁灯", cost: 110, icon: "✦" },
];

function ObjectSprite({ type }: { type: Exclude<Tool, "floor"> }) {
  if (type === "bed") return <span className="bed-sprite"><i /><b /></span>;
  if (type === "plant") return <span className="plant-sprite"><i /><b /></span>;
  if (type === "lamp") return <span className="lamp-sprite">✦</span>;
  if (type === "wall") return <span className="wall-sprite">▤</span>;
  return <span className="door-sprite">▥</span>;
}

export default function Home() {
  const [tool, setTool] = useState<Tool>("floor");
  const [floorTiles, setFloorTiles] = useState<Set<string>>(new Set());
  const [objects, setObjects] = useState<Record<string, Exclude<Tool, "floor">>>({});
  const [coins, setCoins] = useState(1280);
  const [notice, setNotice] = useState("先选择「人字木地板」，再点击大厅中任意浅色格。铺下后你会直接看到地板变化。");

  const selected = tools.find((item) => item.id === tool)!;
  const bedCount = Object.values(objects).filter((item) => item === "bed").length;
  const plantCount = Object.values(objects).filter((item) => item === "plant").length;
  const comboActive = bedCount > 0 && plantCount > 0;
  const satisfaction = 42 + floorTiles.size * 2 + bedCount * 16 + plantCount * 8 + (comboActive ? 12 : 0);
  const canOpen = bedCount > 0;
  const cells = useMemo(() => Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => `${index % GRID_SIZE}-${Math.floor(index / GRID_SIZE)}`), []);

  function selectTool(nextTool: Tool) {
    setTool(nextTool);
    setNotice(nextTool === "floor" ? "地板已选中：点击任意浅色格，格子会立即变成木地板。" : `已选中「${tools.find((item) => item.id === nextTool)?.name}」。先确保目标格已经铺好地板。`);
  }

  function place(cell: string) {
    if (coins < selected.cost) {
      setNotice("铜钱不够了，先开始营业吧。");
      return;
    }
    if (tool === "floor") {
      if (floorTiles.has(cell)) {
        setNotice("这块已经铺好地板了，可以换一格继续铺。 ");
        return;
      }
      setFloorTiles((current) => new Set(current).add(cell));
      setCoins((current) => current - selected.cost);
      setNotice("铺设成功！这块格子现在是真实的木地板。下一步可选「藤编双人床」放进已铺好的格子。 ");
      return;
    }
    if (!floorTiles.has(cell)) {
      setNotice("这里还是地基，先铺一块地板后才能摆放家具。 ");
      return;
    }
    if (objects[cell]) {
      setNotice("这个格子已经有家具了，换一块铺好地板的空格吧。 ");
      return;
    }
    setObjects((current) => ({ ...current, [cell]: tool }));
    setCoins((current) => current - selected.cost);
    setNotice(tool === "plant" && bedCount > 0 ? "发现搭配「窗边绿意」：满意度 +12！" : `已摆放${selected.name}。`);
  }

  function openInn() {
    if (!canOpen) {
      setNotice("至少放一张床后才能开门营业。 ");
      return;
    }
    setCoins((current) => current + 420 + (comboActive ? 120 : 0));
    setNotice(comboActive ? "营业结算：组合房很受欢迎，收入 +540。" : "营业结算：首位客人入住，收入 +420。 ");
  }

  return (
    <main className="game-shell">
      <section className="game-frame" aria-label="澜申里洋房真实建造试玩">
        <header className="topbar">
          <div className="day-card"><b>第 1 日</b><small>春 · 09:20</small></div>
          <div className="inn-name"><span>◆</span> 澜申里洋房 <small>试营业</small></div>
          <div className="coin-pill">◉ {coins.toLocaleString()}</div>
        </header>

        <div className="statusbar"><span>入住 <b>{bedCount} / 4</b></span><span>满意度 <i><em style={{ width: `${Math.min(satisfaction, 100)}%` }} /></i><b>{satisfaction}</b></span><button aria-label="管家资料">管家</button></div>

        <section className="villa-room">
          <div className="room-wall">
            <div className="wall-trim" />
            <div className="arch-window"><i /><b /></div><div className="arch-window"><i /><b /></div><div className="arch-window"><i /><b /></div>
            <div className="balcony-rail"><i /><i /><i /><i /><i /></div>
            <div className="staircase"><i /><i /><i /><i /><i /></div>
          </div>
          <div className="room-label">大厅地基 · 已铺 {floorTiles.size} 格</div>
          <div className="room-grid" aria-label="平整的大厅地基格">
            {cells.map((cell) => {
              const furniture = objects[cell];
              return <button key={cell} className={`room-cell ${floorTiles.has(cell) ? "floor-oak" : "foundation"}`} onClick={() => place(cell)} aria-label={floorTiles.has(cell) ? `已铺地板的格子 ${cell}` : `空地基格 ${cell}`}>
                {furniture && <ObjectSprite type={furniture} />}
              </button>;
            })}
          </div>
          <div className="reception"><div className="desk-lamp" /><div className="butler-pixel"><i /><b /><small>知夏</small></div></div>
          <div className="lounge"><i /><b /><em /></div>
          <div className="guest-pixel"><i /><b /><small>住客</small></div>
        </section>

        <section className="notice-card" aria-live="polite"><div className="portrait"><i /><b /></div><div><b>知夏 · 管家</b><p>{notice}</p></div></section>

        <section className="catalog-strip">
          <div className="catalog-count"><span>图册</span><b>{comboActive ? "1 / 8" : "0 / 8"}</b></div>
          <div className={`combo-card ${comboActive ? "unlocked" : ""}`}><span>♣</span><div><b>窗边绿意</b><small>{comboActive ? "已发现 · 满意度 +12" : "双人床 + 落地绿植"}</small></div></div>
          <button className="open-button" onClick={openInn} disabled={!canOpen}>开始营业</button>
        </section>

        <section className="build-panel">
          <div className="build-title"><b>建造</b><span>当前：{selected.name} · 点击大厅格子铺设</span></div>
          <div className="tool-grid">
            {tools.map((item) => <button key={item.id} className={`tool-button ${tool === item.id ? "selected" : ""}`} onClick={() => selectTool(item.id)}>
              <i className={item.id}>{item.icon}</i><b>{item.name}</b><small>◉ {item.cost}</small>
            </button>)}
          </div>
        </section>
      </section>
    </main>
  );
}

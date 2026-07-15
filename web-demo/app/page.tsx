"use client";

import { useState } from "react";

const GRID_SIZE = 6;
const TARGET_CELL = "3-3";

export default function Home() {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [placed, setPlaced] = useState(false);

  function selectFloor() {
    setStep(1);
  }

  function placeFloor(cell: string) {
    if (step !== 1 || cell !== TARGET_CELL) return;
    setPlaced(true);
    setStep(2);
  }

  function continueBuild() {
    setStep(3);
  }

  return (
    <main className="game-shell">
      <section className="pixel-demo" aria-label="澜申里洋房建造试玩">
        <img
          className="villa-art"
          src="/shanghai-villa-build-mode.png"
          alt="奶油色上海洋楼的像素风民宿大厅，中央是一片可建造的地基区域。"
        />

        <div className="build-grid" aria-label="大厅地基网格">
          {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
            const x = index % GRID_SIZE;
            const y = Math.floor(index / GRID_SIZE);
            const cell = `${x}-${y}`;
            const isTarget = cell === TARGET_CELL;
            const isActiveTarget = isTarget && step === 1;
            return (
              <button
                key={cell}
                className={`build-cell ${isActiveTarget ? "target-cell" : ""} ${isTarget && placed ? "placed-cell" : ""}`}
                onClick={() => placeFloor(cell)}
                aria-label={isActiveTarget ? "点这里铺设地板" : `地基格 ${x + 1}-${y + 1}`}
                disabled={step !== 1 || !isTarget}
              >
                {isActiveTarget && <span>点这里铺设</span>}
                {isTarget && placed && <span>地板完成</span>}
              </button>
            );
          })}
        </div>

        {step === 0 && (
          <button className="floor-hit action-pulse" onClick={selectFloor} aria-label="第 1 步：选择地板">
            <span>第 1 步：点地板</span><i>1</i>
          </button>
        )}

        {step === 1 && <div className="step-bubble point-bubble">第 2 步：点绿色格子</div>}

        {step === 2 && (
          <button className="continue-hit" onClick={continueBuild}>
            <span>很好！地板已铺好</span><b>继续摆放家具 →</b>
          </button>
        )}

        {step === 3 && <div className="complete-bubble">下一步：选择「墙体」围出第一间客房</div>}

        <div className="guide-strip" aria-live="polite">
          <b>知夏 · 管家</b>
          <span>{step === 0 ? "先点底部闪烁的「地板」。" : step === 1 ? "现在只要点中央绿色格子即可。" : step === 2 ? "完成！点击继续，再摆放家具。" : "你已完成第一块地基。"}</span>
        </div>
      </section>
    </main>
  );
}

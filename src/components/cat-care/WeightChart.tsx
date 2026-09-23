"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { formatDay, formatKg, formatTime, type WeightRecord } from "./api";

const HEIGHT = 220;
const PAD = { top: 16, right: 56, bottom: 28, left: 48 };
const NICE_STEPS = [10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000];

// 讓 y 軸刻度落在整數（例如 1,000 / 1,100 / 1,200）
function niceScale(min: number, max: number, targetTicks = 4) {
  const span = Math.max(max - min, 50);
  const step = NICE_STEPS.find((s) => span / s <= targetTicks) ?? 5000;
  const lo = Math.floor((min - span * 0.1) / step) * step;
  const hi = Math.ceil((max + span * 0.1) / step) * step;
  const ticks: number[] = [];
  for (let v = Math.max(lo, 0); v <= hi; v += step) ticks.push(v);
  return { lo: Math.max(lo, 0), hi, ticks };
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

export function WeightChart({ records }: { records: WeightRecord[] }) {
  const [ref, width] = useWidth<HTMLDivElement>();

  // API 回傳新到舊，畫圖要舊到新
  const points = [...records].sort((a, b) => +new Date(a.measuredAt) - +new Date(b.measuredAt));

  return (
    <div ref={ref} className="relative select-none">
      {points.length < 2 ? (
        <div className="flex h-32 items-center justify-center rounded-xl bg-background text-sm text-foreground/60">
          至少需要兩筆體重紀錄才能畫出折線圖
        </div>
      ) : (
        width > 0 && <Plot points={points} width={width} />
      )}
    </div>
  );
}

function Plot({ points, width }: { points: WeightRecord[]; width: number }) {
  const [active, setActive] = useState<number | null>(null);

  const times = points.map((p) => +new Date(p.measuredAt));
  const t0 = times[0];
  const t1 = times[times.length - 1];
  const { lo, hi, ticks } = niceScale(Math.min(...points.map((p) => p.weightGrams)), Math.max(...points.map((p) => p.weightGrams)));
  // 刻度間距是公克；換成公斤顯示時，小數位數跟著間距（1000g→0 位、100g→1 位、其餘 2 位）
  const tickStep = ticks.length > 1 ? ticks[1] - ticks[0] : 1000;
  const tickDecimals = tickStep % 1000 === 0 ? 0 : tickStep % 100 === 0 ? 1 : 2;
  const innerW = Math.max(width - PAD.left - PAD.right, 1);
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const x = (t: number) => PAD.left + (t1 === t0 ? innerW / 2 : ((t - t0) / (t1 - t0)) * innerW);
  const y = (g: number) => PAD.top + (1 - (g - lo) / (hi - lo)) * innerH;
  const xy = points.map((p, i) => [x(times[i]), y(p.weightGrams)] as const);
  const last = points.length - 1;

  const line = xy.map(([px, py], i) => `${i ? "L" : "M"}${px},${py}`).join(" ");
  const area = `${line} L${xy[xy.length - 1][0]},${y(lo)} L${xy[0][0]},${y(lo)} Z`;

  // x 軸日期：同一天只標一次，且彼此至少間隔 48px，避免重疊
  const xLabels: { x: number; text: string }[] = [];
  for (let i = 0; i < points.length; i++) {
    const text = formatDay(points[i].measuredAt).replace(/（.*）|\(.*\)/, "");
    const prev = xLabels[xLabels.length - 1];
    if (prev && (prev.text === text || xy[i][0] - prev.x < 48)) continue;
    xLabels.push({ x: xy[i][0], text });
  }

  function nearest(clientX: number, target: Element) {
    const px = clientX - target.getBoundingClientRect().left;
    let best = 0;
    for (let i = 1; i < xy.length; i++) if (Math.abs(xy[i][0] - px) < Math.abs(xy[best][0] - px)) best = i;
    return best;
  }

  function onKey(e: KeyboardEvent) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const step = e.key === "ArrowRight" ? 1 : -1;
    setActive((i) => (i === null ? last : Math.min(Math.max(i + step, 0), last)));
  }

  const a = active === null ? null : { p: points[active], xy: xy[active], delta: active > 0 ? points[active].weightGrams - points[active - 1].weightGrams : null };

  return (
    <>
      <svg
          width={width}
          height={HEIGHT}
          role="img"
          aria-label={`體重折線圖，共 ${points.length} 筆，從 ${formatKg(points[0].weightGrams)} 到 ${formatKg(points[last].weightGrams)}。用左右方向鍵查看每一筆。`}
          tabIndex={0}
          onPointerMove={(e: PointerEvent<SVGSVGElement>) => setActive(nearest(e.clientX, e.currentTarget))}
          onPointerDown={(e: PointerEvent<SVGSVGElement>) => setActive(nearest(e.clientX, e.currentTarget))}
          // 觸控放開時也會觸發 pointerleave；只有滑鼠移開才隱藏，手指點過的提示框會留著
          onPointerLeave={(e: PointerEvent<SVGSVGElement>) => e.pointerType === "mouse" && setActive(null)}
          onFocus={() => setActive((i) => i ?? last)}
          onBlur={() => setActive(null)}
          onKeyDown={onKey}
          className="block touch-pan-y overflow-visible outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-gold"
        >
          {/* 格線與 y 軸刻度 */}
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} className="stroke-line" strokeWidth={1} />
              <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-foreground/60 text-[11px] tabular-nums">
                {(t / 1000).toFixed(tickDecimals)}
              </text>
            </g>
          ))}
          {xLabels.map((l) => (
            <text key={l.x} x={l.x} y={HEIGHT - 8} textAnchor="middle" className="fill-foreground/60 text-[11px] tabular-nums">
              {l.text}
            </text>
          ))}

          <path d={area} fill="#c17a52" fillOpacity={0.1} />
          <path d={line} fill="none" stroke="#c17a52" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {/* 十字準線 */}
          {a && <line x1={a.xy[0]} x2={a.xy[0]} y1={PAD.top} y2={y(lo)} className="stroke-foreground/40" strokeWidth={1} />}

          {xy.map(([px, py], i) => (
            <circle
              key={points[i]._id}
              cx={px}
              cy={py}
              r={active === i ? 6 : 4}
              fill="#c17a52"
              strokeWidth={2}
              className="stroke-card"
            />
          ))}

          {/* 只標最後一筆的數值 */}
          <text x={xy[last][0] + 10} y={xy[last][1]} dy="0.32em" className="fill-foreground text-xs font-semibold">
            {formatKg(points[last].weightGrams)}
          </text>
        </svg>

      {/* 提示框放在準線旁邊（右半邊時放左側），不擋住目前的點 */}
      {a && (
        <div
          role="status"
          className="pointer-events-none absolute z-10 w-max rounded-lg border border-line bg-card px-3 py-2 text-sm shadow-md"
          style={{
            top: PAD.top,
            left: a.xy[0],
            transform: a.xy[0] > width / 2 ? "translateX(calc(-100% - 12px))" : "translateX(12px)",
          }}
        >
          <div className="text-base font-semibold tabular-nums">{formatKg(a.p.weightGrams)}</div>
          <div className="text-xs text-foreground/60">
            {formatDay(a.p.measuredAt)} {formatTime(a.p.measuredAt)}
          </div>
          {a.delta !== null && (
            <div className="text-xs text-foreground/70">
              比上次 {a.delta > 0 ? "+" : a.delta < 0 ? "−" : ""}
              {formatKg(Math.abs(a.delta))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

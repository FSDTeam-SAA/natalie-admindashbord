"use client";

import { useMemo, useState, type MouseEvent } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type ChartRange = "week" | "month";

const chartShapes: Record<ChartRange, number[]> = {
  week: [68, 68, 38, 58, 30, 65, 43],
  month: [58, 42, 66, 35, 52, 28, 46],
};

export function RevenueChart({ totalRevenue, icon: Icon }: { totalRevenue: number; icon: LucideIcon }) {
  const [range, setRange] = useState<ChartRange>("week");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const formattedRevenue = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(totalRevenue);
  const labels = range === "week"
    ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    : ["1", "5", "10", "15", "20", "25", "30"];
  const points = useMemo(
    () => chartShapes[range].map((y, index, items) => ({
      x: (index / (items.length - 1)) * 100,
      y,
    })),
    [range],
  );
  const linePoints = points.map((point) => `${point.x},${point.y}`).join(" ");
  const areaPoints = `0,100 ${linePoints} 100,100`;
  const activePoint = activeIndex === null ? null : points[activeIndex];

  const handleChartMove = (event: MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const relativeX = Math.min(Math.max(event.clientX - bounds.left, 0), bounds.width);
    const nextIndex = Math.round((relativeX / bounds.width) * (points.length - 1));
    setActiveIndex(nextIndex);
  };

  return (
    <section className="h-[364px] rounded-md border border-[#2A2B31] bg-[#1A1B20] p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-white">Revenue</h2>
        <div className="flex rounded-md bg-[#3A2028] p-1">
          {(["week", "month"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setRange(item);
                setActiveIndex(null);
              }}
              className={cn(
                "h-8 rounded px-4 text-sm font-medium capitalize text-[#D6C9CE] transition-colors",
                range === item && "bg-[#C83B55] font-semibold text-white",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#351D2B]">
          <Icon className="h-5 w-5 text-[#D33C58]" />
        </span>
        <div>
          <p className="text-xs text-[#9A9AA2]">Total Revenue</p>
          <p className="text-2xl font-semibold text-white">{formattedRevenue}</p>
        </div>
      </div>

      <div className="relative mt-5 h-[215px] overflow-hidden">
        <div
          className="absolute inset-x-9 bottom-7 top-3"
          onMouseMove={handleChartMove}
          onMouseLeave={() => setActiveIndex(null)}
        >
          {[0, 1, 2, 3, 4].map((line) => (
            <div key={line} className="absolute inset-x-0 border-t border-[#2A2B31]/70" style={{ top: `${line * 25}%` }} />
          ))}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" role="img" aria-label={`${range} revenue overview`}>
            <defs>
              <linearGradient id={`revenue-fill-${range}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#C83B55" stopOpacity="0.38" />
                <stop offset="100%" stopColor="#C83B55" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <polygon points={areaPoints} fill={`url(#revenue-fill-${range})`} />
            <polyline points={linePoints} fill="none" stroke="#D33C58" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {activePoint && activeIndex !== null && (
            <>
              <div className="pointer-events-none absolute bottom-0 border-l-2 border-dashed border-[#D33C58]" style={{ left: `${activePoint.x}%`, top: `${activePoint.y}%` }} />
              <div className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#D33C58] bg-white" style={{ left: `${activePoint.x}%`, top: `${activePoint.y}%` }} />
              <div
                className={cn(
                  "pointer-events-none absolute -translate-y-[calc(100%+12px)] rounded-md bg-[#C83B55] px-4 py-2 text-center text-xs font-medium text-white",
                  activeIndex === 0 ? "translate-x-0" : activeIndex === points.length - 1 ? "-translate-x-full" : "-translate-x-1/2",
                )}
                style={{ left: `${activePoint.x}%`, top: `${activePoint.y}%` }}
              >
                {labels[activeIndex]}<br />{formattedRevenue}
                <span className="absolute -bottom-1 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-[#C83B55]" />
              </div>
            </>
          )}
        </div>
        <div className="absolute inset-x-9 bottom-0 grid grid-cols-7 text-xs text-[#DCDCE1]">
          {labels.map((label) => <span key={label}>{label}</span>)}
        </div>
      </div>
    </section>
  );
}

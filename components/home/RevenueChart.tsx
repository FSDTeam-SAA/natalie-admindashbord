"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";

type ChartRange = "week" | "month";

type RevenuePoint = {
  label: string;
  tooltip: string;
  value: number;
};

const chartData: Record<ChartRange, RevenuePoint[]> = {
  week: [
    { label: "Sun", tooltip: "Sunday", value: 16 },
    { label: "Mon", tooltip: "Monday", value: 27 },
    { label: "Tue", tooltip: "Tuesday", value: 38 },
    { label: "Wed", tooltip: "Wednesday", value: 22 },
    { label: "Thu", tooltip: "Thursday", value: 30 },
    { label: "Fri", tooltip: "Friday", value: 35 },
    { label: "Sat", tooltip: "Saturday", value: 27 },
  ],
  month: [
    { label: "1", tooltip: "Week 1", value: 18 },
    { label: "5", tooltip: "Week 2", value: 24 },
    { label: "10", tooltip: "Week 3", value: 31 },
    { label: "15", tooltip: "Week 4", value: 26 },
    { label: "20", tooltip: "Week 5", value: 42 },
    { label: "25", tooltip: "Week 6", value: 33 },
    { label: "30", tooltip: "Week 7", value: 46 },
  ],
};

const yAxis = [50, 40, 30, 20, 10, 0];
const viewBoxWidth = 820;
const viewBoxHeight = 220;
const chartPadding = 8;
const maxValue = 50;

function getPointPosition(point: RevenuePoint, index: number, length: number) {
  const usableWidth = viewBoxWidth - chartPadding * 2;
  const x = chartPadding + (usableWidth / (length - 1)) * index;
  const y = viewBoxHeight - (point.value / maxValue) * viewBoxHeight;

  return { x, y };
}

function createLinePath(points: Array<{ x: number; y: number }>) {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

function formatValue(value: number) {
  return `${value}k`;
}

export function RevenueChart() {
  const [range, setRange] = useState<ChartRange>("week");
  const [activeIndex, setActiveIndex] = useState(2);

  const data = chartData[range];

  const points = useMemo(
    () => data.map((point, index) => getPointPosition(point, index, data.length)),
    [data],
  );

  const linePath = useMemo(() => createLinePath(points), [points]);
  const fillPath = `${linePath} L ${points[points.length - 1].x} ${viewBoxHeight} L ${points[0].x} ${viewBoxHeight} Z`;
  const activePoint = points[activeIndex];
  const activeData = data[activeIndex];
  const tooltipLeft = `${(activePoint.x / viewBoxWidth) * 100}%`;
  const tooltipTop = `${(activePoint.y / viewBoxHeight) * 100}%`;

  const handleRangeChange = (nextRange: ChartRange) => {
    setRange(nextRange);
    setActiveIndex(nextRange === "week" ? 2 : 4);
  };

  return (
    <section className="h-[364px] rounded-md border border-[#2A2B31] bg-[#1A1B20] p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-white">Revenue</h2>
        <div className="flex rounded-md bg-[#3A2028] p-1">
          {(["week", "month"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleRangeChange(item)}
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

      <div className="relative h-[289px]">
        <div className="absolute bottom-8 left-0 top-2 flex w-10 flex-col justify-between text-xs text-white">
          {yAxis.map((label) => (
            <span key={label}>{label}k</span>
          ))}
        </div>

        <div className="absolute bottom-8 left-12 right-0 top-2">
          <svg
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            preserveAspectRatio="none"
            className="h-full w-full overflow-visible"
            role="img"
            aria-label={`${range} revenue chart`}
          >
            <defs>
              <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#C83B55" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#C83B55" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {yAxis.map((value) => {
              const y = viewBoxHeight - (value / maxValue) * viewBoxHeight;

              return (
                <line
                  key={value}
                  x1="0"
                  x2={viewBoxWidth}
                  y1={y}
                  y2={y}
                  stroke="#2A2B31"
                  strokeOpacity="0.45"
                  strokeWidth="1"
                />
              );
            })}

            <path
              d={fillPath}
              fill="url(#revenueFill)"
            />
            <path
              d={linePath}
              fill="none"
              stroke="#D33C58"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
            />
            <line
              x1={activePoint.x}
              x2={activePoint.x}
              y1={activePoint.y}
              y2={viewBoxHeight}
              stroke="#D33C58"
              strokeDasharray="5 5"
              strokeWidth="2"
            />
            {points.map((point, index) => (
              <circle
                key={`${data[index].label}-${data[index].value}`}
                cx={point.x}
                cy={point.y}
                r={index === activeIndex ? 5 : 8}
                className="cursor-pointer"
                fill={index === activeIndex ? "#FFFFFF" : "transparent"}
                stroke={index === activeIndex ? "#D33C58" : "transparent"}
                strokeWidth="2"
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </svg>

          <div
            className="absolute -translate-x-1/2 -translate-y-[calc(100%+10px)] rounded-md bg-[#C83B55] px-5 py-3 text-center text-xs font-medium leading-tight text-white"
            style={{ left: tooltipLeft, top: tooltipTop }}
          >
            {activeData.tooltip}
            <br />
            {formatValue(activeData.value)}
            <span className="absolute -bottom-1 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-[#C83B55]" />
          </div>
        </div>

        <div
          className="absolute bottom-0 left-12 right-0 grid text-xs text-[#DCDCE1]"
          style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}
        >
          {data.map((point) => (
            <span key={point.label}>{point.label}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { format, parseISO, startOfWeek, startOfMonth } from "date-fns";

interface TimelineData {
  groupBy: "day" | "week" | "month";
  days: number;
  data: { period: string; count: number }[];
}

interface TimelineChartProps {
  dateRange: string;
  platform: string;
  impactLevel: string;
}

function formatLabel(period: string, groupBy: "day" | "week" | "month"): string {
  const date = parseISO(period);
  if (groupBy === "day") return format(date, "MMM d");
  if (groupBy === "week") return "Wk " + format(startOfWeek(date), "MMM d");
  return format(startOfMonth(date), "MMM ''yy");
}

const CHART_HEIGHT = 200;
const PADDING_LEFT = 48;
const PADDING_RIGHT = 16;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 40;
const LINE_COLOR = "#6366f1";
const FILL_COLOR = "rgba(99, 102, 241, 0.08)";
const DOT_COLOR = "#6366f1";

export default function TimelineChart({
  dateRange,
  platform,
  impactLevel,
}: TimelineChartProps) {
  const [data, setData] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; count: number; label: string } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    async function fetchTimeline() {
      setLoading(true);
      const params = new URLSearchParams({ days: dateRange });
      if (platform !== "all") params.set("platform", platform);
      if (impactLevel !== "all") params.set("impactLevel", impactLevel);

      try {
        const res = await fetch(`/api/timeline?${params}`);
        if (res.ok) {
          setData(await res.json());
        }
      } catch {
        // non-critical
      }
      setLoading(false);
    }
    fetchTimeline();
  }, [dateRange, platform, impactLevel]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6">
        <div className="h-4 bg-slate-200 rounded w-40 mb-4 animate-pulse" />
        <div className="h-48 bg-slate-100 rounded animate-pulse" />
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          Changes Over Time
        </h3>
        <p className="text-sm text-slate-400 text-center py-8">No data for selected period</p>
      </div>
    );
  }

  const maxCount = Math.max(...data.data.map((d) => d.count), 1);
  // Round up y-axis max to a nice number
  const yMax = Math.ceil(maxCount * 1.15) || 1;

  // Generate Y-axis ticks (4-5 ticks)
  const tickCount = 4;
  const yTicks: number[] = [];
  const tickStep = Math.max(1, Math.ceil(yMax / tickCount));
  for (let i = 0; i <= tickCount; i++) {
    const val = i * tickStep;
    if (val <= yMax + tickStep) yTicks.push(val);
  }
  const yAxisMax = yTicks[yTicks.length - 1] || yMax;

  const periodLabels: Record<string, string> = {
    "7": "Past 7 Days",
    "14": "Past 14 Days",
    "30": "Past 30 Days",
    "90": "Past 90 Days",
    "365": "Past Year",
  };

  const groupLabel =
    data.groupBy === "day" ? "by day" : data.groupBy === "week" ? "by week" : "by month";

  // Calculate SVG chart dimensions
  const chartWidth = 100; // will use viewBox with percentage-based approach
  const svgWidth = 800;
  const svgHeight = CHART_HEIGHT + PADDING_TOP + PADDING_BOTTOM;
  const plotWidth = svgWidth - PADDING_LEFT - PADDING_RIGHT;
  const plotHeight = CHART_HEIGHT;

  // Map data to points
  const points = data.data.map((d, i) => {
    const x = PADDING_LEFT + (data.data.length === 1 ? plotWidth / 2 : (i / (data.data.length - 1)) * plotWidth);
    const y = PADDING_TOP + plotHeight - (d.count / yAxisMax) * plotHeight;
    return { x, y, count: d.count, label: formatLabel(d.period, data.groupBy) };
  });

  // Build line path
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  // Build area path (fill under line)
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${PADDING_TOP + plotHeight} L ${points[0].x} ${PADDING_TOP + plotHeight} Z`;

  // X-axis label selection
  const maxXLabels = 10;
  const xLabelStep = Math.max(1, Math.ceil(data.data.length / maxXLabels));

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * svgWidth;

    // Find closest point
    let closest = points[0];
    let closestDist = Infinity;
    for (const p of points) {
      const dist = Math.abs(p.x - mouseX);
      if (dist < closestDist) {
        closestDist = dist;
        closest = p;
      }
    }
    if (closestDist < plotWidth / points.length + 20) {
      setTooltip(closest);
    } else {
      setTooltip(null);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          Changes Over Time
        </h3>
        <span className="text-xs text-slate-400">
          {periodLabels[dateRange] || dateRange + " days"} &bull; {groupLabel}
        </span>
      </div>

      {/* SVG Line Chart */}
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto"
          style={{ maxHeight: "280px" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTooltip(null)}
        >
          {/* Y-axis grid lines + labels */}
          {yTicks.map((tick) => {
            const y = PADDING_TOP + plotHeight - (tick / yAxisMax) * plotHeight;
            return (
              <g key={tick}>
                <line
                  x1={PADDING_LEFT}
                  y1={y}
                  x2={svgWidth - PADDING_RIGHT}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <text
                  x={PADDING_LEFT - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[11px]"
                  fill="#94a3b8"
                  fontSize="11"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Y-axis label */}
          <text
            x={14}
            y={PADDING_TOP + plotHeight / 2}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="10"
            transform={`rotate(-90, 14, ${PADDING_TOP + plotHeight / 2})`}
          >
            # Changes
          </text>

          {/* Area fill under line */}
          <path d={areaPath} fill={FILL_COLOR} />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke={LINE_COLOR}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={tooltip?.x === p.x ? 5 : 3}
              fill="white"
              stroke={DOT_COLOR}
              strokeWidth="2"
              className="transition-all duration-150"
            />
          ))}

          {/* X-axis labels */}
          {data.data.map((d, i) => {
            if (i % xLabelStep !== 0 && i !== data.data.length - 1) return null;
            const x = points[i].x;
            return (
              <text
                key={i}
                x={x}
                y={svgHeight - 8}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="10"
              >
                {formatLabel(d.period, data.groupBy)}
              </text>
            );
          })}

          {/* Tooltip vertical line */}
          {tooltip && (
            <>
              <line
                x1={tooltip.x}
                y1={PADDING_TOP}
                x2={tooltip.x}
                y2={PADDING_TOP + plotHeight}
                stroke="#cbd5e1"
                strokeWidth="1"
                strokeDasharray="4 2"
              />
            </>
          )}
        </svg>

        {/* Floating tooltip */}
        {tooltip && (
          <div
            className="absolute bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg pointer-events-none whitespace-nowrap z-10"
            style={{
              left: `${(tooltip.x / svgWidth) * 100}%`,
              top: `${((tooltip.y - 12) / svgHeight) * 100}%`,
              transform: "translate(-50%, -100%)",
            }}
          >
            {tooltip.count} {tooltip.count === 1 ? "change" : "changes"} &bull; {tooltip.label}
          </div>
        )}
      </div>

      {/* Summary line */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {data.data.reduce((sum, d) => sum + d.count, 0)} total changes in period
        </span>
        <span className="text-xs text-slate-400">
          Avg: {(data.data.reduce((sum, d) => sum + d.count, 0) / data.data.length).toFixed(1)} / {data.groupBy}
        </span>
      </div>
    </div>
  );
}

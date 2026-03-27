"use client";

import { useState, useEffect } from "react";
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
  return format(startOfMonth(date), "MMM yyyy");
}

export default function TimelineChart({
  dateRange,
  platform,
  impactLevel,
}: TimelineChartProps) {
  const [data, setData] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);

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
        <div className="h-40 bg-slate-100 rounded animate-pulse" />
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
            <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          Changes Over Time
        </h3>
        <p className="text-sm text-slate-400 text-center py-8">No data for selected period</p>
      </div>
    );
  }

  const maxCount = Math.max(...data.data.map((d) => d.count), 1);
  const barColor = "#6366f1"; // Indigo

  // Period labels
  const periodLabels: Record<string, string> = {
    "7": "Past 7 Days",
    "14": "Past 14 Days",
    "30": "Past 30 Days",
    "90": "Past 90 Days",
    "365": "Past Year",
  };

  const groupLabel =
    data.groupBy === "day" ? "by day" : data.groupBy === "week" ? "by week" : "by month";

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
            <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          Changes Over Time
        </h3>
        <span className="text-xs text-slate-400">
          {periodLabels[dateRange] || dateRange + " days"} &bull; {groupLabel}
        </span>
      </div>

      {/* Chart area */}
      <div className="relative">
        {/* Y-axis reference lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="border-b border-slate-100 w-full" />
          ))}
        </div>

        {/* Bars */}
        <div className="relative flex items-end gap-1 h-40" style={{ minHeight: "160px" }}>
          {data.data.map((point, i) => {
            const heightPct = Math.max((point.count / maxCount) * 100, 4);
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center justify-end group relative"
                style={{ minWidth: "20px" }}
              >
                {/* Tooltip */}
                <div className="absolute -top-8 bg-slate-900 text-white text-[10px] font-semibold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {point.count} {point.count === 1 ? "update" : "updates"}
                </div>

                {/* Bar */}
                <div
                  className="w-full rounded-t transition-all duration-300 hover:opacity-80 cursor-default"
                  style={{
                    height: `${heightPct}%`,
                    backgroundColor: barColor,
                    maxWidth: "48px",
                    opacity: 0.85,
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* X-axis labels */}
        <div className="flex gap-1 mt-2">
          {data.data.map((point, i) => {
            // Show every label for small datasets, skip some for larger ones
            const showLabel =
              data.data.length <= 14 ||
              i === 0 ||
              i === data.data.length - 1 ||
              i % Math.ceil(data.data.length / 8) === 0;

            return (
              <div
                key={i}
                className="flex-1 text-center"
                style={{ minWidth: "20px" }}
              >
                {showLabel && (
                  <span className="text-[9px] text-slate-400 leading-none">
                    {formatLabel(point.period, data.groupBy)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary line */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {data.data.reduce((sum, d) => sum + d.count, 0)} total updates in period
        </span>
        <span className="text-xs text-slate-400">
          Avg: {(data.data.reduce((sum, d) => sum + d.count, 0) / data.data.length).toFixed(1)} / {data.groupBy}
        </span>
      </div>
    </div>
  );
}

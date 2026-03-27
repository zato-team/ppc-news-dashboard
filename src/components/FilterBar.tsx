"use client";

import { PLATFORM_LABELS, IMPACT_LABELS, IMPACT_COLORS, type Platform, type ImpactLevel } from "@/lib/sources";

interface FilterBarProps {
  platform: Platform | "all";
  onPlatformChange: (p: Platform | "all") => void;
  impactLevel: ImpactLevel | "all";
  onImpactLevelChange: (i: ImpactLevel | "all") => void;
  search: string;
  onSearchChange: (s: string) => void;
  dateRange: string;
  onDateRangeChange: (d: string) => void;
}

export default function FilterBar({
  platform,
  onPlatformChange,
  impactLevel,
  onImpactLevelChange,
  search,
  onSearchChange,
  dateRange,
  onDateRangeChange,
}: FilterBarProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 mb-6 space-y-4">
      {/* Top row: Platform + Search + Date */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Platform filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onPlatformChange("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              platform === "all"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All
          </button>
          {Object.entries(PLATFORM_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => onPlatformChange(key as Platform)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                platform === key
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>

        {/* Date range */}
        <select
          value={dateRange}
          onChange={(e) => onDateRangeChange(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          <option value="7">Last 7 days</option>
          <option value="14">Last 14 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* Bottom row: Impact level filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mr-1">
          Impact:
        </span>
        <button
          onClick={() => onImpactLevelChange("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            impactLevel === "all"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          All Levels
        </button>
        {(Object.entries(IMPACT_LABELS) as [ImpactLevel, string][]).map(
          ([key, label]) => (
            <button
              key={key}
              onClick={() => onImpactLevelChange(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border`}
              style={
                impactLevel === key
                  ? {
                      backgroundColor: IMPACT_COLORS[key],
                      color: "white",
                      borderColor: IMPACT_COLORS[key],
                    }
                  : {
                      backgroundColor: "white",
                      color: IMPACT_COLORS[key],
                      borderColor: IMPACT_COLORS[key] + "40",
                    }
              }
            >
              {label}
            </button>
          )
        )}
      </div>
    </div>
  );
}

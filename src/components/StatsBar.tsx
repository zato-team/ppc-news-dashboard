"use client";

import { PLATFORM_LABELS, PLATFORM_COLORS, type Platform } from "@/lib/sources";

interface Stats {
  total: number;
  thisWeek: number;
  byPlatform: Record<string, number>;
  lastUpdated: string | null;
}

export default function StatsBar({ stats }: { stats: Stats | null }) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-20 mb-3" />
            <div className="h-8 bg-slate-200 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    { label: "Total Articles", value: stats.total, color: "#1e293b" },
    { label: "This Week", value: stats.thisWeek, color: "#6366f1" },
    ...Object.entries(PLATFORM_LABELS).map(([key, label]) => ({
      label,
      value: stats.byPlatform[key] || 0,
      color: PLATFORM_COLORS[key as Platform],
    })),
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
        >
          <p className="text-sm text-slate-500 mb-1">{card.label}</p>
          <p className="text-3xl font-bold" style={{ color: card.color }}>
            {card.value.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}

"use client";

import {
  IMPACT_COLORS,
  IMPACT_BG_COLORS,
  IMPACT_BORDER_COLORS,
  PLATFORM_LABELS,
  PLATFORM_COLORS,
  type Platform,
  type ImpactLevel,
} from "@/lib/sources";

interface Article {
  id: number;
  title: string;
  url: string;
  summary: string;
  source_name: string;
  platform: Platform;
  impact_level: ImpactLevel;
  published_at: string;
}

// Truncate title to ~5 words max
function brevity(title: string): string {
  const words = title.split(/\s+/);
  if (words.length <= 5) return title;
  return words.slice(0, 5).join(" ") + "...";
}

const IMPACT_ORDER: ImpactLevel[] = [
  "action-required",
  "may-impact",
  "good-to-know",
];

const SECTION_LABELS: Record<ImpactLevel, string> = {
  "action-required": "Action Required",
  "may-impact": "May Impact",
  "good-to-know": "Good to Know",
};

const SECTION_ICONS: Record<ImpactLevel, string> = {
  "action-required": "!!",
  "may-impact": "!",
  "good-to-know": "i",
};

export default function QuickScan({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null;

  // Group by impact level
  const grouped: Record<ImpactLevel, Article[]> = {
    "action-required": [],
    "may-impact": [],
    "good-to-know": [],
  };
  for (const a of articles) {
    const level = a.impact_level || "good-to-know";
    grouped[level].push(a);
  }

  const scrollToArticle = (id: number) => {
    const el = document.getElementById(`article-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      // Brief highlight flash
      el.classList.add("ring-4", "ring-blue-400", "ring-opacity-60");
      setTimeout(() => {
        el.classList.remove("ring-4", "ring-blue-400", "ring-opacity-60");
      }, 2000);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 mb-6 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-slate-400"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          <h2 className="text-sm font-semibold text-slate-700">
            Quick Scan
          </h2>
          <span className="text-xs text-slate-400">
            {articles.length} updates &mdash; click any to jump to details
          </span>
        </div>
      </div>

      {/* Bullet sections */}
      <div className="p-5 space-y-4">
        {IMPACT_ORDER.map((level) => {
          const items = grouped[level];
          if (items.length === 0) return null;

          const color = IMPACT_COLORS[level];
          const bg = IMPACT_BG_COLORS[level];
          const border = IMPACT_BORDER_COLORS[level];
          const icon = SECTION_ICONS[level];

          return (
            <div key={level}>
              {/* Section label */}
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black text-white"
                  style={{ backgroundColor: color }}
                >
                  {icon}
                </span>
                <span
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color }}
                >
                  {SECTION_LABELS[level]}
                </span>
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: bg, color, border: `1px solid ${border}` }}
                >
                  {items.length}
                </span>
              </div>

              {/* Bullet list */}
              <ul className="space-y-1 ml-1">
                {items.map((article) => (
                  <li key={article.id}>
                    <button
                      onClick={() => scrollToArticle(article.id)}
                      className="w-full text-left flex items-center gap-2 group px-2.5 py-1.5 rounded-lg transition-colors hover:bg-slate-50"
                    >
                      {/* Color dot */}
                      <span
                        className="flex-shrink-0 w-2 h-2 rounded-full"
                        style={{ backgroundColor: color }}
                      />

                      {/* Brief title (5 words max) */}
                      <span
                        className="text-sm font-medium truncate group-hover:underline"
                        style={{ color }}
                      >
                        {brevity(article.title)}
                      </span>

                      {/* Platform chip */}
                      <span
                        className="flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded text-white"
                        style={{
                          backgroundColor: PLATFORM_COLORS[article.platform],
                        }}
                      >
                        {PLATFORM_LABELS[article.platform]}
                      </span>

                      {/* Arrow */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="flex-shrink-0 text-slate-300 group-hover:text-blue-500 transition-colors ml-auto"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

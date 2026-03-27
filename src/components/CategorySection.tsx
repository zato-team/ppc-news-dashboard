"use client";

import ArticleCard from "./ArticleCard";
import {
  CATEGORY_ORDER,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  detectCategory,
  type ArticleCategory,
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

export default function CategorySection({ articles }: { articles: Article[] }) {
  // Group articles by category
  const grouped: Record<ArticleCategory, Article[]> = {
    "google-merchant-center": [],
    "search-network": [],
    "shopping-ads": [],
    "pmax": [],
    "dgen-display": [],
    "youtube-ads": [],
    "general-settings": [],
    "general-platform": [],
  };

  for (const article of articles) {
    const cat = detectCategory(article.title, article.summary, article.platform);
    grouped[cat].push(article);
  }

  return (
    <div className="space-y-8">
      {CATEGORY_ORDER.map((cat) => {
        const items = grouped[cat];
        const icon = CATEGORY_ICONS[cat];
        const label = CATEGORY_LABELS[cat];

        return (
          <div key={cat}>
            {/* Category header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">{icon}</span>
                <h3 className="text-base font-bold text-slate-800">{label}</h3>
                <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {items.length}
                </span>
              </div>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Articles or empty state */}
            {items.length === 0 ? (
              <div className="bg-slate-50 rounded-lg border border-dashed border-slate-200 py-6 text-center">
                <p className="text-sm text-slate-400">No updates in this category</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

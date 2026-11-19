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

interface CategorySectionProps {
  articles: Article[];
  filterCategory: ArticleCategory | "all";
}

export default function CategorySection({ articles, filterCategory }: CategorySectionProps) {
  // Group articles by category
  const grouped: Record<ArticleCategory, Article[]> = {
    "google-merchant-center": [],
    "search-network": [],
    "shopping-ads": [],
    "pmax": [],
    "dgen-display": [],
    "youtube-ads": [],
    "microsoft-ads": [],
    "general-settings": [],
    "general-platform": [],
    "api-changes": [],
  };

  for (const article of articles) {
    const cat = detectCategory(article.title, article.summary, article.platform, article.source_name);
    grouped[cat].push(article);
  }

  // If a specific category is selected, only show that one
  if (filterCategory !== "all") {
    const items = grouped[filterCategory];
    const icon = CATEGORY_ICONS[filterCategory];
    const label = CATEGORY_LABELS[filterCategory];

    return (
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">{icon}</span>
              <h3 className="text-base font-bold text-slate-800">{label}</h3>
              <span className="text-xs font-semibold text-white bg-blue-500 px-2.5 py-0.5 rounded-full">
                {items.length}
              </span>
            </div>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          {items.length === 0 ? (
            <div className="bg-slate-50 rounded-lg border border-dashed border-slate-200 py-8 text-center">
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
      </div>
    );
  }

  // API changes get their own pinned section at the very bottom, outside the PPC sort.
  const apiChanges = grouped["api-changes"];
  const ppcCategoryOrder = CATEGORY_ORDER.filter((cat) => cat !== "api-changes");

  // Sort: categories with articles first (by count desc), empty ones at the bottom
  const sortedCategories = [...ppcCategoryOrder].sort((a, b) => {
    const aCount = grouped[a].length;
    const bCount = grouped[b].length;
    // Both have articles or both empty → keep relative order by count
    if (aCount > 0 && bCount > 0) return bCount - aCount;
    // One has articles, one doesn't → articles first
    if (aCount > 0) return -1;
    if (bCount > 0) return 1;
    return 0;
  });

  const withUpdates = sortedCategories.filter((cat) => grouped[cat].length > 0);
  const withoutUpdates = sortedCategories.filter((cat) => grouped[cat].length === 0);

  return (
    <div className="space-y-8">
      {/* Categories with updates */}
      {withUpdates.map((cat) => {
        const items = grouped[cat];
        const icon = CATEGORY_ICONS[cat];
        const label = CATEGORY_LABELS[cat];

        return (
          <div key={cat}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">{icon}</span>
                <h3 className="text-base font-bold text-slate-800">{label}</h3>
                <span className="text-xs font-semibold text-white bg-blue-500 px-2.5 py-0.5 rounded-full">
                  {items.length}
                </span>
              </div>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="space-y-4">
              {items.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        );
      })}

      {/* Separator if both groups exist */}
      {withUpdates.length > 0 && withoutUpdates.length > 0 && (
        <div className="flex items-center gap-3 pt-4">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">No updates</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>
      )}

      {/* Empty categories grouped at bottom */}
      {withoutUpdates.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {withoutUpdates.map((cat) => {
            const icon = CATEGORY_ICONS[cat];
            const label = CATEGORY_LABELS[cat];
            return (
              <div
                key={cat}
                className="bg-slate-50 rounded-lg border border-dashed border-slate-200 py-4 px-3 text-center"
              >
                <span className="text-lg">{icon}</span>
                <p className="text-xs font-medium text-slate-400 mt-1">{label}</p>
                <p className="text-[10px] text-slate-300 mt-0.5">No updates</p>
              </div>
            );
          })}
        </div>
      )}

      {/* API Changes — pinned at the very bottom, set apart from PPC content */}
      {apiChanges.length > 0 && (
        <div className="pt-8 mt-8 border-t-2 border-dashed border-slate-200">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center gap-2">
              <span className="text-lg grayscale opacity-70">{CATEGORY_ICONS["api-changes"]}</span>
              <h3 className="text-base font-bold text-slate-500">
                {CATEGORY_LABELS["api-changes"]}
              </h3>
              <span className="text-xs font-semibold text-white bg-slate-400 px-2.5 py-0.5 rounded-full">
                {apiChanges.length}
              </span>
            </div>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Backend &amp; developer-facing API updates — technical changes, not typically campaign content.
          </p>
          <div className="space-y-4 opacity-90">
            {apiChanges.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import type { OpportunityTier } from "@/lib/opportunities";
import {
  IMPACT_LABELS,
  IMPACT_COLORS,
  detectCategory,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  type Platform,
  type ImpactLevel,
} from "@/lib/sources";

interface OpportunityArticle {
  id: number;
  title: string;
  url: string;
  summary: string;
  source_name: string;
  platform: Platform;
  impact_level: ImpactLevel;
  published_at: string;
}

interface Opportunity {
  article: OpportunityArticle;
  coverageCount: number;
  tier: OpportunityTier;
  daysSincePublished: number;
  matchedArticleTitles: string[];
}

interface ContentOpportunitiesProps {
  dateRange: string;
}

const TIER_CONFIG: Record<
  OpportunityTier,
  { label: string; color: string; bg: string; border: string; description: string }
> = {
  gold: {
    label: "Uncovered",
    color: "#B45309",
    bg: "#FFFBEB",
    border: "#FDE68A",
    description: "No industry coverage yet — write about this first!",
  },
  silver: {
    label: "Low Coverage",
    color: "#4B5563",
    bg: "#F9FAFB",
    border: "#D1D5DB",
    description: "Minimal industry coverage — still a strong topic",
  },
  saturated: {
    label: "Saturated",
    color: "#9CA3AF",
    bg: "#F9FAFB",
    border: "#E5E7EB",
    description: "Widely covered — harder to stand out",
  },
};

export default function ContentOpportunities({ dateRange }: ContentOpportunitiesProps) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [showSaturated, setShowSaturated] = useState(false);

  useEffect(() => {
    async function fetchOpportunities() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ days: dateRange === "all" ? "90" : dateRange });
        const res = await fetch(`/api/opportunities?${params}`);
        if (res.ok) {
          const data = await res.json();
          setOpportunities(data.opportunities);
        }
      } catch {
        // non-critical
      }
      setLoading(false);
    }
    fetchOpportunities();
  }, [dateRange]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6">
        <div className="h-5 bg-slate-200 rounded w-48 mb-4 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const gold = opportunities.filter((o) => o.tier === "gold");
  const silver = opportunities.filter((o) => o.tier === "silver");
  const saturated = opportunities.filter((o) => o.tier === "saturated");
  const actionable = gold.length + silver.length;

  if (opportunities.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 mb-6 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
            <span className="text-amber-600 text-sm font-bold">!</span>
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-slate-900">
              Content Opportunities
            </h3>
            <p className="text-xs text-slate-500">
              {actionable} blog topic{actionable !== 1 ? "s" : ""} with low industry coverage
              {saturated.length > 0 && ` · ${saturated.length} saturated`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {gold.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">
              {gold.length} uncovered
            </span>
          )}
          <svg
            className={`w-5 h-5 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-6 pb-5 space-y-3">
          {/* Gold opportunities */}
          {gold.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                  Uncovered — Write about these first
                </span>
              </div>
              <div className="space-y-2">
                {gold.map((opp) => (
                  <OpportunityCard key={opp.article.id} opportunity={opp} />
                ))}
              </div>
            </div>
          )}

          {/* Silver opportunities */}
          {silver.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 mt-4">
                <div className="w-3 h-3 rounded-full bg-slate-300" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Low Coverage — Strong topics
                </span>
              </div>
              <div className="space-y-2">
                {silver.map((opp) => (
                  <OpportunityCard key={opp.article.id} opportunity={opp} />
                ))}
              </div>
            </div>
          )}

          {/* Saturated — collapsed by default */}
          {saturated.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowSaturated(!showSaturated)}
                className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                <div className="w-3 h-3 rounded-full bg-slate-200" />
                <span className="font-semibold uppercase tracking-wide">
                  Saturated — {saturated.length} topics everyone is covering
                </span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform ${showSaturated ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showSaturated && (
                <div className="space-y-2 mt-2">
                  {saturated.map((opp) => (
                    <OpportunityCard key={opp.article.id} opportunity={opp} />
                  ))}
                </div>
              )}
            </div>
          )}

          {gold.length === 0 && silver.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">
              All recent announcements are well-covered by industry publications.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const { article, coverageCount, tier, daysSincePublished, matchedArticleTitles } = opportunity;
  const config = TIER_CONFIG[tier];
  const category = detectCategory(article.title, article.summary, article.platform as Platform);
  const [showMatches, setShowMatches] = useState(false);

  return (
    <div
      className="rounded-lg p-4 flex gap-3 transition-colors"
      style={{
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
      }}
    >
      {/* Left color bar */}
      <div
        className="w-1 rounded-full flex-shrink-0"
        style={{ backgroundColor: tier === "gold" ? "#F59E0B" : tier === "silver" ? "#9CA3AF" : "#D1D5DB" }}
      />

      <div className="flex-1 min-w-0">
        {/* Title + link */}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-slate-900 hover:text-blue-600 transition-colors line-clamp-2 block"
        >
          {article.title}
        </a>

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {/* Tier badge */}
          <span
            className="px-2 py-0.5 text-[10px] font-bold rounded-full uppercase"
            style={{ color: config.color, backgroundColor: `${config.color}15` }}
          >
            {config.label}
          </span>

          {/* Impact badge */}
          <span
            className="px-2 py-0.5 text-[10px] font-bold rounded-full"
            style={{
              color: IMPACT_COLORS[article.impact_level as ImpactLevel],
              backgroundColor: `${IMPACT_COLORS[article.impact_level as ImpactLevel]}15`,
            }}
          >
            {IMPACT_LABELS[article.impact_level as ImpactLevel]}
          </span>

          {/* Category badge */}
          <span className="text-[10px] text-slate-500">
            {CATEGORY_ICONS[category]} {CATEGORY_LABELS[category]}
          </span>

          {/* Freshness */}
          <span className="text-[10px] text-slate-400">
            {daysSincePublished === 0
              ? "Today"
              : daysSincePublished === 1
              ? "Yesterday"
              : `${daysSincePublished}d ago`}
          </span>

          {/* Coverage count */}
          <span className="text-[10px] text-slate-400">
            {coverageCount === 0
              ? "0 industry articles"
              : `${coverageCount} industry article${coverageCount !== 1 ? "s" : ""}`}
          </span>
        </div>

        {/* Summary */}
        <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
          {article.summary}
        </p>

        {/* Matched articles (expandable) */}
        {matchedArticleTitles.length > 0 && (
          <button
            onClick={() => setShowMatches(!showMatches)}
            className="text-[10px] text-slate-400 hover:text-slate-600 mt-1 underline"
          >
            {showMatches ? "Hide" : "Show"} {matchedArticleTitles.length} matching article{matchedArticleTitles.length !== 1 ? "s" : ""}
          </button>
        )}
        {showMatches && matchedArticleTitles.length > 0 && (
          <ul className="mt-1 space-y-0.5">
            {matchedArticleTitles.map((title, i) => (
              <li key={i} className="text-[10px] text-slate-400 pl-3 relative before:content-[''] before:absolute before:left-0 before:top-1.5 before:w-1.5 before:h-1.5 before:bg-slate-300 before:rounded-full">
                {title}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

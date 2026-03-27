"use client";

import { useState, useEffect, useCallback } from "react";
import StatsBar from "@/components/StatsBar";
import FilterBar from "@/components/FilterBar";
import ArticleCard from "@/components/ArticleCard";
import type { Platform } from "@/lib/sources";

interface Article {
  id: number;
  title: string;
  url: string;
  summary: string;
  source_name: string;
  platform: Platform;
  published_at: string;
}

interface Stats {
  total: number;
  thisWeek: number;
  byPlatform: Record<string, number>;
  lastUpdated: string | null;
}

export default function Dashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [platform, setPlatform] = useState<Platform | "all">("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("30");
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [setupNeeded, setSetupNeeded] = useState(false);

  const fetchArticles = useCallback(
    async (reset = true) => {
      setLoading(reset);
      const currentOffset = reset ? 0 : offset;

      const params = new URLSearchParams();
      if (platform !== "all") params.set("platform", platform);
      if (search) params.set("search", search);
      if (dateRange !== "all") {
        const start = new Date();
        start.setDate(start.getDate() - parseInt(dateRange));
        params.set("startDate", start.toISOString());
      }
      params.set("limit", "30");
      params.set("offset", String(currentOffset));

      try {
        const res = await fetch(`/api/articles?${params}`);
        if (!res.ok) {
          setSetupNeeded(true);
          setLoading(false);
          return;
        }
        const data = await res.json();

        if (reset) {
          setArticles(data.articles);
        } else {
          setArticles((prev) => [...prev, ...data.articles]);
        }
        setHasMore(data.hasMore);
        setOffset(currentOffset + data.articles.length);
        setSetupNeeded(false);
      } catch {
        setSetupNeeded(true);
      }
      setLoading(false);
    },
    [platform, search, dateRange, offset]
  );

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) {
        setStats(await res.json());
      }
    } catch {
      // Stats are non-critical
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchArticles(true);
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform, dateRange]);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchArticles(true);
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleFetchNow = async () => {
    setFetching(true);
    try {
      await fetch("/api/fetch-news");
      await fetchArticles(true);
      await fetchStats();
    } catch {
      // handled silently
    }
    setFetching(false);
  };

  const handleSetup = async () => {
    setFetching(true);
    try {
      await fetch("/api/setup", { method: "POST" });
      await fetch("/api/fetch-news");
      await fetchArticles(true);
      await fetchStats();
      setSetupNeeded(false);
    } catch {
      // handled silently
    }
    setFetching(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                PPC News Dashboard
              </h1>
              <p className="text-slate-400 mt-1 text-sm">
                Google Ads &bull; Microsoft Ads &bull; Merchant Center
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">
                ZATO Marketing
              </span>
              <button
                onClick={handleFetchNow}
                disabled={fetching}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {fetching ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Fetching...
                  </>
                ) : (
                  "Fetch Now"
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {setupNeeded ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-slate-100 text-center">
            <div className="text-5xl mb-4">🔧</div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Set Up Your Dashboard
            </h2>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Click below to initialize the database and fetch your first batch of
              PPC news articles.
            </p>
            <button
              onClick={handleSetup}
              disabled={fetching}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium rounded-lg transition-colors"
            >
              {fetching ? "Setting up..." : "Initialize Dashboard"}
            </button>
          </div>
        ) : (
          <>
            <StatsBar stats={stats} />
            <FilterBar
              platform={platform}
              onPlatformChange={(p) => {
                setPlatform(p);
                setOffset(0);
              }}
              search={search}
              onSearchChange={setSearch}
              dateRange={dateRange}
              onDateRangeChange={(d) => {
                setDateRange(d);
                setOffset(0);
              }}
            />

            {/* Articles */}
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl p-5 shadow-sm animate-pulse"
                  >
                    <div className="flex gap-2 mb-3">
                      <div className="h-5 bg-slate-200 rounded-full w-24" />
                      <div className="h-5 bg-slate-200 rounded w-32" />
                    </div>
                    <div className="h-5 bg-slate-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-slate-200 rounded w-full mb-1" />
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : articles.length === 0 ? (
              <div className="bg-white rounded-xl p-12 shadow-sm border border-slate-100 text-center">
                <p className="text-slate-500">
                  No articles found. Try adjusting your filters or click
                  &ldquo;Fetch Now&rdquo; to pull the latest news.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>

                {hasMore && (
                  <div className="text-center mt-8">
                    <button
                      onClick={() => fetchArticles(false)}
                      className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Load More
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-xs text-slate-400">
          PPC News Dashboard &mdash; Built for ZATO Marketing &mdash; Aggregating
          from official blogs + industry sources
        </div>
      </footer>
    </div>
  );
}

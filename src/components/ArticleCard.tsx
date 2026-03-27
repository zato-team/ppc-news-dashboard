"use client";

import { PLATFORM_LABELS, PLATFORM_COLORS, type Platform } from "@/lib/sources";

interface Article {
  id: number;
  title: string;
  url: string;
  summary: string;
  source_name: string;
  platform: Platform;
  published_at: string;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ArticleCard({ article }: { article: Article }) {
  const platformColor = PLATFORM_COLORS[article.platform];
  const platformLabel = PLATFORM_LABELS[article.platform];

  return (
    <article className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all hover:border-slate-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Platform badge + source */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: platformColor }}
            >
              {platformLabel}
            </span>
            <span className="text-xs text-slate-400">{article.source_name}</span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs text-slate-400">
              {timeAgo(article.published_at)}
            </span>
          </div>

          {/* Title */}
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-base font-semibold text-slate-900 hover:text-blue-600 transition-colors mb-2 line-clamp-2"
          >
            {article.title}
          </a>

          {/* Summary */}
          <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">
            {article.summary}
          </p>
        </div>

        {/* External link icon */}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-blue-500 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
    </article>
  );
}

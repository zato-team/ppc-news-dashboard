export type Platform = "google-ads" | "microsoft-ads" | "merchant-center";
export type ImpactLevel = "action-required" | "may-impact" | "good-to-know";
export type ArticleCategory =
  | "google-merchant-center"
  | "search-network"
  | "shopping-ads"
  | "pmax"
  | "dgen-display"
  | "youtube-ads"
  | "microsoft-ads"
  | "general-settings"
  | "general-platform";

export type SourceType = "official" | "industry";

export interface FeedSource {
  name: string;
  url: string;
  platform: Platform;
  type: "rss" | "atom";
  sourceType: SourceType;
}

export const FEED_SOURCES: FeedSource[] = [
  // Google Ads official
  {
    name: "Google Ads Blog",
    url: "https://blog.google/products/ads-commerce/rss/",
    platform: "google-ads",
    type: "rss",
    sourceType: "official",
  },
  {
    name: "Google Ads Developer Blog",
    url: "https://ads-developers.googleblog.com/feeds/posts/default",
    platform: "google-ads",
    type: "atom",
    sourceType: "official",
  },
  // Google Merchant Center
  {
    name: "Google Merchant Center Blog",
    url: "https://blog.google/products/shopping/rss/",
    platform: "merchant-center",
    type: "rss",
    sourceType: "official",
  },
  // Microsoft Ads
  {
    name: "Microsoft Advertising Blog",
    url: "https://about.ads.microsoft.com/en-us/blog/rss",
    platform: "microsoft-ads",
    type: "rss",
    sourceType: "official",
  },
  // Industry sources
  {
    name: "Search Engine Land",
    url: "https://searchengineland.com/feed",
    platform: "google-ads",
    type: "rss",
    sourceType: "industry",
  },
  {
    name: "PPC Hero",
    url: "https://www.ppchero.com/feed/",
    platform: "google-ads",
    type: "rss",
    sourceType: "industry",
  },
  {
    name: "Search Engine Journal - PPC",
    url: "https://www.searchenginejournal.com/category/pay-per-click/feed/",
    platform: "google-ads",
    type: "rss",
    sourceType: "industry",
  },
];

export const OFFICIAL_SOURCE_NAMES = FEED_SOURCES
  .filter((s) => s.sourceType === "official")
  .map((s) => s.name);

// Keywords to filter articles from industry sources (must match at least one)
export const PLATFORM_KEYWORDS: Record<Platform, string[]> = {
  "google-ads": [
    "google ads",
    "google advertising",
    "adwords",
    "pmax",
    "performance max",
    "google search ads",
    "responsive search",
    "demand gen",
    "google campaign",
    "google bidding",
    "smart bidding",
    "broad match",
    "phrase match",
    "exact match",
  ],
  "microsoft-ads": [
    "microsoft ads",
    "microsoft advertising",
    "bing ads",
    "microsoft audience",
    "microsoft shopping",
  ],
  "merchant-center": [
    "merchant center",
    "google merchant",
    "google shopping",
    "product feed",
    "shopping feed",
    "free listings",
    "google product",
  ],
};

export const PLATFORM_LABELS: Record<Platform, string> = {
  "google-ads": "Google Ads",
  "microsoft-ads": "Microsoft Ads",
  "merchant-center": "Merchant Center",
};

export const PLATFORM_COLORS: Record<Platform, string> = {
  "google-ads": "#4285F4",
  "microsoft-ads": "#00A4EF",
  "merchant-center": "#34A853",
};

// --- Impact Level System ---

export const IMPACT_LABELS: Record<ImpactLevel, string> = {
  "action-required": "Important Update",
  "may-impact": "May Impact",
  "good-to-know": "Good to Know",
};

export const IMPACT_COLORS: Record<ImpactLevel, string> = {
  "action-required": "#DC2626",
  "may-impact": "#D97706",
  "good-to-know": "#16A34A",
};

export const IMPACT_BG_COLORS: Record<ImpactLevel, string> = {
  "action-required": "#FEF2F2",
  "may-impact": "#FFFBEB",
  "good-to-know": "#F0FDF4",
};

export const IMPACT_BORDER_COLORS: Record<ImpactLevel, string> = {
  "action-required": "#FECACA",
  "may-impact": "#FDE68A",
  "good-to-know": "#BBF7D0",
};

export const IMPACT_SORT_ORDER: Record<ImpactLevel, number> = {
  "action-required": 0,
  "may-impact": 1,
  "good-to-know": 2,
};

// --- Article Category System ---

export const CATEGORY_ORDER: ArticleCategory[] = [
  "google-merchant-center",
  "search-network",
  "shopping-ads",
  "pmax",
  "dgen-display",
  "youtube-ads",
  "microsoft-ads",
  "general-settings",
  "general-platform",
];

export const CATEGORY_LABELS: Record<ArticleCategory, string> = {
  "google-merchant-center": "Google Merchant Center",
  "search-network": "Search Network",
  "shopping-ads": "Shopping Ads",
  "pmax": "PMax",
  "dgen-display": "DGen & Display (GDN)",
  "youtube-ads": "YouTube Ads",
  "microsoft-ads": "Microsoft Ads",
  "general-settings": "General Settings Updates",
  "general-platform": "General Platform Updates",
};

export const CATEGORY_ICONS: Record<ArticleCategory, string> = {
  "google-merchant-center": "🛒",
  "search-network": "🔍",
  "shopping-ads": "🛍️",
  "pmax": "⚡",
  "dgen-display": "📺",
  "youtube-ads": "▶️",
  "microsoft-ads": "Ⓜ️",
  "general-settings": "⚙️",
  "general-platform": "📢",
};

export const CATEGORY_KEYWORDS: Record<ArticleCategory, string[]> = {
  "google-merchant-center": [
    "merchant center",
    "google merchant",
    "product feed",
    "shopping feed",
    "free listing",
    "product data",
    "merchant center next",
    "product approval",
    "feed specification",
    "feed rules",
    "supplemental feed",
  ],
  "search-network": [
    "search ads",
    "search campaign",
    "responsive search",
    "text ad",
    "search term",
    "search query",
    "keyword",
    "broad match",
    "phrase match",
    "exact match",
    "search partner",
    "search network",
    "ad copy",
    "ad extension",
    "sitelink",
    "callout",
    "structured snippet",
  ],
  "shopping-ads": [
    "shopping ads",
    "shopping campaign",
    "product listing",
    "google shopping",
    "shopping tab",
    "comparison shopping",
    "css",
    "product group",
    "shopping actions",
  ],
  "pmax": [
    "performance max",
    "pmax",
    "p-max",
    "asset group",
    "auto-created asset",
    "url expansion",
    "final url expansion",
  ],
  "dgen-display": [
    "demand gen",
    "demand generation",
    "dgen",
    "display network",
    "display ad",
    "gdn",
    "discovery ad",
    "discovery campaign",
    "responsive display",
    "display campaign",
    "gmail ad",
    "banner ad",
    "image ad",
  ],
  "youtube-ads": [
    "youtube",
    "video ad",
    "video campaign",
    "video action",
    "trueview",
    "bumper ad",
    "skippable",
    "non-skippable",
    "in-stream",
    "video reach",
    "shorts ad",
    "youtube shorts",
  ],
  "microsoft-ads": [
    "microsoft ads",
    "microsoft advertising",
    "bing ads",
    "microsoft audience",
    "microsoft shopping",
    "microsoft copilot",
    "microsoft performance max",
    "microsoft pmax",
    "bing shopping",
    "microsoft merchant",
    "microsoft campaign",
    "microsoft search",
    "xandr",
    "microsoft native",
  ],
  "general-settings": [
    "account setting",
    "billing",
    "payment",
    "access",
    "permission",
    "mcc",
    "manager account",
    "conversion tracking",
    "conversion setting",
    "attribution",
    "auto-apply",
    "recommendation",
    "optimization score",
    "account structure",
    "api change",
    "api version",
    "editor",
    "scripts",
    "automated rule",
    "label",
  ],
  "general-platform": [],  // Fallback — catches everything else
};

export function detectCategory(title: string, summary: string, platform: Platform): ArticleCategory {
  const combined = `${title} ${summary}`.toLowerCase();

  // Microsoft Ads platform articles default to that category
  if (platform === "microsoft-ads") {
    return "microsoft-ads";
  }

  // Merchant Center platform articles default to that category
  if (platform === "merchant-center") {
    // But check if it's specifically about Shopping Ads
    const isShoppingAds = CATEGORY_KEYWORDS["shopping-ads"].some((kw) => combined.includes(kw));
    if (isShoppingAds) return "shopping-ads";
    return "google-merchant-center";
  }

  // Check each category (in order) by keywords
  for (const cat of CATEGORY_ORDER) {
    if (cat === "general-platform") continue; // fallback, check last
    const keywords = CATEGORY_KEYWORDS[cat];
    if (keywords.some((kw) => combined.includes(kw))) {
      return cat;
    }
  }

  return "general-platform";
}

// Keywords that signal HIGH impact (action-required)
// These are changes that break things, deprecate features, or require immediate action
export const HIGH_IMPACT_KEYWORDS: string[] = [
  "deprecat",
  "sunset",
  "discontinu",
  "breaking change",
  "migration required",
  "must update",
  "action required",
  "mandatory",
  "deadline",
  "enforce",
  "policy change",
  "policy update",
  "will be removed",
  "no longer support",
  "no longer available",
  "will stop",
  "shutting down",
  "end of life",
  "required by",
  "comply",
  "compliance",
  "account suspension",
  "disapproval",
  "disapproved",
  "violation",
  "api v",
  "api version",
  "upgrade required",
  "migrate",
  "data loss",
  "immediately",
];

// Keywords that signal MEDIUM impact (may-impact)
// These are significant changes that could affect strategy or performance
export const MEDIUM_IMPACT_KEYWORDS: string[] = [
  "new feature",
  "now available",
  "rolling out",
  "beta",
  "alpha",
  "pilot",
  "launching",
  "launch",
  "algorithm",
  "bidding change",
  "bidding update",
  "smart bidding",
  "broad match",
  "match type",
  "audience",
  "targeting change",
  "attribution",
  "conversion tracking",
  "reporting change",
  "new report",
  "new metric",
  "interface change",
  "ui update",
  "redesign",
  "performance max",
  "pmax update",
  "demand gen",
  "new campaign type",
  "automation",
  "auto-apply",
  "recommendations",
  "expanded",
  "reduced",
  "increased limit",
  "shopping update",
  "feed requirement",
  "product listing",
  "free listing",
  "merchant update",
  "copilot",
  "ai-powered",
  "generative",
];

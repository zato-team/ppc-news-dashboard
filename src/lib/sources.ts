export type Platform = "google-ads" | "microsoft-ads" | "merchant-center";

export interface FeedSource {
  name: string;
  url: string;
  platform: Platform;
  type: "rss" | "atom";
}

export const FEED_SOURCES: FeedSource[] = [
  // Google Ads official
  {
    name: "Google Ads Blog",
    url: "https://blog.google/products/ads-commerce/rss/",
    platform: "google-ads",
    type: "rss",
  },
  {
    name: "Google Ads Developer Blog",
    url: "https://ads-developers.googleblog.com/feeds/posts/default",
    platform: "google-ads",
    type: "atom",
  },
  // Google Merchant Center
  {
    name: "Google Merchant Center Blog",
    url: "https://blog.google/products/shopping/rss/",
    platform: "merchant-center",
    type: "rss",
  },
  // Microsoft Ads
  {
    name: "Microsoft Advertising Blog",
    url: "https://about.ads.microsoft.com/en-us/blog/rss",
    platform: "microsoft-ads",
    type: "rss",
  },
  // Industry sources
  {
    name: "Search Engine Land",
    url: "https://searchengineland.com/feed",
    platform: "google-ads",
    type: "rss",
  },
  {
    name: "PPC Hero",
    url: "https://www.ppchero.com/feed/",
    platform: "google-ads",
    type: "rss",
  },
  {
    name: "Search Engine Journal - PPC",
    url: "https://www.searchenginejournal.com/category/pay-per-click/feed/",
    platform: "google-ads",
    type: "rss",
  },
];

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

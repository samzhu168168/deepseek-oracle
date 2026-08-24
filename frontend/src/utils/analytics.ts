import { track } from "@vercel/analytics";

type SafeAnalyticsProperties = {
  page_slug?: string;
  element?: string;
  element_pair?: string;
  cta_location?: string;
};

export type FunnelEvent =
  | "geo_page_view"
  | "geo_to_reading"
  | "reading_complete"
  | "compatibility_start"
  | "paywall_view"
  | "checkout_start";

export function trackFunnelEvent(event: FunnelEvent, properties: SafeAnalyticsProperties = {}) {
  track(event, properties);
}

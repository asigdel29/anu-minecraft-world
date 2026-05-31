import posthog from "posthog-js";

/**
 * Initialise PostHog product analytics with full client-side capture.
 *
 * Reads the project key from the build-time env var `VITE_PUBLIC_POSTHOG_KEY`
 * (and optional `VITE_PUBLIC_POSTHOG_HOST`, defaulting to PostHog US Cloud). If
 * no key is configured the call is a no-op, so local builds without analytics
 * keep working.
 *
 * Capture is intentionally broad: autocapture (clicks/inputs/changes),
 * pageviews and pageleaves, web-performance metrics, heatmaps, and session
 * recording (session replay is additionally gated by the project's settings in
 * the PostHog dashboard).
 */
export function initAnalytics() {
  const key = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
  if (!key) return;

  posthog.init(key, {
    api_host:
      import.meta.env.VITE_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    person_profiles: "always",
    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true,
    capture_performance: true,
    enable_heatmaps: true,
    disable_session_recording: false,
  });
}

/**
 * Initialise PostHog product analytics with full client-side capture.
 *
 * Reads the project key from the build-time env var `VITE_PUBLIC_POSTHOG_KEY`
 * (and optional `VITE_PUBLIC_POSTHOG_HOST`, defaulting to PostHog US Cloud). If
 * no key is configured the call returns immediately, so local builds without
 * analytics keep working.
 *
 * posthog-js (~195 kB) is imported dynamically so it forms its own chunk and
 * stays out of the critical-path entry bundle; capture begins as soon as that
 * chunk loads. Capture is intentionally broad: autocapture
 * (clicks/inputs/changes), pageviews and pageleaves, web-performance metrics,
 * heatmaps, and session recording (session replay is additionally gated by the
 * project's settings in the PostHog dashboard).
 *
 * @returns {Promise<void>} resolves once PostHog is initialised (or skipped).
 */
export async function initAnalytics() {
  const key = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
  if (!key) return;

  const { default: posthog } = await import("posthog-js");
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
    session_recording: {
      // The experience is a full-screen WebGL canvas, which rrweb does not
      // record by default — so without this the replay is a blank white screen.
      // Record the canvas as periodic images (kept light with a modest frame
      // rate and quality). This must also be enabled in the project's replay
      // settings (Settings -> Replay -> "Capture canvas") for frames to store,
      // and the canvas sets preserveDrawingBuffer so snapshots are not blank.
      captureCanvas: {
        canvasFps: 4,
        canvasQuality: "0.4",
      },
    },
  });
}

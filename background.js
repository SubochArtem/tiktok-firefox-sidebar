const TT_URLS = ["*://*.tiktok.com/*", "*://*.tiktokv.com/*"];

// Session cookies are dropped when the browser closes; make them persistent
// (1 year) so the login survives restarts.
function persistCookie(value) {
  if (!/;\s*(max-age|expires)=/i.test(value)) value += "; Max-Age=31536000";
  return value;
}

// Allow TikTok to be embedded in the sidebar iframe.
browser.webRequest.onHeadersReceived.addListener(
  (details) => ({
    responseHeaders: details.responseHeaders
      .filter((h) => h.name.toLowerCase() !== "x-frame-options")
      .map((h) => {
        if (h.name.toLowerCase() === "set-cookie" && h.value) {
          h.value = persistCookie(h.value);
        }
        if (h.name.toLowerCase() === "content-security-policy" && h.value) {
          h.value = h.value
            .split(";")
            .filter((d) => !d.trim().toLowerCase().startsWith("frame-ancestors"))
            .join(";");
        }
        return h;
      }),
  }),
  { urls: TT_URLS, types: ["sub_frame"] },
  ["blocking", "responseHeaders"]
);

// TikTok redirects the frame to an app store after a few videos; those pages
// refuse to be embedded, so cancel the navigation and keep the feed visible.
browser.webRequest.onBeforeRequest.addListener(
  () => {
    // Cancelling leaves the frame blank, so ask the sidebar to reload the feed.
    browser.runtime.sendMessage({ type: "reload-feed" }).catch(() => {});
    return { cancel: true };
  },
  {
    urls: ["*://apps.apple.com/*", "*://itunes.apple.com/*", "*://play.google.com/*"],
    types: ["sub_frame"],
  },
  ["blocking"]
);

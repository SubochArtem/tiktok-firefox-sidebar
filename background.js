const TT_URLS = ["*://*.tiktok.com/*", "*://*.tiktokv.com/*"];
const MOBILE_UA =
  "Mozilla/5.0 (Android 14; Mobile; rv:130.0) Gecko/130.0 Firefox/130.0";

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

// Use the mobile site so the layout fits the narrow sidebar.
browser.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    if (details.tabId !== -1) return {}; // only sidebar (non-tab) requests
    for (const h of details.requestHeaders) {
      if (h.name.toLowerCase() === "user-agent") h.value = MOBILE_UA;
    }
    return { requestHeaders: details.requestHeaders };
  },
  { urls: TT_URLS },
  ["blocking", "requestHeaders"]
);

// Toolbar button toggles the sidebar.
browser.browserAction.onClicked.addListener(() => browser.sidebarAction.toggle());

// TikTok redirects the frame to an app store after a few videos; those pages
// refuse to be embedded, so cancel the navigation and keep the feed visible.
browser.webRequest.onBeforeRequest.addListener(
  () => ({ cancel: true }),
  {
    urls: ["*://apps.apple.com/*", "*://itunes.apple.com/*", "*://play.google.com/*"],
    types: ["sub_frame"],
  },
  ["blocking"]
);

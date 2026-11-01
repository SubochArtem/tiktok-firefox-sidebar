const TT_URLS = ["*://*.tiktok.com/*", "*://*.tiktokv.com/*"];

// Session cookies are dropped when the browser closes; make them persistent
// (1 year) so the login survives restarts.
function persistCookie(value) {
  if (!/;\s*(max-age|expires)=/i.test(value)) value += "; Max-Age=31536000";
  return value;
}

const EXT_ORIGIN = browser.runtime.getURL("");
const TIKTOK_HOST = /^https?:\/\/([^/]+\.)?(tiktok|tiktokv)\.com\//;

// Only relax framing protection when the frame is nested exclusively inside
// this extension's sidebar (optionally via TikTok frames). Any other site that
// embeds TikTok keeps TikTok's anti-clickjacking headers.
function embeddedBySidebar(details) {
  const anc = details.frameAncestors;
  if (!anc || anc.length === 0) return false;
  const top = anc[anc.length - 1].url;
  if (!top.startsWith(EXT_ORIGIN)) return false;
  return anc.slice(0, -1).every((a) => TIKTOK_HOST.test(a.url));
}

// Allow TikTok to be embedded in the sidebar iframe.
browser.webRequest.onHeadersReceived.addListener(
  (details) => !embeddedBySidebar(details) ? {} : ({
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

// Toolbar button toggles the sidebar.
browser.browserAction.onClicked.addListener(() => browser.sidebarAction.toggle());

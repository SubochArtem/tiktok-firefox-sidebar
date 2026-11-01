const TT_URLS = ["*://*.tiktok.com/*", "*://*.tiktokv.com/*"];

// Session cookies are dropped when Firefox closes; keep login cookies for 30 days.
const LOGIN_COOKIES = new Set([
  "sessionid", "sessionid_ss", "sid_tt", "uid_tt", "uid_tt_ss",
  "sid_ucp_v1", "ssid_ucp_v1",
]);
function persistCookie(value) {
  const name = value.split("=")[0].trim().toLowerCase();
  if (LOGIN_COOKIES.has(name) && !/;\s*(max-age|expires)=/i.test(value)) {
    value += "; Max-Age=2592000";
  }
  return value;
}

const EXT_ORIGIN = browser.runtime.getURL("");
const TIKTOK_HOST = /^https?:\/\/([^/]+\.)?(tiktok|tiktokv)\.com\//;

// Only relax framing protection for frames nested inside this extension's sidebar,
// so other sites embedding TikTok keep its anti-clickjacking headers.
function embeddedBySidebar(details) {
  const anc = details.frameAncestors;
  if (!anc || anc.length === 0) return false;
  const top = anc[anc.length - 1].url;
  if (!top.startsWith(EXT_ORIGIN)) return false;
  return anc.slice(0, -1).every((a) => TIKTOK_HOST.test(a.url));
}

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

// TikTok redirects to an app store after a few videos and those pages can't be
// embedded; cancel the navigation and reload the feed.
browser.webRequest.onBeforeRequest.addListener(
  () => {
    browser.runtime.sendMessage({ type: "reload-feed" }).catch(() => {});
    return { cancel: true };
  },
  {
    urls: ["*://apps.apple.com/*", "*://itunes.apple.com/*", "*://play.google.com/*"],
    types: ["sub_frame"],
  },
  ["blocking"]
);

browser.browserAction.onClicked.addListener(() => browser.sidebarAction.toggle());

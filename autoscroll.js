// Auto-scroll: when the playing video finishes, go to the next one.
let enabled = false;
let lastAdvance = 0;

browser.storage.local.get("autoScroll").then((r) => (enabled = !!r.autoScroll));
browser.storage.onChanged.addListener((changes) => {
  if (changes.autoScroll) enabled = !!changes.autoScroll.newValue;
});

function next() {
  // Debounce: one advance per video (TikTok fires several events near the end).
  const now = Date.now();
  if (now - lastAdvance < 1500) return;
  lastAdvance = now;
  const btn = document.querySelector(
    '[data-e2e="feed-navigation-next"], [data-e2e="arrow-right"], button[aria-label*="next video" i]'
  );
  if (btn && !btn.disabled && btn.getAttribute("aria-disabled") !== "true") {
    console.log("[tt-auto] clicking next button");
    return btn.click();
  }
  // Fallback 1: scroll the next feed item into view.
  const items = [...document.querySelectorAll('[data-e2e="recommend-list-item-container"]')];
  const playing = [...document.querySelectorAll("video")].find((v) => !v.paused) || document.querySelector("video");
  const cur = playing && items.find((i) => i.contains(playing));
  const nextItem = cur && items[items.indexOf(cur) + 1];
  if (nextItem) {
    console.log("[tt-auto] scrolling next item into view");
    nextItem.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  // Fallback 2: keyboard and wheel, which TikTok's feed also listens to.
  console.log("[tt-auto] sending ArrowDown + wheel");
  for (const type of ["keydown", "keyup"]) {
    document.dispatchEvent(
      new KeyboardEvent(type, { key: "ArrowDown", code: "ArrowDown", keyCode: 40, which: 40, bubbles: true })
    );
  }
  (playing || document.body).dispatchEvent(
    new WheelEvent("wheel", { deltaY: 600, bubbles: true, cancelable: true })
  );
}

function onVideoEvent(e) {
  const v = e.target;
  if (!enabled || !(v instanceof HTMLVideoElement) || !v.duration) return;
  if (e.type === "ended" || v.duration - v.currentTime < 0.5) next();
}

// Media events don't bubble, so listen in the capture phase.
document.addEventListener("timeupdate", onVideoEvent, true);
document.addEventListener("ended", onVideoEvent, true);

// Auto-scroll: when the playing video reaches its end, go to the next one.
let enabled = false;
let advancedFor = null;

browser.storage.local.get("autoScroll").then((r) => (enabled = !!r.autoScroll));
browser.storage.onChanged.addListener((changes) => {
  if (changes.autoScroll) enabled = !!changes.autoScroll.newValue;
});

function next() {
  const btn = document.querySelector('[data-e2e="arrow-right"], button[aria-label*="next" i]');
  if (btn) return btn.click();
  for (const type of ["keydown", "keyup"]) {
    document.dispatchEvent(
      new KeyboardEvent(type, { key: "ArrowDown", code: "ArrowDown", keyCode: 40, bubbles: true })
    );
  }
}

// timeupdate doesn't bubble; capture it. TikTok loops videos, so 'ended' never fires.
document.addEventListener(
  "timeupdate",
  (e) => {
    const v = e.target;
    if (!enabled || !(v instanceof HTMLVideoElement) || !v.duration || v.paused) return;
    if (v.duration - v.currentTime > 0.4) {
      if (advancedFor === v && v.currentTime < 1) advancedFor = null; // video looped back; re-arm
      return;
    }
    if (advancedFor === v) return;
    advancedFor = v;
    next();
  },
  true
);

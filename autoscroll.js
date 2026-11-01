// Runs only inside the sidebar frame, not in normal TikTok tabs.
if (window.top !== window) {
  let enabled = false;
  let lastAdvance = 0;

  browser.storage.local.get("autoScroll").then((r) => (enabled = !!r.autoScroll));
  browser.storage.onChanged.addListener((changes) => {
    if (changes.autoScroll) enabled = !!changes.autoScroll.newValue;
  });

  function next() {
    // TikTok fires several events near the end of a video; advance once.
    const now = Date.now();
    if (now - lastAdvance < 1500) return;
    lastAdvance = now;

    const btn = document.querySelector(
      '[data-e2e="feed-navigation-next"], [data-e2e="arrow-right"], button[aria-label*="next video" i]'
    );
    if (btn && !btn.disabled && btn.getAttribute("aria-disabled") !== "true") {
      btn.click();
      return;
    }

    const items = [...document.querySelectorAll('[data-e2e="recommend-list-item-container"]')];
    const playing =
      [...document.querySelectorAll("video")].find((v) => !v.paused) || document.querySelector("video");
    const cur = playing && items.find((i) => i.contains(playing));
    const nextItem = cur && items[items.indexOf(cur) + 1];
    if (nextItem) nextItem.scrollIntoView({ behavior: "smooth", block: "center" });

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
}

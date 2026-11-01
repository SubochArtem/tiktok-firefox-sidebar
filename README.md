# TikTok Sidebar

Firefox extension that shows TikTok in the sidebar.

## Run
- Temporary: `about:debugging` → This Firefox → Load Temporary Add-on → pick `manifest.json`
- Or: `npx web-ext run`

Toggle the sidebar with the toolbar button or `View → Sidebar → TikTok`.

## How it works
`sidebar.html` embeds tiktok.com in an iframe. `background.js` removes `X-Frame-Options` /
CSP `frame-ancestors` from TikTok sub-frame responses.

## Notes
- If login doesn't stick, log in once on tiktok.com in a normal tab; Firefox's cookie
  partitioning can affect third-party frames.
- Personal-use tool; TikTok may change its embedding rules at any time.

## Running
- `npm start` — runs Firefox with a persistent profile (`.firefox-profile/`), so your TikTok login is kept between runs.
- Temporary add-ons (`about:debugging`, `npm start`) disappear when that Firefox closes. For a permanent install in your normal Firefox:
  1. Create API keys at https://addons.mozilla.org/developers/addon/api/key/
  2. `cp .env.example .env`, fill in `WEB_EXT_API_KEY` (JWT issuer) and `WEB_EXT_API_SECRET` (JWT secret), then `npm run sign`
  3. Open the `.xpi` from `web-ext-artifacts/` in Firefox (File → Open File) and confirm.

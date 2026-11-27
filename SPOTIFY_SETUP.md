# Connect the portfolio’s Spotify listening corner

The design and `/api/spotify` endpoint are implemented. Live listening is not connected until the owner authorizes a Spotify developer app.

## 1. Create the app

1. Open https://developer.spotify.com/dashboard and sign in to the Spotify account whose listening you want to share.
2. Create a Web API app for the portfolio. Register exactly this Redirect URI:
   `http://127.0.0.1:8888/callback`
3. Spotify’s current development-mode rules require an active Premium subscription for the app owner. If the authorizing account differs from the app owner, allowlist it in the app’s user management. Follow Spotify’s dashboard eligibility requirements.
4. Copy `.env.example` to `.env.local` in the project root. Enter the app’s client ID and client secret locally. Leave the refresh-token line empty.

Never add a `VITE_` prefix to these variables. Do not put the secret or refresh token in chat, frontend files, screenshots, or Git.

## 2. Authorize locally

In the portfolio’s VS Code terminal, run:

```text
npm run spotify:connect
```

Open the local URL printed by the helper: `http://127.0.0.1:8888/start`.
Approve the Spotify request for reading currently playing content. This makes your current track’s title, artists, album and artwork publicly visible through your portfolio. Visitors will not sign in and the site will not control playback.

The helper uses a random state check, binds only to 127.0.0.1, expires after ten minutes, and saves the refresh token directly to the Git-ignored `.env.local`. It does not print tokens. Close its browser tab when it reports success.

Stop and restart the portfolio preview after connecting. Play a track in Spotify and open About. Updates poll every 30 seconds while About and its tab are active. No playback or authorization buttons are shown to public visitors.

## 3. Deploy on Vercel later

Add `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, and `SPOTIFY_REFRESH_TOKEN` as server-side project environment variables in Vercel, then redeploy. The included `api/spotify.js` is the Vercel function; Vite provides equivalent middleware for local development and preview. A purely static host without a compatible server endpoint cannot run this integration by itself.

The public endpoint returns only a track’s display metadata or an honest idle/unavailable/unconnected state. Tokens and full upstream Spotify responses stay server-side. Spotify retries are cached and rate-limit cooldowns are respected. No audio is streamed and no track history is stored.

## Sources

- Authorization code flow: https://developer.spotify.com/documentation/web-api/tutorials/code-flow
- Redirect URI requirements: https://developer.spotify.com/documentation/web-api/concepts/redirect_uri
- Development mode eligibility: https://developer.spotify.com/documentation/web-api/concepts/quota-modes
- Currently playing API and scope: https://developer.spotify.com/documentation/web-api/reference/get-the-users-currently-playing-track

## Checks

Run `node --test tests/spotify.test.js` for the endpoint’s failure, caching, method and public-response boundaries. The real account authorization and live music display still require the owner setup above.

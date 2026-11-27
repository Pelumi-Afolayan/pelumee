// Server-only. Never expose these credentials through VITE_ variables.
export function createSpotifyHandler(env = process.env, fetcher = fetch, now = Date.now) {
  let token = null, tokenUntil = 0, snapshot = null, snapshotUntil = 0, pending = null
  async function readPlayback() {
    if (!token || now() >= tokenUntil) {
      const response = await fetcher('https://accounts.spotify.com/api/token', {
        method: 'POST', signal: AbortSignal.timeout(8000),
        headers: { Authorization: `Basic ${Buffer.from(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: env.SPOTIFY_REFRESH_TOKEN }),
      })
      if (!response.ok) throw new Error('authorization')
      const result = await response.json()
      if (!result.access_token) throw new Error('authorization')
      token = result.access_token
      tokenUntil = now() + Math.max(30, (result.expires_in || 3600) - 60) * 1000
    }
    const response = await fetcher('https://api.spotify.com/v1/me/player/currently-playing', { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(8000) })
    if (response.status === 204) return { status: 'idle' }
    if (response.status === 401) { token = null; throw new Error('authorization') }
    if (response.status === 429) {
      snapshotUntil = now() + Math.max(30, Number(response.headers.get('retry-after')) || 60) * 1000
      return { status: 'unavailable' }
    }
    if (!response.ok) throw new Error('playback')
    const result = await response.json()
    // Share track metadata only. Do not publish devices, user IDs, tokens, or private-session information.
    if (result.device?.is_private_session || !result.item || result.item.type !== 'track' || !result.item.external_urls?.spotify) return { status: 'idle' }
    const item = result.item
    return { status: result.is_playing ? 'playing' : 'paused', title: item.name, artist: item.artists.map(artist => artist.name).join(', '), album: item.album.name, image: item.album.images?.[0]?.url || '', url: item.external_urls.spotify }
  }
  return async function handler(req, res) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    if (req.method !== 'GET') { res.setHeader('Allow','GET'); res.statusCode = 405; res.end(JSON.stringify({ status: 'unavailable' })); return }
    if (!env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_CLIENT_SECRET || !env.SPOTIFY_REFRESH_TOKEN) { res.end(JSON.stringify({ status: 'not_connected' })); return }
    if (!snapshot || now() >= snapshotUntil) {
      pending ||= readPlayback().catch(() => ({ status: 'unavailable' })).then(value => { snapshot = value; snapshotUntil = Math.max(snapshotUntil, now() + 30000); return value }).finally(() => { pending = null })
      await pending
    }
    res.end(JSON.stringify(snapshot))
  }
}
export default createSpotifyHandler()

import { createServer } from 'node:http'
import { randomBytes, timingSafeEqual } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'

// Run only locally. The refresh token is written to ignored .env.local, never logged.
const file = new URL('../.env.local', import.meta.url)
const clientId = process.env.SPOTIFY_CLIENT_ID, secret = process.env.SPOTIFY_CLIENT_SECRET
if (!clientId || !secret) { console.error('Add your Spotify client ID and secret to .env.local first.'); process.exit(1) }
const redirect = 'http://127.0.0.1:8888/callback'
const state = randomBytes(32).toString('hex')
let exchanging = false
const server = createServer(async (req, res) => {
  res.setHeader('Cache-Control','no-store')
  res.setHeader('Referrer-Policy','no-referrer')
  if (req.method !== 'GET') { res.writeHead(405).end(); return }
  const url = new URL(req.url, redirect)
  if (url.pathname === '/start') {
    const target = new URL('https://accounts.spotify.com/authorize')
    target.search = new URLSearchParams({ client_id: clientId, response_type: 'code', redirect_uri: redirect, state, scope: 'user-read-currently-playing' })
    res.writeHead(302,{Location:target.href}).end(); return
  }
  if (url.pathname !== '/callback') { res.writeHead(404).end(); return }
  const received = url.searchParams.get('state') || ''
  const receivedBytes = Buffer.from(received), expectedBytes = Buffer.from(state)
  if (receivedBytes.length !== expectedBytes.length || !timingSafeEqual(receivedBytes,expectedBytes)) { res.writeHead(400).end('Invalid connection state. Please restart the local setup.'); return }
  if (url.searchParams.has('error')) { res.writeHead(400).end('Spotify permission was not granted. You can close this tab.'); server.close(); return }
  const code = url.searchParams.get('code')
  if (!code || exchanging) { res.writeHead(400).end('Invalid or duplicate callback.'); return }
  exchanging = true
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', { method:'POST', signal:AbortSignal.timeout(10000), headers:{ Authorization:`Basic ${Buffer.from(`${clientId}:${secret}`).toString('base64')}`, 'Content-Type':'application/x-www-form-urlencoded' }, body:new URLSearchParams({ grant_type:'authorization_code', code, redirect_uri:redirect }) })
    const token = await response.json()
    if (!response.ok || !token.refresh_token || !token.scope?.split(' ').includes('user-read-currently-playing')) throw Error('connection')
    const existing = await readFile(file,'utf8')
    const line = `SPOTIFY_REFRESH_TOKEN=${token.refresh_token}`
    const updated = /^SPOTIFY_REFRESH_TOKEN=.*$/m.test(existing) ? existing.replace(/^SPOTIFY_REFRESH_TOKEN=.*$/m,line) : `${existing.trimEnd()}\n${line}\n`
    await writeFile(file,updated,{mode:0o600})
    res.setHeader('Content-Type','text/plain; charset=utf-8')
    res.end('Spotify connected. Close this tab and restart the portfolio preview. Your credentials were saved locally and were not printed.')
    console.log('Spotify connected. Refresh token saved in ignored .env.local. Restart your preview.')
  } catch {
    res.writeHead(502).end('Connection could not be completed. Check the developer app and retry setup. No credentials were printed.')
  } finally { server.close() }
})
server.on('error', () => { console.error('Could not start the local connection helper. Check whether port 8888 is already in use.'); process.exitCode=1 })
server.listen(8888,'127.0.0.1',()=>console.log('Open http://127.0.0.1:8888/start to connect your Spotify account. This will make your current track visible on the portfolio.'))
const timeout = setTimeout(()=>{ console.log('Connection helper expired. Run it again when ready.'); server.close() },10*60*1000)
server.on('close',()=>clearTimeout(timeout))

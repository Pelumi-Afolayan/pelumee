import { useEffect, useState } from 'react'

export default function NowPlaying({ quiet }) {
  const [playback, setPlayback] = useState({ status: 'loading' })
  useEffect(() => {
    let timer, controller, disposed = false
    async function refresh() {
      clearTimeout(timer)
      if (document.hidden || disposed) return
      controller?.abort()
      controller = new AbortController()
      try {
        const response = await fetch('/api/spotify', { signal: controller.signal, cache: 'no-store' })
        if (!response.ok) throw Error('unavailable')
        const result = await response.json()
        if (!disposed) setPlayback(result)
      } catch (error) {
        if (!disposed && error.name !== 'AbortError') setPlayback({ status: 'unavailable' })
      } finally {
        if (!disposed && !document.hidden) timer = setTimeout(refresh,30000)
      }
    }
    function visibility() { clearTimeout(timer); if (document.hidden) controller?.abort(); else refresh() }
    document.addEventListener('visibilitychange',visibility)
    refresh()
    return () => { disposed = true; clearTimeout(timer); controller?.abort(); document.removeEventListener('visibilitychange',visibility) }
  }, [])
  const track = ['playing','paused'].includes(playback.status) && playback.title
  const status = { loading: 'Finding the soundtrack…', not_connected: 'The soundtrack is coming.', idle: 'A quiet moment.', unavailable: 'The music is out of reach.', playing: 'On repeat, right now.', paused: 'On pause.' }[playback.status] || 'A quiet moment.'
  return <article id="about-listening" className={`journal-music personal-reveal ${track && playback.status === 'playing' && !quiet ? 'music-playing' : ''}`} aria-labelledby="music-title">
    <div className="journal-section-label"><span>02 / LISTENING</span><span className="music-status-dot" aria-hidden="true" /></div>
    <div className="music-object" aria-hidden="true">{track && playback.image ? <img src={playback.image} alt="" loading="lazy" decoding="async" /> : <div className="music-record"><i /><i /><i /><span /></div>}</div>
    <div className="music-copy" aria-live="polite"><p className="music-state">{playback.status === 'playing' ? 'NOW PLAYING ON SPOTIFY' : playback.status === 'paused' ? 'PAUSED ON SPOTIFY' : 'SPOTIFY'}</p><h3 id="music-title">{track ? playback.title : status}</h3>{track ? <><p className="music-artist">{playback.artist}</p><p className="music-album">{playback.album}</p><a href={playback.url} target="_blank" rel="noopener noreferrer">Listen on Spotify ↗</a></> : <p className="music-empty">{playback.status === 'not_connected' ? 'My listening corner. Spotify isn’t connected yet.' : playback.status === 'loading' ? 'Checking what’s playing.' : playback.status === 'idle' ? 'Nothing playing on Spotify right now.' : 'Listening updates will return when the connection is available.'}</p>}</div>
  </article>
}

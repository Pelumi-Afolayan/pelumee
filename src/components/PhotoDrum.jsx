import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import './PhotoDrum.css'

// A camera at the cylinder centre: perspective = radius; ring centre sits at +radius.
// Cards face inward with rotateY(index * step) translateZ(-radius).
export default function PhotoDrum({ photos, onClose, motionOff = false, onMotionChange, turnSeconds = 80, cardWidth = 290, radiusScale = 1 }) {
  const root = useRef(null)
  const ring = useRef(null)
  const viewport = useRef(null)
  const closeButton = useRef(null)
  const lightbox = useRef(null)
  const lightboxTrigger = useRef(null)
  const controls = useRef(null)
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 700px)').matches)
  const [systemQuiet, setSystemQuiet] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [active, setActive] = useState(0)
  const [interacted, setInteracted] = useState(false)
  const [selected, setSelected] = useState(null)
  const count = photos.length
  const flat = motionOff || systemQuiet || count < 4
  const width = mobile ? Math.min(180, window.innerWidth * .47) : cardWidth
  const step = count ? 360 / count : 360
  const radius = count >= 4 ? width / (2 * Math.tan(Math.PI / count)) * radiusScale : 0

  useEffect(() => {
    const size = window.matchMedia('(max-width: 700px)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateSize = () => setMobile(size.matches)
    const updateMotion = () => setSystemQuiet(reduced.matches)
    size.addEventListener('change', updateSize)
    reduced.addEventListener('change', updateMotion)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButton.current?.focus()
    return () => {
      document.body.style.overflow = overflow
      size.removeEventListener('change', updateSize)
      reduced.removeEventListener('change', updateMotion)
    }
  }, [])

  useLayoutEffect(() => {
    if (flat || !ring.current) { controls.current = null; setActive(0); return }
    const element = ring.current
    const cards = Array.from(element.querySelectorAll('.photo-card'))
    const angle = { value: 0 }
    let hovered = false, focused = false, dragging = false, lightboxOpen = false
    let momentum
    let velocity = 0
    let lastX = 0, lastTime = 0, startX = 0, startY = 0, moved = false, vertical = false
    let pressTarget = null
    let lastActive = -1
    const paint = () => {
      gsap.set(element, { rotationY: angle.value, z: radius })
      const current = ((Math.round(-angle.value / step) % count) + count) % count
      if (current !== lastActive) { setActive(current); lastActive = current }
      cards.forEach((card, index) => {
        const facing = ((index * step + angle.value + 180) % 360 + 360) % 360 - 180
        const visible = Math.abs(facing) < 78
        card.style.visibility = visible ? 'visible' : 'hidden'
        card.tabIndex = visible ? 0 : -1
        card.setAttribute('aria-hidden', String(!visible))
      })
    }
    // Keep the idle clock separate from the user-controlled angle, so resuming
    // after a drag or wheel gesture never resets the camera's current position.
    const clock = { value: 0 }
    let previousTick = 0
    const idle = gsap.to(clock, { value: 360, duration: Math.max(10, turnSeconds), ease: 'none', repeat: -1, paused: mobile,
      onUpdate: () => {
        let delta = clock.value - previousTick
        if (delta < 0) delta += 360
        previousTick = clock.value
        angle.value -= delta
        paint()
      },
    })
    const speed = (pause) => { gsap.to(idle, { timeScale: pause ? 0 : 1, duration: .45, overwrite: true }) }
    const sync = () => speed(mobile || hovered || focused || dragging || lightboxOpen || !!momentum?.isActive())
    const rebase = () => {
      idle.pause()
      idle.play()
      if (mobile) idle.pause()
      sync()
    }
    const stop = () => { momentum?.kill(); momentum = null; idle.pause() }
    const rotate = (delta) => {
      const returnFocus = focused
      setInteracted(true); stop()
      momentum = gsap.to(angle, { value: angle.value + delta, duration: .55, ease: 'power2.out', onUpdate: paint, onComplete: () => { momentum = null; if (returnFocus) cards[((Math.round(-angle.value / step) % count) + count) % count]?.focus(); rebase() } })
    }
    controls.current = { rotate, pause: (value) => { lightboxOpen = value; sync() } }
    const down = (event) => {
      if (event.button !== undefined && event.button !== 0) return
      stop(); dragging = true; moved = false; vertical = false
      startX = lastX = event.clientX; startY = event.clientY; lastTime = performance.now(); velocity = 0
      pressTarget = event.target
    }
    const move = (event) => {
      if (!dragging) return
      if (event.pointerType === 'touch' && !moved && Math.abs(event.clientY - startY) > Math.abs(event.clientX - startX) + 8) { vertical = true; return }
      if (vertical) return
      const now = performance.now(), dx = event.clientX - lastX
      if (Math.abs(event.clientX - startX) > 6) { moved = true; setInteracted(true) }
      if (moved) {
        event.preventDefault()
        velocity = dx / Math.max(8, now - lastTime)
        angle.value += dx * .18; paint()
      }
      lastX = event.clientX; lastTime = now
    }
    const up = () => {
      if (!dragging) return
      dragging = false
      if (moved && !vertical) {
        momentum = gsap.to(angle, { value: angle.value + Math.max(-95, Math.min(95, velocity * 100)), duration: 1, ease: 'power3.out', onUpdate: paint, onComplete: () => { momentum = null; rebase() } })
      } else rebase()
    }
    const cancel = () => { dragging = false; moved = false; rebase() }
    const click = (event) => { if (moved && pressTarget) { event.preventDefault(); event.stopPropagation(); moved = false } }
    const wheel = (event) => { event.preventDefault(); rotate(-Math.max(-35, Math.min(35, (event.deltaX || event.deltaY) * .12))) }
    const over = (event) => { if (event.target.closest('.photo-card')) { hovered = true; sync() } }
    const out = (event) => { if (!event.relatedTarget?.closest?.('.photo-card')) { hovered = false; sync() } }
    const focusIn = (event) => { if (event.target.closest('.photo-card')) { focused = true; sync() } }
    const focusOut = (event) => { if (!event.relatedTarget?.closest?.('.photo-card')) { focused = false; sync() } }
    const area = viewport.current
    const context = gsap.context(() => {
      gsap.fromTo(element, { scale: 1.12, filter: 'blur(9px)', opacity: 0 }, { scale: 1, filter: 'blur(0px)', opacity: 1, duration: 1.2, onComplete: () => gsap.set(element, { filter: 'none' }) })
      gsap.fromTo(root.current.querySelectorAll('.drum-fragment'), { opacity: .65, y: 30, scale: .4 }, { opacity: 0, y: -140, x: (i) => (i % 2 ? 1 : -1) * 80, scale: 2, duration: 1.4, stagger: .03 })
    }, root)
    paint()
    area.addEventListener('pointerdown', down)
    area.addEventListener('pointerover', over)
    area.addEventListener('pointerout', out)
    area.addEventListener('focusin', focusIn)
    area.addEventListener('focusout', focusOut)
    area.addEventListener('wheel', wheel, { passive: false })
    area.addEventListener('click', click, true)
    window.addEventListener('pointermove', move, { passive: false })
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', cancel)
    return () => {
      context.revert(); idle.kill(); momentum?.kill(); gsap.killTweensOf(angle); gsap.killTweensOf(idle); gsap.set(element, { clearProps: 'transform,filter,opacity' })
      controls.current = null
      cards.forEach(card => { card.style.removeProperty('visibility'); card.removeAttribute('tabindex'); card.removeAttribute('aria-hidden') })
      area.removeEventListener('pointerdown', down); area.removeEventListener('pointerover', over); area.removeEventListener('pointerout', out)
      area.removeEventListener('focusin', focusIn); area.removeEventListener('focusout', focusOut); area.removeEventListener('wheel', wheel); area.removeEventListener('click', click, true)
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', cancel)
    }
  }, [flat, mobile, count, radius, step, turnSeconds])

  useEffect(() => {
    if (selected !== null) { controls.current?.pause(true); lightbox.current?.showModal() }
  }, [selected])

  function closeLightbox() { lightbox.current?.close(); setSelected(null); controls.current?.pause(false); lightboxTrigger.current?.focus() }
  function openPhoto(photo, index, event) { setInteracted(true); lightboxTrigger.current = event.currentTarget; setActive(index); setSelected(photo) }
  function keys(event) {
    if (selected !== null) return
    if (event.key === 'Tab') {
      const buttons = Array.from(root.current.querySelectorAll('button')).filter(node => node.tabIndex >= 0 && node.getClientRects().length && getComputedStyle(node).visibility !== 'hidden')
      const first = buttons[0], last = buttons[buttons.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    if (event.key === 'Escape') { event.preventDefault(); onClose() }
    if (!flat && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault(); controls.current?.rotate(event.key === 'ArrowLeft' ? step : -step)
    }
  }
  return <section ref={root} className={`photo-drum ${flat ? 'drum-flat' : ''}`} role="dialog" aria-modal="true" aria-label="Capture photography gallery" onKeyDown={keys}>
    <header className="drum-overlay drum-header"><button className="drum-jp" aria-label="Back to mind" onClick={onClose}>JP</button><span>CAPTURE / 01</span><button ref={closeButton} onClick={onClose}>Back to mind ↗</button></header>
    <div ref={viewport} className="drum-viewport" onScroll={() => {
      if (!flat || !viewport.current) return
      const bounds = viewport.current.getBoundingClientRect()
      let nearest = 0, distance = Infinity
      viewport.current.querySelectorAll('.photo-card').forEach((node, index) => {
        const box = node.getBoundingClientRect(), delta = Math.abs(box.left + box.width / 2 - (bounds.left + bounds.width / 2))
        if (delta < distance) { nearest = index; distance = delta }
      })
      setActive(nearest)
    }} style={{ perspective: flat ? undefined : `${radius}px`, '--card-width': `${width}px`, '--card-height': `${width * 1.25}px` }}>
      <div ref={ring} className={flat ? 'photo-strip' : 'photo-ring'}>
        {photos.map((photo, index) => <button className="photo-card" key={`${photo.src}-${index}`} style={flat ? undefined : { transform: `rotateY(${index * step}deg) translateZ(${-radius}px)` }} onClick={event => openPhoto(photo, index, event)} aria-label={photo.title}>
          <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" draggable="false" />
          <span className="photo-caption"><strong>{photo.title}</strong><span>{photo.caption}</span></span>
        </button>)}
      </div>
    </div>
    {!flat && <div className="drum-arrival" aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <i key={i} className="drum-fragment" style={{ left: `${10 + i * 7}%`, top: `${30 + i % 3 * 15}%` }} />)}</div>}
    <footer className="drum-overlay drum-footer"><span className="drum-counter">{String(active + (count ? 1 : 0)).padStart(2, '0')} / {String(count).padStart(2, '0')}</span><span className={`drum-hint ${interacted ? 'is-used' : ''}`}>{flat ? '' : 'Drag to explore / ← →'}</span><button aria-pressed={motionOff || systemQuiet} onClick={onMotionChange}>Motion {motionOff || systemQuiet ? 'off' : 'on'}</button></footer>
    <dialog ref={lightbox} className="photo-lightbox" aria-label={selected?.title || 'Photograph'} onCancel={event => { event.preventDefault(); closeLightbox() }} onClick={event => { if (event.target === event.currentTarget) closeLightbox() }}>
      {selected && <><button className="lightbox-close" onClick={closeLightbox} autoFocus>Close ×</button><img src={selected.src} alt={selected.alt} /><div><h2>{selected.title}</h2><p>{selected.caption}</p></div></>}
    </dialog>
  </section>
}

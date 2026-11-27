import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import './Field.css'
import { projects } from '../data/projects'
import { photos } from '../data/photos'

// Positions are percentages of the slightly oversized paper surface.
export const FIELD_SETTINGS = { cameraScale: 2.6, flySeconds: 1.1, pixelCount: 30, forwardSeconds: 70, parallax: 12, nearBlur: 3 }
export const FIELD_REGIONS = [
  { id: '01', name: 'BUILD', aria: 'BUILD, projects', x: 25, y: 40, size: 520, colour: '#b97440', words: ['Front-end development', 'Moving ideas into interfaces', 'Cybersecurity'], wordPositions: [[-8,4],[64,106],[-8,92]] },
  { id: '02', name: 'CAPTURE', aria: 'CAPTURE, photography', x: 73, y: 43, size: 620, colour: '#20221f', words: ['Visual storytelling'], wordPositions: [[9,-7],[96,55],[3,112]] },
  { id: '04', name: 'LEARN', aria: 'LEARN, academic journey', x: 59, y: 78, size: 470, colour: '#6c947b', words: ['Academics'], wordPositions: [[-17,15],[88,64],[-8,93]] },
]
export const FIELD_PIXELS = Array.from({ length: FIELD_SETTINGS.pixelCount }, (_, i) => {
  const region = FIELD_REGIONS[i % 3]
  const angle = i * 2.399, distance = 7 + i % 5 * 3
  return { x: region.x + Math.cos(angle) * distance, y: region.y + Math.sin(angle) * distance, size: 2 + i % 4 * 2, colour: region.colour, region: i % 3 }
})
const NEAR_PIXELS = [[4,25,32],[97,41,40],[8,78,25],[93,88,36],[44,4,22],[65,96,29]]

function GalleryPreview({ quiet, paused }) {
  const ring = useRef(null)
  const count = Math.min(10, photos.length), step = count ? 360 / count : 360
  const radius = count >= 4 ? 124 / (2 * Math.tan(Math.PI / count)) : 190
  useLayoutEffect(() => {
    const angle = { value: -18 }, cards = [...ring.current.children]
    const paint = () => {
      gsap.set(ring.current, { rotationY: angle.value, z: radius })
      cards.forEach((card,index) => {
        const facing = ((index * step + angle.value) % 360 + 540) % 360 - 180
        card.style.visibility = Math.abs(facing) < 77 ? 'visible' : 'hidden'
      })
    }
    paint()
    const turn = quiet ? null : gsap.to(angle, { value: -378, duration: 85, repeat: -1, ease: 'none', onUpdate: paint })
    if (paused) turn?.pause()
    return () => { turn?.kill(); gsap.killTweensOf(ring.current) }
  }, [quiet, paused, radius, step])
  return <div className="gallery-window" style={{ perspective: `${radius}px` }} aria-hidden="true"><div className="gallery-ground" /><div className="gallery-preview-ring" ref={ring}>{photos.slice(0,10).map((photo,index)=><span className="gallery-preview-frame" key={index} style={{transform:`rotateY(${index*step}deg) translateZ(-${radius}px)`}}><span className="gallery-preview-paper"><b>{String(index + 1).padStart(2, '0')}</b><span>PHOTO PLACEHOLDER</span></span></span>)}</div><span className="gallery-preview-caption">GALLERY PREVIEW / PLACEHOLDERS</span></div>
}

function Mark({ name, quiet, paused }) {
  if (name === 'CAPTURE') return <div className="scene-object scene-capture"><GalleryPreview quiet={quiet} paused={paused} /><span className="scene-entry-arrow" aria-hidden="true">↗</span></div>
  if (name === 'BUILD') return <div className="scene-object scene-build" aria-hidden="true"><div className="project-scene-stack">{[projects[0],projects[2]].map((project,index)=><div className={`project-scene-window project-scene-${index}`} key={project.id}><div className="scene-browser-bar"><span /><span /><span /><b>{project.title}</b></div><img src={project.image} alt="" loading="lazy" decoding="async" draggable="false" /></div>)}<div className="project-scene-index">{[projects[1],projects[3],projects[4]].map(project=><span key={project.id}>{project.title}<i /></span>)}</div></div><span className="scene-entry-arrow">↗</span></div>
  return <div className="scene-object scene-learn" aria-hidden="true"><div className="academic-sheet sheet-back" /><div className="academic-sheet sheet-middle" /><div className="academic-sheet sheet-front"><span className="sheet-overline">ACADEMIC JOURNEY</span><strong>Computer<br /><em>Science.</em></strong><div className="sheet-rules"><i /><i /><i /></div><span className="sheet-foot">LEARNING, ALWAYS.</span></div><span className="scene-entry-arrow">↗</span></div>
}

const Field = forwardRef(function Field({ quiet, handoff = false, destinationOpen, onEnter }, ref) {
  const root = useRef(null), camera = useRef(null), surface = useRef(null), pixels = useRef(null), mid = useRef(null), near = useRef(null)
  const buttons = useRef([]), heading = useRef(null), flight = useRef(null), arrival = useRef(null)
  const pan = useRef({ x: 0, y: 0 }), drag = useRef(null), origin = useRef(null), flying = useRef(false)
  const [highlight, setHighlight] = useState(null)
  const [tabVisible, setTabVisible] = useState(() => !document.hidden)
  const [currentRegion, setCurrentRegion] = useState(0)
  const [mobile, setMobile] = useState(() => matchMedia('(max-width: 760px)').matches)

  useEffect(() => {
    const update = () => setTabVisible(!document.hidden)
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])

  useEffect(() => {
    if (!mobile) return
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) setCurrentRegion(Number(entry.target.dataset.region))
    }, { root: camera.current, threshold: .6 })
    root.current.querySelectorAll('.field-region').forEach(region => observer.observe(region))
    return () => observer.disconnect()
  }, [mobile])

  function cancelFlight(focus = true) {
    flight.current?.kill()
    flying.current = false
    flight.current = gsap.to(camera.current, { x: 0, y: 0, scale: 1, opacity: 1, duration: quiet ? .15 : .85, ease: 'power3.inOut', onComplete: () => { if (focus) origin.current?.focus({ preventScroll: true }) } })
  }
  useImperativeHandle(ref, () => ({ returnToField: () => cancelFlight(), focus: () => heading.current?.focus() }))

  useEffect(() => {
    const media = matchMedia('(max-width: 760px)')
    const change = () => { setMobile(media.matches); pan.current = { x: 0, y: 0 }; gsap.set([surface.current, pixels.current, mid.current, near.current], { x: 0, y: 0 }); cancelFlight(false) }
    media.addEventListener('change', change)
    return () => { media.removeEventListener('change', change); flight.current?.kill() }
  }, [])

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      arrival.current = gsap.timeline()
      if (quiet) {
        arrival.current.fromTo(root.current, { opacity: 0 }, { opacity: 1, duration: .18 })
      } else {
        arrival.current
          .fromTo(root.current, { opacity: handoff ? 0 : 1 }, { opacity: 1, duration: .8, delay: handoff ? .3 : 0 })
          .fromTo(camera.current, { scale: mobile ? 1 : 1.13 }, { scale: 1, duration: 2, ease: 'power3.out' }, 0)
          .fromTo('.field-terrain', { opacity: 0 }, { opacity: 1, duration: .7 }, .2)
          .fromTo('.scene-trajectory', { opacity: 0 }, { opacity: 1, duration: 1.1 }, .4)
          .fromTo('.field-region', { opacity: 0 }, { opacity: 1, duration: .9, stagger: .22, ease: 'power3.out' }, .65)
          .fromTo('.field-heading', { opacity: 0, y: 5 }, { opacity: 1, y: 0, duration: .65 }, 1.55)
      }
    }, root)
    return () => context.revert()
  }, [quiet, mobile])

  useEffect(() => {
    const element = root.current
    if (quiet) gsap.set([pixels.current, mid.current, near.current, ...element.querySelectorAll('.field-pixel-anchor')], { x: 0, y: 0 })
    const updatePan = (x, y) => {
      if (quiet || mobile || !tabVisible || flying.current || destinationOpen) return
      const limitX = Math.min(45, innerWidth * .025), limitY = Math.min(32, innerHeight * .035)
      pan.current = { x: gsap.utils.clamp(-limitX, limitX, x), y: gsap.utils.clamp(-limitY, limitY, y) }
      gsap.to(surface.current, { ...pan.current, duration: .7, ease: 'power2.out', overwrite: true })

    }
    const wheel = event => { if (mobile || quiet || destinationOpen) return; event.preventDefault(); updatePan(pan.current.x - event.deltaX * .12, pan.current.y - event.deltaY * .12) }
    const down = event => { if (mobile || quiet || event.button !== 0 || event.target.closest('button')) return; drag.current = { x: event.clientX, y: event.clientY, px: pan.current.x, py: pan.current.y }; element.setPointerCapture(event.pointerId) }
    const move = event => {
      if (quiet || mobile || !tabVisible || flying.current || destinationOpen) return
      const start = drag.current
      if (start) updatePan(start.px + (event.clientX - start.x) * .35, start.py + (event.clientY - start.y) * .35)
      const x = (event.clientX / innerWidth - .5) * FIELD_SETTINGS.parallax
      const y = (event.clientY / innerHeight - .5) * FIELD_SETTINGS.parallax
      ;[[pixels.current,.3],[mid.current,.75],[near.current,2]].forEach(([layer,speed]) => gsap.to(layer, { x: x * speed, y: y * speed, duration: 1.3, overwrite: true, ease: 'power2.out' }))
      const anchors = [...pixels.current.querySelectorAll('.field-pixel-anchor')]
      anchors.map(anchor => ({ anchor, rect: anchor.getBoundingClientRect() })).sort((a,b) => Math.hypot(a.rect.x-event.clientX,a.rect.y-event.clientY)-Math.hypot(b.rect.x-event.clientX,b.rect.y-event.clientY)).forEach(({anchor,rect},i) => {
        const distance = Math.hypot(rect.x-event.clientX,rect.y-event.clientY)
        gsap.to(anchor, { x: i < 3 && distance < 140 ? x * .7 : 0, y: i < 3 && distance < 140 ? y * .7 : 0, duration: 1.8, overwrite: true })
      })
    }
    const leave = () => { [pixels.current,mid.current,near.current].forEach(layer => gsap.to(layer, { x: 0, y: 0, duration: 1.5, overwrite: true })) }
    const up = () => { drag.current = null }
    element.addEventListener('wheel', wheel, { passive: false })
    element.addEventListener('pointerdown', down); element.addEventListener('pointermove', move)
    element.addEventListener('pointerleave', leave); element.addEventListener('pointerup', up); element.addEventListener('pointercancel', up)
    return () => {
      element.removeEventListener('wheel', wheel); element.removeEventListener('pointerdown', down); element.removeEventListener('pointermove', move); element.removeEventListener('pointerleave', leave); element.removeEventListener('pointerup', up); element.removeEventListener('pointercancel', up)
      gsap.killTweensOf([surface.current, pixels.current, mid.current, near.current, ...element.querySelectorAll('.field-pixel-anchor')])
      if (quiet) gsap.set([pixels.current, mid.current, near.current], { x: 0, y: 0 })
    }
  }, [quiet, mobile, destinationOpen, tabVisible])

  useEffect(() => {
    if (quiet && flying.current && !destinationOpen) cancelFlight()
  }, [quiet, destinationOpen])

  function enter(index) {
    if (flying.current || destinationOpen) return
    arrival.current?.progress(1)
    const button = buttons.current[index]
    origin.current = button
    flying.current = true
    setHighlight(index)
    setCurrentRegion(index)
    const bounds = button.getBoundingClientRect()
    const scale = quiet || mobile ? 1 : FIELD_SETTINGS.cameraScale
    flight.current?.kill()
    flight.current = gsap.timeline({ onComplete: () => onEnter(FIELD_REGIONS[index].id, button) })
      .to(camera.current, { scale, x: quiet || mobile ? 0 : (innerWidth / 2 - bounds.left - bounds.width / 2) * scale, y: quiet || mobile ? 0 : (innerHeight / 2 - bounds.top - bounds.height / 2) * scale, duration: quiet ? .18 : mobile ? .35 : FIELD_SETTINGS.flySeconds, ease: 'power3.inOut' })
      .to(camera.current, { opacity: 0, duration: quiet ? .15 : .22 }, quiet ? 0 : mobile ? .12 : FIELD_SETTINGS.flySeconds - .22)
  }
  function indexJump(index) {
    if (destinationOpen || flying.current) return
    setHighlight(index)
    if (mobile) {
      buttons.current[index].closest('.field-region').scrollIntoView({ behavior: quiet ? 'instant' : 'smooth', block: 'start' })
      buttons.current[index].focus({ preventScroll: true })
    } else enter(index)
  }
  function keys(event) {
    if (event.key === 'Escape' && flying.current && !destinationOpen) { event.preventDefault(); cancelFlight(); return }
    const index = buttons.current.indexOf(document.activeElement)
    if (index >= 0 && ['ArrowRight','ArrowLeft','ArrowDown','ArrowUp'].includes(event.key)) {
      event.preventDefault()
      const next = (index + (['ArrowRight','ArrowDown'].includes(event.key) ? 1 : -1) + 3) % 3
      if (mobile) buttons.current[next].closest('.field-region').scrollIntoView({ behavior: quiet ? 'instant' : 'smooth', block: 'start' })
      buttons.current[next].focus({ preventScroll: true })
    }
  }
  return <section ref={root} className={`field ${quiet ? 'field-quiet' : ''} ${!tabVisible || destinationOpen ? 'field-paused' : ''}`} style={{ '--forward-seconds': `${FIELD_SETTINGS.forwardSeconds}s`, '--near-blur': `${FIELD_SETTINGS.nearBlur}px` }} aria-label="The Field" inert={destinationOpen ? true : undefined} onKeyDown={keys}>
    <div className="field-heading"><h2 ref={heading} tabIndex={-1}>Inside.</h2><p>CHOOSE A REGION</p></div>
    <div className="field-camera" ref={camera}>
      <div className="field-travel"><div className="field-surface" ref={surface}>
        <div className="field-terrain field-depth" ref={pixels} aria-hidden="true">{FIELD_PIXELS.map((pixel,index) => <span key={index} className={`field-pixel-anchor pixel-region-${pixel.region}`} style={{ left: `${pixel.x}%`, top: `${pixel.y}%`, '--mobile-x': `${12 + index * 31 % 76}%`, '--mobile-y': `${pixel.region * 100 + 18 + index * 17 % 64}svh` }}><span className={`field-pixel ${index % 3 === 0 ? 'pixel-outline' : ''}`} style={{ width: pixel.size, height: pixel.size, '--pixel-colour': pixel.colour, '--delay': `${-index * .73}s`, '--drift': `${3 + index % 4}px` }} /></span>)}</div>
        <div className="field-mid field-depth" ref={mid}><svg className="scene-trajectory" viewBox="0 0 1400 900" preserveAspectRatio="none" aria-hidden="true"><path d="M -40 540 C 210 70 680 130 1170 300 S 1160 870 660 750 S 500 340 1400 660" /></svg>
        {FIELD_REGIONS.map((region,index) => <div key={region.id} className={`field-region region-${region.name.toLowerCase()} ${highlight === index ? 'region-highlight' : ''}`} data-region={index} id={`field-${region.name.toLowerCase()}`} style={{ '--region-x': `${region.x}%`, '--region-y': `${region.y}%`, '--mark-size': `${region.size}px` }}>
          <div className="region-words" aria-hidden="true">{region.words.map((word,i) => <span key={word} className="field-word" style={{ left: `${region.wordPositions[i][0]}%`, top: `${region.wordPositions[i][1]}%`, '--delay': `${-i * 4 - index * 2}s`, '--drift': `${3 + i}px` }}>{word}</span>)}</div>
          <button ref={el => { buttons.current[index] = el }} className="field-region-button" aria-label={region.aria} onClick={() => enter(index)} onPointerEnter={() => setHighlight(index)} onPointerLeave={() => setHighlight(null)} onFocus={() => setHighlight(index)} onBlur={() => setHighlight(null)}><Mark name={region.name} quiet={quiet} paused={!tabVisible || destinationOpen} /><span className="field-region-name"><span className="field-region-number">{String(index + 1).padStart(2, '0')} / </span>{region.name}</span></button>
        </div>)}
        </div>
        <div className="field-near field-depth" ref={near} aria-hidden="true">{NEAR_PIXELS.map(([x,y,size],i) => <span key={i} className={`near-pixel ${i % 2 ? 'near-outline' : ''}`} style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, '--delay': `${-i * 5}s`, '--pixel-colour': ['#e9a36d','#a7c3b1','#f4dfaa'][i % 3] }} />)}</div>
      </div></div>
    </div>
    <nav className="field-index" aria-label="Regions">{FIELD_REGIONS.map((region,index) => <button key={region.id} aria-controls={`field-${region.name.toLowerCase()}`} onClick={() => indexJump(index)} onPointerEnter={() => setHighlight(index)} onPointerLeave={() => setHighlight(null)} onFocus={() => setHighlight(index)} onBlur={() => setHighlight(null)} aria-current={(highlight ?? currentRegion) === index ? 'location' : undefined} className={(highlight ?? currentRegion) === index ? 'is-highlighted' : ''}>{region.name}</button>)}</nav>
  </section>
})
export default Field

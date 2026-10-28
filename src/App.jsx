import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import './App.css'

const dimensions = [
  { id: '01', title: 'Development', word: 'BUILD', label: 'Interfaces & useful ideas', text: 'I build digital experiences with React and JavaScript. My work includes Expensidify, the Legacy of Lights digital yearbook, and Tuni Creation.', tags: ['React', 'JavaScript', 'Front-end development'] },
  { id: '02', title: 'Photography', word: 'SEE', label: 'Light, people & perspective', text: 'Photography is another way I explore ideas: through light, composition, and the details that are easy to miss. A curated gallery of my photographs will live here in the next stage.', tags: ['Visual storytelling', 'Composition', 'Photography'] },
  { id: '03', title: 'Cyber & privacy', word: 'THINK', label: 'Curiosity with responsibility', text: 'During my undergraduate internship with KPMG Nigeria’s Cyber & Privacy team, I observed and supported vulnerability documentation, reporting, and data protection work.', tags: ['VAPT exposure', 'Privacy documentation', 'ISC2 CC'] },
  { id: '04', title: 'Academic journey', word: 'GROW', label: 'Learning, always', text: 'B.Sc. Computer Science, Redeemer’s University. First Class, 4.88/5.00 CGPA, graduating October 2026, with four Dean’s List recognitions.', tags: ['Computer Science', 'First Class', '4.88 / 5.00'] },
]

// A small, editable vocabulary drawn from the portfolio brief.
const floatingIdeas = [
  { text: 'Photography', x: -.3, y: -.22 },
  { text: 'Front-end development', x: .19, y: -.15 },
  { text: 'Shoots', x: -.22, y: .17 },
  { text: 'Visual storytelling', x: .16, y: .24 },
  { text: 'Computer Science', x: -.28, y: -.04 },
  { text: 'Cybersecurity', x: .21, y: -.3 },
  { text: 'Academics', x: -.13, y: .32 },
  { text: 'Ideas into interfaces', x: .14, y: .08 },
  { text: 'Curiosity', x: -.19, y: -.29 },
]

const personalSections = {
  about: { id: '05', title: 'About me', text: 'A space for the person beyond the work. Personal stories, interests, and a few things you might not expect — coming later.', tags: ['Personal space', 'Content coming later'] },
  contact: { id: '06', title: 'Contact', text: 'A place to start a conversation. Contact details and social links will be added here later.', tags: ['Get in touch', 'Details coming later'] },
}

function readVisited() { try { return sessionStorage.getItem('aj-entered') === 'yes' } catch { return false } }

export default function App() {
  const root = useRef(null)
  const timeline = useRef(null)
  const heading = useRef(null)
  const dialog = useRef(null)
  const lastTrigger = useRef(null)
  const [stage, setStage] = useState(() => readVisited() ? 'inside' : 'intro')
  const [selected, setSelected] = useState(null)
  const [quiet, setQuiet] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [imageReady, setImageReady] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => { setQuiet(media.matches); if (media.matches) timeline.current?.progress(1) }
    media.addEventListener('change', update)
    return () => { media.removeEventListener('change', update); timeline.current?.kill() }
  }, [])

  useEffect(() => {
    if (selected) dialog.current?.showModal()
  }, [selected])

  function finish() {
    setStage('inside')
    try { sessionStorage.setItem('aj-entered', 'yes') } catch { /* Storage is optional. */ }
    requestAnimationFrame(() => heading.current?.focus())
  }

  function enter(skip = false) {
    if (stage === 'entering') { timeline.current?.progress(1); return }
    if (quiet || skip || imageError) { finish(); return }
    setStage('entering')
    // Camera and pixels share the temple as their origin, moving towards the
    // viewport centre together. No replacement photograph or separate pixel scene.
    const scope = gsap.utils.selector(root)
    const frame = root.current.querySelector('.portrait-frame').getBoundingClientRect()
    const marker = root.current.querySelector('.enter-button').getBoundingClientRect()
    const origin = { x: marker.left + marker.width / 2, y: marker.top + marker.height / 2 }
    const centre = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    gsap.set(scope('.portrait-frame'), { transformOrigin: `${(origin.x - frame.left) / frame.width * 100}% ${(origin.y - frame.top) / frame.height * 100}%` })
    gsap.set(scope('.pixel-field'), { left: origin.x, top: origin.y })
    timeline.current = gsap.timeline()
      .set(scope('.pixel-journey'), { opacity: 1 }, 0)
      .to(scope('.intro-copy, .intro-bottom, .portrait-note, .enter-button'), { opacity: 0, duration: .35, stagger: .03 }, 0)
      .to(scope('.portrait-frame'), {
        scale: 9, x: centre.x - origin.x, y: centre.y - origin.y,
        duration: 4, ease: 'power2.inOut',
      }, 0)
      .to(scope('.pixel-field'), { left: centre.x, top: centre.y, duration: 4, ease: 'power2.inOut' }, 0)
      .fromTo(scope('.journey-pixel'), { x: 0, y: 0, scale: .15, opacity: 0 }, {
        keyframes: [
          { opacity: 1, scale: .8, duration: .16 },
          { x: (i) => Math.cos(i * 2.399) * window.innerWidth * (.5 + (i % 7) * .08),
            y: (i) => Math.sin(i * 2.399) * window.innerHeight * (.45 + (i % 9) * .06),
            scale: (i) => 2 + i % 5, rotation: (i) => (i % 3 - 1) * 65,
            duration: 3.05, ease: 'power2.in', },
          { opacity: 0, duration: .4 },
        ], stagger: .006,
      }, .08)
      .to(scope('.threshold'), { opacity: .8, duration: .9 }, 3.05)
      .call(finish, [], 4)
      .to(scope('.pixel-journey'), { opacity: 0, duration: .5 }, 4)

    // Stagger readable thoughts through separate depth lanes while the zoom runs.
    // Each one has its own arrival, drift, and departure before the hub appears.
    scope('.journey-idea').forEach((element, index) => {
      const idea = floatingIdeas[index]
      const driftX = idea.x * window.innerWidth
      const driftY = idea.y * window.innerHeight
      const halfWidth = Math.min(element.offsetWidth * .65, window.innerWidth / 2 - 16)
      const safeX = (x) => gsap.utils.clamp(halfWidth + 12, window.innerWidth - halfWidth - 12, x)
      timeline.current.fromTo(element,
        { xPercent: -50, yPercent: -50, x: safeX(origin.x + driftX * .25), y: origin.y + driftY * .25, scale: .65, opacity: 0, filter: 'blur(5px)' },
        { keyframes: [
          { opacity: .95, filter: 'blur(0px)', scale: .9, x: safeX(centre.x + driftX * .55), y: centre.y + driftY * .55, duration: .3 },
          { x: safeX(centre.x + driftX), y: centre.y + driftY, scale: 1.1, duration: .95, ease: 'sine.out' },
          { opacity: 0, x: safeX(centre.x + driftX * 1.35), y: centre.y + driftY * 1.35, scale: 1.3, filter: 'blur(4px)', duration: .4 },
        ] }, .25 + index * .23)
    })
  }

  function replay() {
    timeline.current?.kill()
    gsap.set(root.current.querySelectorAll('.intro, .intro-copy, .intro-bottom, .portrait-note, .portrait-frame, .threshold, .enter-button, .pixel-journey, .journey-pixel, .journey-idea, .pixel-field'), { clearProps: 'transform,transformOrigin,opacity,left,top' })
    setStage('intro')
    requestAnimationFrame(() => root.current.querySelector('.enter-button')?.focus())
  }

  function openDimension(item, event) { lastTrigger.current = event.currentTarget; setSelected(item) }
  function closeDimension() { dialog.current?.close(); setSelected(null); lastTrigger.current?.focus() }

  return (
    <div ref={root} className={`experience ${stage === 'inside' ? 'is-inside' : ''} ${quiet ? 'quiet' : ''} ${stage === 'intro' ? 'intro-arrival' : ''}`}>
      <header className="site-header flex items-center justify-between">
        <button className="monogram" onClick={replay} aria-label="Return to introduction">JP<span>®</span></button>
        <span className="header-label">A PERSONAL EXPLORATION</span>
        <nav className="personal-nav" aria-label="Personal navigation"><button onClick={(e) => openDimension(personalSections.about, e)}>About me</button><button onClick={(e) => openDimension(personalSections.contact, e)}>Contact ↗</button></nav>
        <button className="text-button" onClick={() => stage === 'inside' ? replay() : enter(true)}>{stage === 'inside' ? 'Replay introduction ↗' : 'Skip introduction ↗'}</button>
      </header>

      <main>
        <section className="intro" aria-label="Introduction" hidden={stage === 'inside'}>
          <div className="portrait-frame"><img src="/images/portrait.jpg" alt="Afolayan Jesupelumi in silhouette, wearing glasses in side profile" fetchPriority="high" onLoad={() => setImageReady(true)} onError={() => setImageError(true)} /><button className="enter-button" onClick={() => enter()} disabled={(!imageReady && !imageError) || stage === 'entering'}><span className="entry-label">{stage === 'entering' ? 'Stepping inside' : !imageReady && !imageError ? 'Preparing your view' : 'Enter my mind'}</span><span className="entry-arrow">↗</span></button></div>
          <div className="intro-copy">
            <p className="eyebrow"><span className="status-dot" /> MANY INTERESTS. ONE MIND.</p>
            <h1 aria-label="Afolayan Jesupelumi"><span className="name-line" aria-hidden="true"><span className="name-letters">AFOLAYAN</span></span><span className="name-line name-line-second" aria-hidden="true"><span className="name-letters">JESUPELUMI</span></span><sup aria-hidden="true">©26</sup></h1>
            <p className="identity"><span className="identity-line">A developer’s logic.</span><span className="identity-line">A photographer’s eye.</span><span className="identity-line identity-muted">A world of possibilities.</span></p>

            {imageError && <p className="image-error">The portrait could not load. You can still explore.</p>}
          </div>
          <p className="portrait-note">FIG. 01 — THE PERSON BEHIND THE WORK</p>
          <div className="intro-bottom"><span>DEVELOPMENT / PHOTOGRAPHY / CYBERSECURITY</span><p>Everything I create<br />starts with a little curiosity.</p><span className="vertical-mark">SCROLL LESS. DISCOVER MORE. ↗</span></div>
          <div className="threshold" aria-hidden="true" />
        </section>

        {stage === 'inside' && <section className="mind" aria-labelledby="mind-heading">
          <div className="mind-heading"><p className="eyebrow"><span className="status-dot" /> THE WORLD WITHIN</p><h2 id="mind-heading" ref={heading} tabIndex={-1}>Still me.<br /><em>A little closer.</em></h2><p className="mind-description">Four dimensions, connected by curiosity.<br />Tap a part of my mind to open it.</p></div>
          <div className="mind-map">
            <div className="mind-portrait"><img src="/images/portrait.jpg" alt="The same side-profile portrait, connecting the four areas of my mind" /><span className="mind-centre" aria-hidden="true">+</span></div>
            <svg className="mind-connections" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true"><path d="M 210 145 L 340 145 L 520 275 M 790 145 L 690 145 L 520 275 M 210 470 L 340 470 L 520 275 M 790 470 L 690 470 L 520 275" /><circle cx="520" cy="275" r="12" /><circle cx="520" cy="275" r="26" /></svg>
            <div className="dimensions">{dimensions.map((item) => <button key={item.id} className={`dimension dimension-${item.id}`} onClick={(e) => openDimension(item, e)}><span className="dimension-meta"><span>{item.id} / {item.title.toUpperCase()}</span><span>↗</span></span><span className="dimension-symbol" aria-hidden="true">{item.id === '01' ? '</>' : item.id === '02' ? '◎' : item.id === '03' ? '⌘' : '4.88'}</span><span className="dimension-word">{item.word}</span><span className="dimension-label">{item.label}</span><span className="open-hint">TAP TO EXPLORE ↗</span></button>)}</div>
            <p className="map-caption">ONE MIND / MANY POSSIBILITIES</p>
          </div>
          <footer className="mind-footer"><span>AFOLAYAN JESUPELUMI</span><span>THE EXPLORATION HAS JUST BEGUN — PORTRAIT STUDY / 02</span></footer>
        </section>}
      </main>
      <div className="pixel-journey" aria-hidden="true"><div className="pixel-field">{Array.from({ length: 100 }, (_, i) => <span className="journey-pixel" key={i} style={{ '--pixel-color': i % 5 === 0 ? '#e9a36d' : i % 3 === 0 ? '#f4dfaa' : '#a7c3b1' }} />)}</div><div className="thought-field">{floatingIdeas.map((idea, i) => <span className={`journey-idea journey-idea-${i % 3}`} key={idea.text}>{idea.text}</span>)}</div></div>
      <button className="motion-toggle" aria-pressed={quiet} onClick={() => { if (!quiet) timeline.current?.progress(1); setQuiet(!quiet) }}>Motion {quiet ? 'off' : 'on'} <span aria-hidden="true">{quiet ? '○' : '◉'}</span></button>
      <dialog ref={dialog} className={`dimension-dialog ${quiet ? 'dialog-quiet' : ''}`} aria-labelledby="dimension-title" onCancel={(e) => { e.preventDefault(); closeDimension() }} onClick={(e) => { if (e.target === e.currentTarget) closeDimension() }}>
        {selected && <article><div className="dialog-top"><span className="eyebrow">{Number(selected.id) > 4 ? 'PERSONAL SPACE' : 'DIMENSION'} / {selected.id}</span><button className="text-button" onClick={closeDimension} autoFocus>Close ×</button></div><h2 id="dimension-title">{selected.title}</h2><p>{selected.text}</p><div className="tags">{selected.tags.map(tag => <span key={tag}>{tag}</span>)}</div><p className="prototype-note">{Number(selected.id) > 4 ? 'This section is reserved. We’ll fill it in later.' : 'A glimpse for now. The full portfolio follows in the next stage.'}</p></article>}
      </dialog>
    </div>
  )
}





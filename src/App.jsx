import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import './App.css'
import PhotoDrum from './components/PhotoDrum'
import { photos } from './data/photos'
import ProjectBrowser from './components/ProjectBrowser'
import { projects } from './data/projects'
import Field, { FIELD_PIXELS } from './components/Field'
import PersonalPage from './components/PersonalPage'

const dimensions = [
  { id: '01', title: 'Development', word: 'BUILD', label: 'Interfaces & useful ideas', text: 'I build digital experiences with React and JavaScript. My work includes Expensidify, the Legacy of Lights digital yearbook, and Tuni Creation. My work experience includes an undergraduate internship with KPMG Nigeria’s Cyber & Privacy team, observing and supporting vulnerability documentation, reporting, and data protection work.', tags: ['React', 'JavaScript', 'Front-end development', 'Cyber & Privacy experience'] },
  { id: '02', title: 'Photography', word: 'CAPTURE', label: 'Light, people & perspective', text: 'Photography is another way I explore ideas: through light, composition, and the details that are easy to miss. A curated gallery of my photographs will live here in the next stage.', tags: ['Visual storytelling', 'Composition', 'Photography'] },
  { id: '04', title: 'Academic journey', word: 'LEARN', label: 'Learning, always', text: 'B.Sc. Computer Science, Redeemer’s University. First Class, 4.88/5.00 CGPA, graduating October 2026, with four Dean’s List recognitions.', tags: ['Computer Science', 'First Class', '4.88 / 5.00'] },
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

function readVisited() { try { return sessionStorage.getItem('aj-entered') === 'yes' } catch { return false } }

export default function App() {
  const root = useRef(null)
  const timeline = useRef(null)
  const field = useRef(null)
  const dialog = useRef(null)
  const lastTrigger = useRef(null)
  const personalTrigger = useRef(null)
  const [stage, setStage] = useState(() => readVisited() ? 'inside' : 'intro')
  const [fieldVisible, setFieldVisible] = useState(() => readVisited())
  const [handoff, setHandoff] = useState(false)
  const [selected, setSelected] = useState(null)
  const [personalOpen, setPersonalOpen] = useState(null)
  const [captureOpen, setCaptureOpen] = useState(false)
  const [buildOpen, setBuildOpen] = useState(false)
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
    setFieldVisible(true)
    setStage('inside')
    try { sessionStorage.setItem('aj-entered', 'yes') } catch { /* Storage is optional. */ }
    requestAnimationFrame(() => field.current?.focus())
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
            duration: 2.65, ease: 'power2.in', },
        ], stagger: .006,
      }, .08)
      .to(scope('.threshold'), { opacity: .8, duration: .9 }, 3.05)
      .call(() => { setHandoff(true); setFieldVisible(true) }, [], 3.05)
      .to(scope('.portrait-frame'), { opacity: 0, duration: 1.05, ease: 'power2.inOut' }, 3.25)
      .to(scope('.intro'), { backgroundColor: 'rgba(242,241,236,0)', duration: .8 }, 3.55)
      .to(scope('.threshold'), { opacity: 0, duration: .85 }, 3.6)
      .to(scope('.journey-pixel'), {
        x: i => (FIELD_PIXELS[i % FIELD_PIXELS.length].x / 100 - .5) * innerWidth * (innerWidth > 760 ? 1.16 : 1),
        y: i => (FIELD_PIXELS[i % FIELD_PIXELS.length].y / 100 - .5) * innerHeight * (innerWidth > 760 ? 1.16 : 1),
        scale: i => i < FIELD_PIXELS.length ? FIELD_PIXELS[i].size / 11 : .1,
        rotation: 0, opacity: i => i < FIELD_PIXELS.length ? .6 : 0,
        duration: 1.4, ease: 'power3.out', stagger: .001,
      }, 3.45)
      .fromTo(scope('.silhouette-fragment'), {
        x: i => Math.cos(i * 2.399) * innerWidth * .18,
        y: i => Math.sin(i * 2.399) * innerHeight * .35,
        scale: .5, opacity: 0,
      }, {
        keyframes: [
          { opacity: .8, scale: 1.4, duration: .15 },
          { x: i => (FIELD_PIXELS[i].x / 100 - .5) * innerWidth, y: i => (FIELD_PIXELS[i].y / 100 - .5) * innerHeight, scale: .4, opacity: .3, duration: .95, ease: 'power3.out' },
          { opacity: 0, duration: .35 },
        ], stagger: .008,
      }, 3.2)
      .to(scope('.pixel-journey'), { opacity: 0, duration: .35 }, 4.6)
      .call(finish, [], 4.95)

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
    gsap.set(root.current.querySelectorAll('.intro, .intro-copy, .intro-bottom, .portrait-note, .portrait-frame, .threshold, .enter-button, .pixel-journey, .journey-pixel, .journey-idea, .pixel-field, .silhouette-fragment'), { clearProps: 'transform,transformOrigin,opacity,left,top,backgroundColor' })
    setFieldVisible(false)
    setHandoff(false)
    setStage('intro')
    requestAnimationFrame(() => root.current.querySelector('.enter-button')?.focus())
  }

  function openPersonal(section, event) { personalTrigger.current = event.currentTarget; setPersonalOpen(section) }
  function closePersonal() { setPersonalOpen(null); requestAnimationFrame(() => personalTrigger.current?.focus()) }
  function openDimension(item, event) {
    lastTrigger.current = event.currentTarget
    if (item.id === '01') setBuildOpen(true)
    else if (item.id === '02') setCaptureOpen(true)
    else setSelected(item)
  }
  function enterRegion(id, button) { openDimension(dimensions.find(item => item.id === id), { currentTarget: button }) }
  function returnToField() { requestAnimationFrame(() => field.current?.returnToField()) }
  function closeCapture() { setCaptureOpen(false); returnToField() }
  function closeDimension() { const region = selected?.id === '04'; dialog.current?.close(); setSelected(null); if (region) returnToField(); else lastTrigger.current?.focus() }

  return (
    <>
    <div inert={captureOpen || buildOpen || personalOpen ? true : undefined} ref={root} className={`experience ${fieldVisible ? 'has-field' : ''} ${handoff && stage !== 'inside' ? 'field-handoff' : ''} ${stage === 'inside' ? 'is-inside' : ''} ${quiet ? 'quiet' : ''} ${stage === 'intro' ? 'intro-arrival' : ''}`}>
      <header className="site-header flex items-center justify-between">
        <button className="monogram" onClick={replay} aria-label="Return to introduction">JP<span>®</span></button>
        <span className="header-label">A PERSONAL EXPLORATION</span>
        <nav className="personal-nav" aria-label="Personal navigation"><button onClick={(e) => openPersonal('about', e)}>About me</button><button onClick={(e) => openPersonal('contact', e)}>Contact ↗</button></nav>
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

        {fieldVisible && <Field ref={field} quiet={quiet} handoff={handoff} destinationOpen={buildOpen || captureOpen || Boolean(personalOpen) || selected?.id === '04'} onEnter={enterRegion} />}

      </main>
      <div className="pixel-journey" aria-hidden="true"><div className="pixel-field">{Array.from({ length: 100 }, (_, i) => <span className="journey-pixel" key={i} style={{ '--pixel-color': i % 5 === 0 ? '#e9a36d' : i % 3 === 0 ? '#f4dfaa' : '#a7c3b1' }} />)}</div><div className="thought-field">{floatingIdeas.map((idea, i) => <span className={`journey-idea journey-idea-${i % 3}`} key={idea.text}>{idea.text}</span>)}</div></div>
      <div className="silhouette-fragments" aria-hidden="true">{Array.from({ length: 24 }, (_, i) => <span className="silhouette-fragment" key={i} />)}</div>
      <button className="motion-toggle" aria-pressed={quiet} onClick={() => { if (!quiet) timeline.current?.progress(1); setQuiet(!quiet) }}>Motion {quiet ? 'off' : 'on'} <span aria-hidden="true">{quiet ? '○' : '◉'}</span></button>
      <dialog ref={dialog} className={`dimension-dialog ${quiet ? 'dialog-quiet' : ''}`} aria-labelledby="dimension-title" onCancel={(e) => { e.preventDefault(); closeDimension() }} onClick={(e) => { if (e.target === e.currentTarget) closeDimension() }}>
        {selected && <article><div className="dialog-top"><span className="eyebrow">{Number(selected.id) > 4 ? 'PERSONAL SPACE' : 'DIMENSION'} / {selected.id}</span><button className="text-button" onClick={closeDimension} autoFocus>Close ×</button></div><h2 id="dimension-title">{selected.title}</h2><p>{selected.text}</p><div className="tags">{selected.tags.map(tag => <span key={tag}>{tag}</span>)}</div><p className="prototype-note">{Number(selected.id) > 4 ? 'This section is reserved. We’ll fill it in later.' : 'A glimpse for now. The full portfolio follows in the next stage.'}</p></article>}
      </dialog>
    </div>
    {personalOpen && <PersonalPage section={personalOpen} onSectionChange={setPersonalOpen} onClose={closePersonal} quiet={quiet} onMotionChange={() => setQuiet(value => !value)} />}
    {buildOpen && <ProjectBrowser projects={projects} motionOff={quiet} onMotionChange={() => setQuiet(value => !value)} onClose={() => { setBuildOpen(false); returnToField() }} />}
    {captureOpen && <PhotoDrum photos={photos} onClose={closeCapture} motionOff={quiet} onMotionChange={() => setQuiet(value => !value)} />}
    </>
  )
}




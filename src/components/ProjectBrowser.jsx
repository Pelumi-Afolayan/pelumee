import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import './ProjectBrowser.css'

function Preview({ project }) {
  return <div className="project-frame"><div className="project-browser-bar" aria-hidden="true"><i /><i /><i /></div>{project.image ? <img src={project.image} alt={project.imageAlt} loading="lazy" decoding="async" draggable="false" /> : <div className="project-placeholder" role="img" aria-label={`${project.title}: preview coming soon`}>Preview coming soon</div>}</div>
}
function Stack({ project }) { return project.stack.length > 0 && <div className="project-stack">{project.stack.map(item => <span key={item}>{item}</span>)}</div> }

export default function ProjectBrowser({ projects, onClose, motionOff, onMotionChange }) {
  const root = useRef(null), deck = useRef(null), detail = useRef(null), receipt = useRef(null), trigger = useRef(null)
  const [opened, setOpened] = useState(null)
  const [systemQuiet, setSystemQuiet] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const quiet = motionOff || systemQuiet
  const displayProjects = [...projects].sort((a, b) => Number(Boolean(b.image)) - Number(Boolean(a.image)))
  function closeDetail() { detail.current?.close(); setOpened(null); requestAnimationFrame(() => trigger.current?.focus()) }
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    root.current.querySelector('button')?.focus()
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setSystemQuiet(media.matches)
    media.addEventListener('change', update)
    return () => { document.body.style.overflow = previous; media.removeEventListener('change', update) }
  }, [])
  useLayoutEffect(() => {
    const context = gsap.context(() => {
      const arrival = gsap.timeline()
      arrival.fromTo('.projects-title > span', { yPercent: quiet ? 0 : 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: quiet ? .15 : .8, ease: 'power4.out' })
      arrival.fromTo('.project-tile', { opacity: 0, y: quiet ? 0 : 55 }, { opacity: 1, y: 0, duration: quiet ? .15 : .8, stagger: quiet ? 0 : .09, ease: 'power3.out', clearProps: 'transform,opacity' }, quiet ? 0 : .15)
      if (!quiet) arrival.fromTo('.tile-preview .project-frame', { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: .9, stagger: .09, ease: 'power3.inOut', clearProps: 'clipPath' }, .2)
    }, deck)
    return () => context.revert()
  }, [quiet])
  useEffect(() => {
    if (!opened) return
    detail.current.showModal()
    detail.current.scrollTop = 0
    const context = gsap.context(() => {
      const origin = trigger.current?.getBoundingClientRect()
      const bounds = detail.current.getBoundingClientRect()
      gsap.fromTo(detail.current, { opacity: 0, y: quiet ? 0 : (origin ? origin.top + origin.height / 2 - bounds.top - bounds.height / 2 : 25) * .12, scale: quiet ? 1 : .94 }, { opacity: 1, y: 0, scale: 1, duration: quiet ? .15 : .5, ease: 'power3.out', clearProps: 'transform,opacity' })
      if (receipt.current) gsap.fromTo(receipt.current, { clipPath: quiet ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)', y: quiet ? 0 : -18, opacity: quiet ? 0 : 1 }, { clipPath: 'inset(0 0 0% 0)', y: 0, opacity: 1, duration: quiet ? .16 : 1.7, ease: 'power1.inOut' })
    }, detail)
    return () => context.revert()
  }, [opened, quiet])
  function keys(event) {
    if (opened) return
    if (event.key === 'Escape') { event.preventDefault(); onClose() }
    if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
      const cards = [...deck.current.querySelectorAll('.project-tile')]
      const index = cards.indexOf(document.activeElement)
      if (index >= 0) {
        event.preventDefault()
        const direction = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1
        cards[(index + direction + cards.length) % cards.length].focus()
      }
    }
    if (event.key === 'Tab') {
      const buttons = [...root.current.querySelectorAll('button,a[href]')].filter(el => !el.closest('[inert]'))
      const first = buttons[0], last = buttons.at(-1)
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
  }
  return <section className={`project-browser ${quiet ? 'projects-quiet' : ''}`} ref={root} role="dialog" aria-modal="true" aria-label="Build project browser" onKeyDown={keys}>
    <header className="projects-header"><button className="projects-jp" onClick={onClose} aria-label="Back to mind">JP</button><span>BUILD / 02</span><button onClick={onClose}>Back to mind ↗</button></header>
    <main className="projects-workspace" ref={deck} aria-label="All projects">
      <div className="projects-masthead"><h1 className="projects-title"><span>BUILD<em>.</em></span></h1><span className="projects-total">{String(projects.length).padStart(2, '0')} / PROJECTS</span><span className="projects-rule" aria-hidden="true" /></div>
      <div className="projects-overview">
      {displayProjects.map(item => <button key={item.id} className={`project-tile ${item.image ? 'tile-featured' : 'tile-study'}`} onPointerMove={event => { if (quiet || event.pointerType !== 'mouse') return; const rect = event.currentTarget.getBoundingClientRect(); event.currentTarget.style.setProperty('--tilt-x', `${-(event.clientY - rect.top - rect.height / 2) / rect.height * 5}deg`); event.currentTarget.style.setProperty('--tilt-y', `${(event.clientX - rect.left - rect.width / 2) / rect.width * 5}deg`) }} onPointerLeave={event => { event.currentTarget.style.setProperty('--tilt-x', '0deg'); event.currentTarget.style.setProperty('--tilt-y', '0deg') }} aria-label={`Explore ${item.title}`} onClick={event => { trigger.current = event.currentTarget; setOpened(item) }}>
        <div className="tile-preview"><Preview project={item} /><span className="tile-invitation" aria-hidden="true">↗</span></div>
        <div className="tile-copy"><div className="tile-meta"><span>{String(projects.indexOf(item) + 1).padStart(2, '0')} / {item.tag}</span><span>{item.status}</span></div><h2>{item.title}</h2><p>{item.description}</p></div>
      </button>)}
      </div>
    </main>
    <footer className="projects-footer"><span>{String(projects.length).padStart(2, '0')} PROJECTS</span><button aria-pressed={motionOff} onClick={onMotionChange}>Motion {motionOff ? 'off' : 'on'}</button></footer>
    <dialog className="project-detail" ref={detail} aria-labelledby="project-detail-title" onCancel={e => { e.preventDefault(); closeDetail() }} onClick={e => { if (e.target === e.currentTarget) closeDetail() }}>
      {opened && <><div className="project-detail-top"><span>BUILD / {String(projects.indexOf(opened) + 1).padStart(2, '0')}</span><button autoFocus onClick={closeDetail}>Close ×</button></div><h2 id="project-detail-title">{opened.title}</h2><p className="project-detail-status">{opened.status}</p><Preview project={opened} />
      <div className={opened.id === 'expensidify' ? 'receipt-slot' : 'plain-project-facts'}><div ref={opened.id === 'expensidify' ? receipt : undefined} className={opened.id === 'expensidify' ? 'project-receipt' : ''}><p>{opened.description}</p><Stack project={opened} />{opened.features && <ul>{opened.features.map(fact => <li key={fact}>{fact}</li>)}</ul>}{opened.note && <small>{opened.note}</small>}{opened.id === 'expensidify' && <p className="receipt-status">Status: {opened.status}</p>}{opened.link && <a href={opened.link} target="_blank" rel="noopener noreferrer">Visit live site ↗{opened.id === 'expensidify' && <span className="receipt-url">{opened.link}</span>}</a>}</div></div>
      {opened.secondaryImage && <div className="project-frame secondary-preview"><img src={opened.secondaryImage} alt={opened.secondaryAlt} loading="lazy" decoding="async" /></div>}</>}
    </dialog>
  </section>
}

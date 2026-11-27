import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { personal } from '../data/personal'
import './PersonalPage.css'
import NowPlaying from './NowPlaying'

function LensDrawing() {
  return <svg className="journal-lens" viewBox="0 0 300 235" fill="none" aria-hidden="true"><path d="M 49 71 H 92 L 108 47 H 178 L 194 71 H 252 V 184 H 49 Z" stroke="currentColor" strokeWidth="1.2" /><circle cx="151" cy="127" r="49" stroke="currentColor" /><circle cx="151" cy="127" r="34" stroke="currentColor" strokeDasharray="1 5" /><circle cx="151" cy="127" r="22" stroke="currentColor" /><path d="M 61 87 H 83 M 219 84 H 239 M 151 65 V 71 M 151 183 V 189" stroke="currentColor" /><rect x="228" y="153" width="9" height="9" fill="#eb2f33" stroke="none" /></svg>
}

export default function PersonalPage({ section, onSectionChange, onClose, quiet, onMotionChange }) {
  const dialog = useRef(null), content = useRef(null), title = useRef(null), copyTimer = useRef(null), previousSection = useRef(null)
  const [topic, setTopic] = useState('general'), [copyStatus, setCopyStatus] = useState('')
  const about = section === 'about'
  const chosenTopic = personal.contact.topics.find(item => item.id === topic)
  const email = personal.contact.email
  const emailHref = email ? `mailto:${email}?subject=${encodeURIComponent(chosenTopic.subject)}` : ''
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.current.showModal()
    return () => { document.body.style.overflow = previous; clearTimeout(copyTimer.current) }
  }, [])
  useLayoutEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo('.personal-reveal', { opacity: 0, y: quiet ? 0 : 25 }, { opacity: 1, y: 0, duration: quiet ? .15 : .75, stagger: quiet ? 0 : .07, ease: 'power3.out', clearProps: 'transform,opacity' })
    }, content)
    if (previousSection.current !== section) {
      title.current?.focus({ preventScroll: true })
      dialog.current.scrollTop = 0
      previousSection.current = section
    }
    return () => context.revert()
  }, [section, quiet])
  async function copyEmail() {
    clearTimeout(copyTimer.current)
    try {
      await navigator.clipboard.writeText(email)
      setCopyStatus('Email copied.')
    } catch {
      setCopyStatus('Please select and copy the address above.')
    }
    copyTimer.current = setTimeout(() => setCopyStatus(''), 3500)
  }
  return <dialog ref={dialog} className={`personal-page ${about ? 'personal-about' : 'personal-contact'} ${quiet ? 'personal-quiet' : ''}`} aria-labelledby="personal-title" onCancel={event => { event.preventDefault(); onClose() }}>
    <header className="personal-page-header"><button className="personal-jp" onClick={onClose} aria-label="Return to portfolio">JP<span>®</span></button><nav aria-label="Personal pages"><button aria-current={about ? 'page' : undefined} onClick={() => onSectionChange('about')}>About me</button><button aria-current={!about ? 'page' : undefined} onClick={() => onSectionChange('contact')}>Contact ↗</button></nav><button className="personal-close" onClick={onClose}>Close ×</button></header>
    <main ref={content} className="personal-page-content" key={section}>
      {about ? <>
        <section className="personal-about-lead"><div><p className="personal-overline personal-reveal">ABOUT ME / {personal.name.toUpperCase()}</p><h1 id="personal-title" ref={title} tabIndex={-1} className="personal-reveal">{personal.headingLines.map(line => <span className="personal-title-line" key={line}>{line}</span>)}<span className="personal-title-line">in <em>{personal.headingAccent}</em></span></h1></div><nav className="journal-contents personal-reveal" aria-label="Inside my personal journal"><span className="journal-handwritten">A few things<br />on my mind.</span>{[['01','Reading','about-reading'],['02','Listening','about-listening'],['03','The little things','about-little-things']].map(([number,label,id]) => <a href={`#${id}`} key={id}><span>{number}</span>{label}<span aria-hidden="true">↓</span></a>)}</nav></section>
        <section className="personal-journal" aria-label="My personal journal">
          <article id="about-reading" className="journal-reading personal-reveal"><div className="journal-section-label"><span>01 / CURRENTLY READING</span><span className="reading-bookmark" aria-hidden="true" /></div><div className="reading-feature"><a className="reading-book-link" href={personal.reading.url} target="_blank" rel="noopener noreferrer" aria-label={`Read ${personal.reading.title} on Project Gutenberg`}><div className="reading-book" aria-hidden="true"><span className="book-author">ARTHUR<br />CONAN DOYLE</span><span className="book-rule" /><span className="book-title">The Adventures<br />of <em>Sherlock<br />Holmes</em></span><span className="book-orbit"><i /></span><span className="book-foot">A COLLECTION OF STORIES</span></div></a><div className="reading-copy"><p className="journal-handwritten">On my bookshelf,<br />in my head.</p><h2>{personal.reading.title}</h2><p className="reading-author">{personal.reading.author}</p><p>{personal.reading.note}</p><a className="journal-text-link" href={personal.reading.url} target="_blank" rel="noopener noreferrer">Read along with me ↗</a><span className="reading-source">Online at Project Gutenberg</span></div></div></article>
          <NowPlaying quiet={quiet} />
          <article id="about-little-things" className="journal-photography personal-reveal"><div className="journal-section-label">03 / THROUGH MY LENS</div><LensDrawing /><h2>Another way<br />of <em>seeing.</em></h2><p>Photography is a creative outlet that exists beyond my technical work.</p></article>
          <article className="journal-curiosity personal-reveal"><div className="journal-section-label">04 / A LITTLE HABIT</div><span className="curiosity-question" aria-hidden="true">?</span><h2>Asking <em>why.</em></h2><p>Understanding how things work, and finding connections between ideas.</p><div className="curiosity-margin" aria-hidden="true"><span>ideas</span><span>connections</span><span>possibilities</span></div></article>
          <article className="journal-communication personal-reveal"><div className="journal-section-label">05 / FINDING THE WORDS</div><div className="communication-lines" aria-hidden="true">{Array.from({length:6},(_,i)=><span key={i} />)}</div><h2>A thought,<br /><em>well expressed.</em></h2><p>{personal.communication}</p></article>
        </section>
        <section className="personal-story journal-story"><p className="personal-margin-note personal-reveal">The person<br /><em>between the interests.</em></p><div className="personal-bio"><p className="personal-reveal">{personal.paragraphs[0]}</p><details className="journal-more personal-reveal"><summary>A little more about me <span aria-hidden="true">+</span></summary>{personal.paragraphs.slice(1).map(paragraph=><p key={paragraph}>{paragraph}</p>)}</details></div></section>
        <div className="personal-next personal-reveal"><span>Something on your mind?</span><button onClick={() => onSectionChange('contact')}>Start a conversation ↗</button></div>
      </> : <>
        <section className="personal-contact-lead"><div className="contact-paperplane" aria-hidden="true"><svg viewBox="0 0 200 200" fill="none"><circle cx="100" cy="100" r="86" stroke="currentColor" strokeWidth=".5" strokeDasharray="1 6" /><path d="M 43 82 L 162 39 L 119 158 L 91 109 L 43 82 Z M 91 109 L 162 39 M 91 109 L 88 145 L 104 130" stroke="currentColor" strokeWidth="1.4" /><path d="M 19 160 C 70 183 111 184 136 172" stroke="#eb2f33" strokeWidth="2" /></svg></div><p className="personal-overline personal-reveal">CONTACT / A CONVERSATION STARTS HERE</p><h1 id="personal-title" ref={title} tabIndex={-1} className="personal-reveal"><span className="personal-title-line">{personal.contact.headingLines[0]}</span>{personal.contact.headingLines[1]} <em>{personal.contact.headingAccent}</em></h1><p className="personal-invitation personal-reveal">{personal.contact.invitation}</p></section>
        <section className="personal-contact-body"><div className="personal-reveal"><div className="personal-topics" role="group" aria-label="What would you like to talk about?">{personal.contact.topics.map((item,index) => <button key={item.id} aria-pressed={item.id===topic} onClick={() => setTopic(item.id)}><span className="contact-topic-number">{String(index+1).padStart(2,'0')}</span><span className="contact-topic-label">{item.label}<span>{item.title}</span></span><span className="contact-topic-arrow" aria-hidden="true">↗</span></button>)}</div><div className="personal-topic-copy" aria-live="polite" aria-atomic="true"><h2>{chosenTopic.title}</h2><p>{chosenTopic.description}</p></div></div>
          <div className="personal-address personal-reveal"><span className="personal-overline">EMAIL</span>{email ? <><a className="personal-email" href={emailHref}>{email}<span aria-hidden="true">↗</span></a><div className="personal-email-actions"><a href={emailHref}>Write an email ↗</a><button onClick={copyEmail}>Copy email</button></div><p className="personal-copy-status" role="status">{copyStatus}</p></> : <p>Contact details coming soon.</p>}{personal.contact.socials.filter(item=>item.url).length>0 && <nav className="personal-socials" aria-label="Social profiles">{personal.contact.socials.filter(item=>item.url).map(item=><a key={item.url} href={item.url} target="_blank" rel="noopener noreferrer">{item.label} ↗</a>)}</nav>}</div>
        </section>
      </>}
    </main>
    <footer className="personal-page-footer"><span>{personal.name.toUpperCase()}</span><button aria-pressed={quiet} onClick={onMotionChange}>Motion {quiet ? 'off' : 'on'}</button><button onClick={onClose}>Back to portfolio ↗</button></footer>
  </dialog>
}

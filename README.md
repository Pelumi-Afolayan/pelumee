# Afolayan Jesupelumi — Enter My Mind

Stage one: portrait introduction and a small exploration hub. Local prototype; not published.

## Run

npm install
npm run dev

## Build

npm run build
npm run preview

## Experience

- The opening uses the supplied photograph, with a separate optimised JPEG. The original remains untouched.
- GSAP coordinates the portrait zoom and dark transition; the animation logic is in src/App.jsx.
- Skip bypasses the sequence. Replay returns to the portrait. Returning within the same browser session opens the hub directly.
- Motion off and the operating system reduced-motion preference bypass the zoom and disable decorative transitions.
- Four hub buttons open native modal dialogs with focus restoration and Escape support.
- Responsive layouts adapt to narrow screens without scroll hijacking.

## Next stage

Curate project screenshots and photography, verify project feature status and public links, add full sections and contact details, and refine the portrait transition after feedback. No ranking claim or invented contact details are included.

## Landing motion update

The illustrated interior has been reverted. The original portrait hub, its four connected areas, About me, Contact, and the extended pixel passage remain. The landing now uses a coordinated CSS entrance: masked photographic reveal, staggered name lines, supporting text, and entry-marker reveal. Child layers animate independently so the GSAP zoom can control their parents without conflicting transforms. Motion off and the system reduced-motion setting bypass entrance effects.

## Capture gallery

The exploration now has Build, Capture, and Learn. Cyber & Privacy internship experience is included in Build.

PhotoDrum is in src/components/PhotoDrum.jsx. Add approximately 800px-wide photographs to public/images/gallery and edit src/data/photos.js. Each entry needs src (e.g. /images/gallery/photo-01.webp), descriptive alt text, title, and a verified caption. The current generated SVGs are clearly labelled placeholders.

PhotoDrum props: turnSeconds=80 controls desktop seconds per turn; cardWidth=290 controls desktop card width; radiusScale=1 multiplies cardWidth/(2*tan(PI/count)). Keep radiusScale=1 for edge-to-edge placement. Card count comes from the photos array; four or more entries use the drum, fewer use the accessible strip. Mobile uses 180px cards (or 47vw when smaller), with automatic rotation disabled. No new dependencies.

Mouse drag and touch swipe rotate with a short inertial coast; wheel and arrow keys rotate. Hover or keyboard focus pauses desktop idle rotation. Clicking a photo opens its lightbox. Escape closes the lightbox first, then the gallery. Closing Capture restores focus to its exploration button. Motion off or the OS reduced-motion preference uses a horizontal scroll-snap strip with the same lightbox. Effects and listeners are removed on gallery unmount.


## BUILD project browser

Project content lives in `src/data/projects.js`. Edit the description, stack array, status and link there. An empty stack array or empty link renders nothing. Keep unverified features explicitly marked in progress.

Screenshots live in `public/images/projects/`. Reference them with paths such as `/images/projects/tuni-home.png`. `imageAlt` describes the screenshot. Empty images display “Preview coming soon”. Expensidify also supports `secondaryImage` and `secondaryAlt` for its login screenshot. Avoid putting credentials or private information in screenshots.

`ProjectBrowser.jsx` shows all five projects in an animated overview. Select a card to open its native detail dialog; arrow keys move focus between cards. Desktop features the two projects with screenshots above three compact project studies. Smaller screens use two columns or one scrollable column. The overview has staggered frame reveals and subtle pointer tilt, disabled by motion preferences. Only the Expensidify detail prints a receipt. Motion off and system reduced motion remove stacking/printing movements. BUILD returns focus to its original exploration control; closing a project detail returns focus to Explore project.


## The Field

`src/components/Field.jsx` owns the post-zoom exploration interface. BUILD, CAPTURE and LEARN contents are unchanged. Their original region buttons regain focus after returning; the paper keeps its pan/scroll position.

Tuning:
- `FIELD_REGIONS`: edit x/y percentages and size to move or resize each SVG mark. Keep generous viewport margins; desktop pan is capped at 45px horizontally and 32px vertically, with tighter bounds on smaller viewports.
- `FIELD_SETTINGS.cameraScale`: desktop fly-in scale (2.6).
- `FIELD_SETTINGS.flySeconds`: desktop fly-in duration (1.1 seconds).
- `FIELD_SETTINGS.pixelCount`: sparse terrain pixels (30). Keep this near 30. If reducing below 24, also reduce the silhouette-fragment count in App.jsx.
- `FIELD_PIXELS`: deterministic positions, sizes and the exact amber/gold/sage colours from the original zoom.
- The final handoff is in `App.jsx`: Field mounts at 3.05s, portrait dissolves from 3.25s, pixels decelerate from 3.45s, and the handoff completes at 4.95s. The original landing and early zoom are retained. The last burst segment is shortened by .4s to make room for deceleration.
- Mobile uses three vertically snapping screens. Bottom index buttons scroll to a region; tapping the region opens it. Motion off/system reduced motion removes drift, pan, zoom and parallax.


## Homepage colour direction
The opening now uses sky blue (#3c9dd8), cloud white (#f8fafc) and scarlet (#eb2f33), inspired by the supplied tennis-site reference. Oversized condensed name typography, the original portrait and scarlet temple invitation establish the opening. These colours are scoped to the opening; The Field retains its paper/ink/amber/sage colours and the original zoom pixel colours.


## Field refinement controls

In `src/components/Field.jsx`:
- `FIELD_SETTINGS.forwardSeconds` sets each slow forward-travel leg (70 seconds; desktop only).
- `FIELD_SETTINGS.parallax` controls pointer parallax (12; far/mid/near multipliers are .3/.75/2).
- `FIELD_SETTINGS.nearBlur` sets the static blur in pixels for the six near fragments (3px). No marks or words use blur.
- `FIELD_SETTINGS.pixelCount` sets clustered far-pixel density (30). Near-pixel positions and sizes are in `NEAR_PIXELS` (capped at six).
- `FIELD_REGIONS` contains mark sizes/positions, the three permitted words per region, and `wordPositions` as percentage x/y pairs relative to the mark. Mobile word placement overrides are in `Field.css`.
- CSS controls mark loop timing (build 17s, aperture 80s/9s, strata 22s) and grain/vignette intensity. Loops pause through `field-paused` when the tab is hidden or a destination is open. Motion off/reduced motion disables every idle loop and parallax. Mobile removes the near layer and forward travel.

Homepage refinement: cloud white is now the base. Blue is restricted to the top rule, small labels and temple rings; scarlet is used for the entry control. Primary headings across the opening and project views share Arial/Helvetica bold; Consolas is metadata and Georgia italic is reserved for editorial accents and Field word clusters.


## Living-atlas marks
The Field now uses real product screenshot fragments for BUILD, a six-blade aperture for CAPTURE, and three overlapping record sheets for LEARN. Primary project previews come directly from `src/data/projects.js` (Expensidify and Tuni). Three outlined pieces preserve the five-project composition without inventing previews. Keyboard focus and pointer approach assemble the workspace, open the aperture and unfold the record; reduced motion keeps them static.

`Mark` in `Field.jsx` owns the inline SVG artwork. Region size and position remain in `FIELD_REGIONS`. `Contours` places four local curves around each region instead of spanning the whole background. Hover/focus responses live in the living-atlas block in `Field.css`. No destination content or homepage styling changed in this refinement.


## About me and Contact

`src/data/personal.js` contains the initial bio, personal notes, heading text, approved email and enquiry topics. About uses the supplied working bio rather than inferred personality claims. The reading note is labelled “On the bookshelf” so it does not claim the book is still being read. Unconfirmed community counts, private details and third-party stock images are not included.

Contact uses the approved address `jayphee247@gmail.com`. Selecting BUILD, CAPTURE or GENERAL changes the `mailto:` subject; it does not submit a form or send a message automatically. Copy email reports success or offers a manual-copy fallback. Add social profiles only after the owner provides exact public URLs, using `{ label: 'LinkedIn', url: '...' }` entries in `contact.socials`; empty entries stay hidden.

`PersonalPage.jsx` renders both full-screen native dialogs with shared navigation, Escape handling, focus return, and motion controls. `PersonalPage.css` styles the white editorial layout and mobile stack. Entrance animation is a GSAP stagger with a short fade for reduced motion. BUILD, CAPTURE, LEARN and the opening retain their existing content and flows.


## About: personal journal and live listening

About is now a five-feature personal journal: currently reading, Spotify listening, photography, curiosity and communication. `personal.reading` owns the confirmed current book, author and Project Gutenberg link. The illustrated book is a custom typographic object, not an unlicensed cover image. The bio remains below the journal with the remaining paragraphs available in an accessible disclosure.

`NowPlaying.jsx` fetches the server endpoint only while mounted and its tab is visible. It honestly distinguishes unconnected, idle, playing, paused and unavailable states. Track artwork and a Spotify link appear only when returned by Spotify; no favourite song is invented. To connect the actual account, follow **SPOTIFY_SETUP.md**. Public email/contact behavior is unchanged.


## Field scene revision

The atlas diagrams have been replaced with larger dimensional scenes. BUILD uses a layered pair of real screenshots and a small index of the remaining projects. CAPTURE renders a miniature inward CSS 3D gallery from the same `photos` data as the full drum, with slow GSAP rotation and face culling; it pauses when hidden, when a destination is open, or when motion is off. Its radius follows the preview card width and photo count. Existing placeholder images stay clearly marked. LEARN previews an unfolding academic record.

Scene positions and maximum widths are in `FIELD_REGIONS`; short-viewport and mobile sizing are in `Field.css`. The paper, fixed navigation, pan, fly-in, reverse and mobile snap behavior are retained. The map contours have been removed in favor of a sparse trajectory between the scenes. The homepage entrance and destination contents are unchanged.

About's retired university-community feature is now **Finding the words**, using the supplied interest in improving communication. Reading and listening features are unchanged; Spotify account setup remains deferred. Contact now has selectable enquiry rows, a paper-plane illustration and a prominent email area. It retains the same public email, subject links and copy control.

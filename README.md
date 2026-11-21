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

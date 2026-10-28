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

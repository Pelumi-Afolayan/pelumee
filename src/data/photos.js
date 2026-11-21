// Replace each src with an approximately 800px-wide photograph in public/images/gallery.
// Add your own accurate alt text, title, and caption. These are placeholders, not portfolio work.
const placeholder = (number) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000"><rect width="800" height="1000" fill="#20241f"/><path d="M60 60H740V940H60Z M400 60V940 M60 500H740" fill="none" stroke="#606854" stroke-width="1"/><circle cx="400" cy="430" r="100" fill="none" stroke="#b49159"/><text x="400" y="450" text-anchor="middle" font-family="monospace" font-size="46" fill="#d6c39d">${number}</text><text x="400" y="620" text-anchor="middle" font-family="monospace" font-size="23" fill="#d5d7cb">PHOTO PLACEHOLDER</text></svg>`)}`

export const photos = Array.from({ length: 10 }, (_, index) => ({
  src: placeholder(String(index + 1).padStart(2, '0')),
  alt: `Placeholder ${index + 1}; no photograph added yet`,
  title: `Photo ${String(index + 1).padStart(2, '0')} — placeholder`,
  caption: 'Caption placeholder',
}))

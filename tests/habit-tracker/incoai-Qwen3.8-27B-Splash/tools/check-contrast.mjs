// Rechnet WCAG-2.x-Kontrastverhältnisse für die Rhythm-Farbpaare und zeigt sie als Tabelle.
// Aufruf: node tools/check-contrast.mjs
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)).map((v) => v / 255)
const lin = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
function luminance(hexColor) {
  const [r, g, b] = hex(hexColor).map(lin)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
function ratio(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

const pairs = [
  // Text auf Flächen (AA Normaltext: >= 4.5)
  ['Light: Tinte #111111 auf Canvas #FBFAF8', '#111111', '#FBFAF8', 4.5],
  ['Light: Fließtext #2F3437 auf Karte #FFFFFF', '#2F3437', '#FFFFFF', 4.5],
  ['Light: Sekundär #6F6E69 auf Karte #FFFFFF', '#6F6E69', '#FFFFFF', 4.5],
  ['Light: Sekundär #6F6E69 auf Canvas #FBFAF8', '#6F6E69', '#FBFAF8', 4.5],
  ['Light: Drittstufe #73726D auf Karte #FFFFFF', '#73726D', '#FFFFFF', 4.5],
  ['Light: Drittstufe #73726D auf Canvas #FBFAF8', '#73726D', '#FBFAF8', 4.5],
  ['Dark: Tinte #F2F1EC auf Fläche #1D1C1A', '#F2F1EC', '#1D1C1A', 4.5],
  ['Dark: Fließtext #D6D5D0 auf Fläche #1D1C1A', '#D6D5D0', '#1D1C1A', 4.5],
  ['Dark: Sekundär #8D8C86 auf Fläche #1D1C1A', '#8D8C86', '#1D1C1A', 4.5],
  ['Dark: Sekundär #8D8C86 auf Canvas #151412', '#8D8C86', '#151412', 4.5],
  ['Dark: Drittstufe #85847F auf Fläche #1D1C1A', '#85847F', '#1D1C1A', 4.5],
  ['Dark: Drittstufe #85847F auf Canvas #151412', '#85847F', '#151412', 4.5],
  // Akzentflächen: Check-Symbole (Grafik, AA: >= 3.0)
  ['Light: weißes Häkchen auf Terrakotta #A2491F', '#FFFFFF', '#A2491F', 3.0],
  ['Light: weißes Häkchen auf Moos #4C6B33', '#FFFFFF', '#4C6B33', 3.0],
  ['Light: weißes Häkchen auf See #31648E', '#FFFFFF', '#31648E', 3.0],
  ['Light: weißes Häkchen auf Pflaume #7D4A66', '#FFFFFF', '#7D4A66', 3.0],
  ['Light: weißes Häkchen auf Ocker #8A6A1C', '#FFFFFF', '#8A6A1C', 3.0],
  ['Light: weißes Häkchen auf Schiefer #55565B', '#FFFFFF', '#55565B', 3.0],
  ['Dark: Tinten-Häkchen auf Terrakotta #DD8A5E', '#111111', '#DD8A5E', 3.0],
  ['Dark: Tinten-Häkchen auf Moos #A3BC83', '#111111', '#A3BC83', 3.0],
  ['Dark: Tinten-Häkchen auf See #84AAC9', '#111111', '#84AAC9', 3.0],
  ['Dark: Tinten-Häkchen auf Pflaume #C68FA6', '#111111', '#C68FA6', 3.0],
  ['Dark: Tinten-Häkchen auf Ocker #D2B35C', '#111111', '#D2B35C', 3.0],
  ['Dark: Tinten-Häkchen auf Schiefer #A9A9A3', '#111111', '#A9A9A3', 3.0],
  // Weitere Grafiken
  ['Light: Fortschrittsbalken #111111 auf Spur #EAEAEA', '#111111', '#EAEAEA', 3.0],
  ['Dark: Fortschrittsbalken #F2F1EC auf Spur #2A2926', '#F2F1EC', '#2A2926', 3.0],
  ['Light: Stimmungs-Linie #A2491F auf Karte #FFFFFF', '#A2491F', '#FFFFFF', 3.0],
  ['Dark: Stimmungs-Linie #DD8A5E auf Karte #1D1C1A', '#DD8A5E', '#1D1C1A', 3.0],
  ['Light: Chart-Balken #111111 auf Karte #FFFFFF', '#111111', '#FFFFFF', 3.0],
  ['Dark: Chart-Balken #F2F1EC auf Karte #1D1C1A', '#F2F1EC', '#1D1C1A', 3.0],
  ['Primary-Button Light: #FFFFFF auf #111111', '#FFFFFF', '#111111', 4.5],
  ['Primary-Button Dark: #151412 auf #F2F1EC', '#151412', '#F2F1EC', 4.5],
]

let allPass = true
const lines = []
for (const [name, a, b, need] of pairs) {
  const r = ratio(a, b)
  const pass = r >= need
  if (!pass) allPass = false
  lines.push(`${name}: ${r.toFixed(2)}:1 (erforderlich ${need}:1) ${pass ? 'PASS' : 'FAIL'}`)
}
console.log(lines.join('\n'))
console.log(`\nGesamt: ${allPass ? 'ALLE PAARE BESTANDEN' : 'MINDESTENS EINS FEHLT'}`)

// Smoke test for Rhythm PWA Habit & Mood Tracker
// Tests data-testid attributes in the rendered HTML

const http = require('http')

const TEST_URL = process.argv[2] || 'http://localhost:4173'

// Simple check: fetch the HTML and look for data-testid attributes
function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => resolve(data))
    }).on('error', reject)
  })
}

const tests = [
  { name: 'nav-today', selector: 'data-testid="nav-today"' },
  { name: 'nav-week', selector: 'data-testid="nav-week"' },
  { name: 'nav-settings', selector: 'data-testid="nav-settings"' },
  { name: 'progress', selector: 'data-testid="progress"' },
  { name: 'habit-add', selector: 'data-testid="habit-add"' },
  { name: 'habit-name', selector: 'data-testid="habit-name"' },
  { name: 'habit-save', selector: 'data-testid="habit-save"' },
  { name: 'habit-item', selector: 'data-testid="habit-item"' },
  { name: 'habit-toggle', selector: 'data-testid="habit-toggle"' },
  { name: 'habit-streak', selector: 'data-testid="habit-streak"' },
  { name: 'mood-1', selector: 'data-testid="mood-1"' },
  { name: 'mood-2', selector: 'data-testid="mood-2"' },
  { name: 'mood-3', selector: 'data-testid="mood-3"' },
  { name: 'mood-4', selector: 'data-testid="mood-4"' },
  { name: 'mood-5', selector: 'data-testid="mood-5"' },
  { name: 'week-chart', selector: 'data-testid="week-chart"' },
  { name: 'theme-toggle', selector: 'data-testid="theme-toggle"' }
]

async function runTests() {
  console.log(`Teste: ${TEST_URL}`)
  const html = await fetchHTML(TEST_URL)
  let passed = 0
  let failed = 0
  
  for (const test of tests) {
    const found = html.includes(test.selector)
    if (found) {
      console.log(`✓ PASS: ${test.name}`)
      passed++
    } else {
      console.log(`✗ FAIL: ${test.name} (not found in HTML)`)
      failed++
    }
  }
  
  console.log(`\nErgebnis: ${passed} von ${tests.length} Prüfungen bestanden.`)
  process.exit(failed > 0 ? 1 : 0)
}

runTests().catch(err => {
  console.error('Test error:', err)
  process.exit(1)
})
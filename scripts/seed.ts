import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DB_PATH = process.env.DATABASE_URL || './data/resort-os.db'
const WORKSPACE = path.resolve(__dirname, '../../')

// Ensure data dir exists
const dir = path.dirname(DB_PATH)
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// Read SQL init from db/index.ts init function — we duplicate it here for standalone execution
// (In production we'd share this, but for a seed script this is fine)

console.log('🌺 ResortOS Seed — Bootstrapping from markdown workspace...\n')

// ── Create tables ──────────────────────────────────────────────────────────

const initSQL = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf-8')
db.exec(initSQL)

// ── Seed Organization ──────────────────────────────────────────────────────

function readFile(relativePath: string): string | null {
  const fullPath = path.join(WORKSPACE, relativePath)
  if (!fs.existsSync(fullPath)) return null
  return fs.readFileSync(fullPath, 'utf-8')
}

console.log('1. Creating organization...')
const soulMd = readFile('SOUL.md') || ''
const configMd = readFile('CONFIG.md') || ''

// Extract values from SOUL.md
const missionMatch = soulMd.match(/## (?:Mise|Mission)\s*\n([\s\S]*?)(?=\n##|\n---)/i)
const valuesMatch = soulMd.match(/## (?:Hodnoty|Values)\s*\n([\s\S]*?)(?=\n##|\n---)/i)
const antiGoalsMatch = soulMd.match(/## Anti[- ]?[Gg]oals?\s*\n([\s\S]*?)(?=\n##|\n---)/i)

const values = valuesMatch
  ? valuesMatch[1].split('\n').filter(l => l.startsWith('-')).map(l => {
      const parts = l.replace(/^-\s*\**/, '').split(/[—–:]/)
      return { name: parts[0]?.trim().replace(/\**/g, '') || '', description: parts.slice(1).join(':').trim() }
    })
  : []

const antiGoals = antiGoalsMatch
  ? antiGoalsMatch[1].split('\n').filter(l => l.startsWith('-')).map(l => l.replace(/^-\s*/, '').trim())
  : []

db.prepare(`
  INSERT OR REPLACE INTO organizations (id, name, slug, mission, "values", anti_goals, language, timezone)
  VALUES (1, ?, ?, ?, ?, ?, 'cs', 'Asia/Makassar')
`).run(
  'Poinciana Global Village',
  'poinciana',
  missionMatch?.[1]?.trim() || 'AI-operated retreat center network',
  JSON.stringify(values),
  JSON.stringify(antiGoals),
)
console.log('   ✅ Organization created')

// ── Seed Engines ───────────────────────────────────────────────────────────

console.log('2. Creating engines...')
const engineData = [
  { name: 'Growth', slug: 'growth', emoji: '📈', color: '#f472b6', description: 'Acquire customers and build brand awareness' },
  { name: 'Fulfillment', slug: 'fulfillment', emoji: '⚙️', color: '#60a5fa', description: 'Deliver exceptional retreat experiences' },
  { name: 'Innovation', slug: 'innovation', emoji: '🚀', color: '#a78bfa', description: 'Build RetreatOS and explore new horizons' },
]

const insertEngine = db.prepare(`
  INSERT OR REPLACE INTO engines (id, org_id, name, slug, emoji, color, description, status)
  VALUES (?, 1, ?, ?, ?, ?, ?, 'active')
`)

engineData.forEach((e, i) => insertEngine.run(i + 1, e.name, e.slug, e.emoji, e.color, e.description))
console.log('   ✅ 3 engines created')

// ── Seed Projects ──────────────────────────────────────────────────────────

console.log('3. Creating projects...')
const projectData = [
  { name: 'Poinciana Bali', slug: 'poinciana-bali', description: 'First retreat center — Northern Bali', status: 'active' },
  { name: 'RetreatOS', slug: 'retreat-os', description: 'AI platform for retreat management', status: 'active' },
  { name: 'Poinciana Global', slug: 'poinciana-global', description: 'Global network of retreat centers', status: 'concept' },
]

const insertProject = db.prepare(`
  INSERT OR REPLACE INTO projects (id, org_id, name, slug, description, status)
  VALUES (?, 1, ?, ?, ?, ?)
`)

projectData.forEach((p, i) => insertProject.run(i + 1, p.name, p.slug, p.description, p.status))
console.log('   ✅ 3 projects created')

// ── Seed Team Members ──────────────────────────────────────────────────────

console.log('4. Creating team members...')
const insertMember = db.prepare(`
  INSERT OR REPLACE INTO team_members (id, org_id, name, slug, type, status, email, timezone, avatar_emoji, ai_model, max_concurrent_tasks)
  VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

insertMember.run(1, 'David Kirš', 'david', 'human', 'active', 'david@kirs.cz', 'Asia/Makassar', 'D', null, 3)
insertMember.run(2, 'Poinciana AI', 'poinciana-ai', 'ai', 'active', null, 'Asia/Makassar', '🌺', 'Claude Opus', 5)
insertMember.run(3, 'Fabio', 'fabio', 'human', 'negotiation', null, null, 'F', null, 3)
insertMember.run(4, 'Míša Sklářová', 'misa', 'human', 'active', null, null, 'M', null, 3)
console.log('   ✅ 4 team members created')

// ── Seed Compass ───────────────────────────────────────────────────────────

console.log('5. Creating compass...')
const compassMd = readFile('COMPASS.md') || ''

const northStarMatch = compassMd.match(/## .*North Star.*\n([\s\S]*?)(?=\n##|\n---)/i)
const worksMatch = compassMd.match(/### .*[Ff]unguje.*\n([\s\S]*?)(?=\n###|\n##|\n---)/i)
const doesntWorkMatch = compassMd.match(/### .*[Nn]efunguje.*\n([\s\S]*?)(?=\n###|\n##|\n---)/i)
const gapsMatch = compassMd.match(/## .*[Gg]ap.*\n([\s\S]*?)(?=\n##|\n---)/i)

const works = worksMatch
  ? worksMatch[1].split('\n').filter(l => l.startsWith('-')).map(l => l.replace(/^-\s*/, '').trim())
  : []
const doesntWork = doesntWorkMatch
  ? doesntWorkMatch[1].split('\n').filter(l => l.startsWith('-')).map(l => l.replace(/^-\s*/, '').trim())
  : []

const gapLines = gapsMatch
  ? gapsMatch[1].split('\n').filter(l => l.match(/^\d+\.|^-/)).map(l => ({
      description: l.replace(/^\d+\.\s*|^-\s*/, '').replace(/\*\*/g, '').trim(),
      priority: 'HIGH',
      solution: '',
    }))
  : []

db.prepare(`
  INSERT OR REPLACE INTO compass (id, org_id, north_star, current_reality, gaps, updated_at)
  VALUES (1, 1, ?, ?, ?, datetime('now'))
`).run(
  northStarMatch?.[1]?.trim() || '$1M revenue @ 45% profit, 10M USD valuation in 3-5 years',
  JSON.stringify({ works, doesntWork, keyNumbers: [] }),
  JSON.stringify(gapLines),
)
console.log('   ✅ Compass created')

// ── Seed Tasks from TASKS.md ───────────────────────────────────────────────

console.log('6. Importing tasks...')
const tasksMd = readFile('TASKS.md') || ''
const taskLines = tasksMd.split('\n').filter(l => l.match(/^\d+\.\s/))

const insertTask = db.prepare(`
  INSERT INTO tasks (org_id, title, status, priority, created_at, updated_at)
  VALUES (1, ?, ?, ?, datetime('now'), datetime('now'))
`)

let taskCount = 0
for (const line of taskLines) {
  const title = line.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '').replace(/\s*\(.*?\)\s*$/, '').trim()
  if (!title || title.length < 3) continue

  const isHigh = line.toLowerCase().includes('high') || tasksMd.indexOf(line) < tasksMd.indexOf('MEDIUM')
  const isDone = line.includes('✅') || line.toLowerCase().includes('done') || line.toLowerCase().includes('completed')

  insertTask.run(title, isDone ? 'done' : 'backlog', isHigh ? 'high' : 'medium')
  taskCount++
}

// Also parse checkbox-style tasks
const checkboxLines = tasksMd.split('\n').filter(l => l.match(/^-\s*\[[ x]\]/))
for (const line of checkboxLines) {
  const isDone = line.includes('[x]')
  const title = line.replace(/^-\s*\[[ x]\]\s*/, '').replace(/\*\*/g, '').replace(/\|.*$/, '').trim()
  if (!title || title.length < 3) continue

  insertTask.run(title, isDone ? 'done' : 'backlog', 'medium')
  taskCount++
}

console.log(`   ✅ ${taskCount} tasks imported`)

// ── Seed Milestones ────────────────────────────────────────────────────────

console.log('7. Creating milestones...')
const insertMilestone = db.prepare(`
  INSERT INTO milestones (org_id, title, status, target_date, quarter, year, sort_order)
  VALUES (1, ?, ?, ?, ?, 2026, ?)
`)

const milestoneData = [
  { title: 'Due diligence complete', status: 'active', target: '2026-02-28', quarter: 'Q1-2026', order: 1 },
  { title: 'Fabio partnership decision', status: 'active', target: '2026-02-28', quarter: 'Q1-2026', order: 2 },
  { title: 'Setup PT company', status: 'pending', target: '2026-03-31', quarter: 'Q1-2026', order: 3 },
  { title: 'Exchange 5B IDR deposit', status: 'pending', target: '2026-03-15', quarter: 'Q1-2026', order: 4 },
  { title: 'Transfer 50% ownership', status: 'pending', target: '2026-05-31', quarter: 'Q2-2026', order: 5 },
  { title: 'RetreatOS Phase 1', status: 'pending', target: '2026-06-30', quarter: 'Q2-2026', order: 6 },
  { title: 'RetreatOS Phase 2', status: 'pending', target: '2026-12-31', quarter: 'Q3-2026', order: 7 },
]

milestoneData.forEach(m => insertMilestone.run(m.title, m.status, m.target, m.quarter, m.order))
console.log('   ✅ 7 milestones created')

// ── Seed Memory Logs ───────────────────────────────────────────────────────

console.log('8. Importing memory logs...')
const memoryDir = path.join(WORKSPACE, 'memory')
let logCount = 0
if (fs.existsSync(memoryDir)) {
  const files = fs.readdirSync(memoryDir).filter(f => f.match(/^\d{4}-\d{2}-\d{2}\.md$/))
  const insertLog = db.prepare(`
    INSERT INTO memory_logs (org_id, date, content, log_type, author_id)
    VALUES (1, ?, ?, 'daily', 2)
  `)
  for (const file of files) {
    const date = file.replace('.md', '')
    const content = fs.readFileSync(path.join(memoryDir, file), 'utf-8')
    insertLog.run(date, content)
    logCount++
  }
}
console.log(`   ✅ ${logCount} memory logs imported`)

// ── Seed Activity ──────────────────────────────────────────────────────────

console.log('9. Creating initial activity...')
db.prepare(`
  INSERT INTO activity_log (org_id, actor_id, action, description)
  VALUES (1, 2, 'system_initialized', '🌺 ResortOS initialized — data imported from workspace')
`).run()
console.log('   ✅ Initial activity logged')

console.log('\n🎉 Seed complete! ResortOS is ready.')
console.log(`   Database: ${DB_PATH}`)
console.log(`   Workspace: ${WORKSPACE}`)

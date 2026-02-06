import { db, initDB } from '@/lib/db'
import { organizations, engines, projects, teamMembers, compass, milestones, tasks, roles, activityLog } from '@/lib/db/schema'
import { jsonResponse, errorResponse } from '@/lib/api/middleware'

export const dynamic = 'force-dynamic'

// POST /api/v1/seed — Seed database with Poinciana data
export async function POST() {
  try {
    initDB()

    // Check if already seeded
    const existing = db.select().from(organizations).all()
    if (existing.length > 0) {
      return errorResponse('Database already seeded. Delete data/resort-os.db and restart to re-seed.', 409)
    }

    // 1. Organization
    db.insert(organizations).values({
      id: 1,
      name: 'Poinciana Global Village',
      slug: 'poinciana',
      mission: 'Vytvořit síť regenerativních retreat center, kde se propojuje osobní transformace s komunitním životem a technologickými inovacemi.',
      higherMission: 'Do roku 2028: 3 fungující retreat centra (Bali, Evropa, Latinská Amerika) s 200+ community members a self-sustaining ekonomikou.',
      values: JSON.stringify([
        { name: 'Autenticita', description: 'Pravdivost ve všem co děláme' },
        { name: 'Regenerace', description: 'Dáváme víc než bereme' },
        { name: 'Komunita', description: 'Společně jsme silnější' },
        { name: 'Inovace', description: 'Technologie ve službách lidskosti' },
        { name: 'Odvaha', description: 'Nebát se nových cest' },
      ]),
      antiGoals: JSON.stringify([
        'Nehonit se za rychlým růstem na úkor kvality',
        'Nestavět byznys na dluhu',
        'Neobětovat well-being týmu',
      ]),
    }).run()

    // 2. Engines
    db.insert(engines).values([
      { id: 1, orgId: 1, name: 'Growth', slug: 'growth', emoji: '📈', description: 'Marketing, sales, partnerships, investor relations', color: '#f472b6' },
      { id: 2, orgId: 1, name: 'Fulfillment', slug: 'fulfillment', emoji: '⚙️', description: 'Operations, construction, guest experience, community', color: '#60a5fa' },
      { id: 3, orgId: 1, name: 'Innovation', slug: 'innovation', emoji: '🚀', description: 'Technology, AI systems, RetreatOS platform, R&D', color: '#a78bfa' },
    ]).run()

    // 3. Projects
    db.insert(projects).values([
      { id: 1, orgId: 1, name: 'Poinciana Bali', slug: 'poinciana-bali', description: 'Seaside retreat center in Bali — first physical location' },
      { id: 2, orgId: 1, name: 'RetreatOS', slug: 'retreat-os', description: 'Technology platform for retreat management' },
      { id: 3, orgId: 1, name: 'Poinciana Global', slug: 'poinciana-global', description: 'Global expansion and brand development' },
    ]).run()

    // 4. Roles (before team members so we can reference them)
    db.insert(roles).values([
      { id: 1, orgId: 1, name: 'CEO Coordinator', slug: 'ceo-coordinator', engineId: null, roleType: 'hybrid', purpose: 'Strategické řízení, rozhodování, fundraising, partnerství' },
      { id: 2, orgId: 1, name: 'System Guardian', slug: 'system-guardian', engineId: null, roleType: 'ai', purpose: 'Monitoring systémů, reporting, udržování pořádku v datech' },
      { id: 3, orgId: 1, name: 'Growth Master', slug: 'growth-master', engineId: 1, roleType: 'ai', purpose: 'Marketing strategy, lead generation, content planning' },
      { id: 4, orgId: 1, name: 'Operations Hero', slug: 'operations-hero', engineId: 2, roleType: 'ai', purpose: 'Operational planning, vendor management, logistics' },
      { id: 5, orgId: 1, name: 'Research Strategist', slug: 'research-strategist', engineId: 3, roleType: 'ai', purpose: 'Market research, competitive analysis, technology scouting' },
      { id: 6, orgId: 1, name: 'Finance Pro', slug: 'finance-pro', engineId: null, roleType: 'ai', purpose: 'Financial modeling, budgeting, investor materials' },
    ]).run()

    // 5. Team Members
    db.insert(teamMembers).values([
      { id: 1, orgId: 1, name: 'David', slug: 'david', type: 'human', avatarEmoji: '👤', email: null, roleId: 1 },
      { id: 2, orgId: 1, name: 'Poinciana AI', slug: 'poinciana-ai', type: 'ai', avatarEmoji: '🤖', roleId: 2, aiModel: 'claude-sonnet-4', openclawAgentId: 'poinciana' },
      { id: 3, orgId: 1, name: 'Fabio', slug: 'fabio', type: 'human', avatarEmoji: '👤', roleId: null },
      { id: 4, orgId: 1, name: 'Míša Sklářová', slug: 'misa-sklarova', type: 'human', avatarEmoji: '👤', roleId: null },
    ]).run()

    // 6. Compass
    db.insert(compass).values({
      orgId: 1,
      northStar: 'Do 2028: Poinciana je uznávaná síť regenerativních retreat center s funkční komunitou 200+ lidí a self-sustaining ekonomikou.',
      purpose: 'Propojit osobní transformaci, komunitní život a technologické inovace v regenerativním prostředí.',
      currentReality: JSON.stringify({
        works: [
          'Silná vize a osobní drive',
          'Partnership s Fabiem na Bali',
          'AI-powered project management (OpenClaw)',
          'Míša pro brand & community',
          'Právní struktura PT v přípravě',
        ],
        doesntWork: [
          'Chybí hotový produkt / fyzický prostor',
          'Omezený kapitál pro realizaci',
          'Žádní platící klienti zatím',
          'Remote-only tým, chybí lokální přítomnost na Bali',
        ],
      }),
      gaps: JSON.stringify([
        { description: 'Chybí pozemek / prostor na Bali', priority: 'high', solution: 'Scouting s Fabiem, budget 5-8B IDR' },
        { description: 'Chybí legal setup (PT)', priority: 'high', solution: 'Notář + legal partner na Bali' },
        { description: 'Chybí brand presence', priority: 'medium', solution: 'Web + social media + content strategy' },
        { description: 'Chybí revenue model validace', priority: 'medium', solution: 'Pre-booking campaign, investor deck' },
        { description: 'Chybí stavební projekt', priority: 'low', solution: 'Architekt po zajištění pozemku' },
      ]),
      strategicAnchors: JSON.stringify([
        'Community-first: Budujeme komunitu PŘED fyzickým prostorem',
        'Asset-light start: Pronájem / coliving než stavba',
        'AI-native operations: Automatizace od začátku',
        'Regenerative economics: Cirkulární model, ne extraktivní',
        'Glocal: Globální síť, lokální implementace',
      ]),
    }).run()

    // 7. Milestones
    db.insert(milestones).values([
      { orgId: 1, title: 'PT Company Founded', quarter: 'Q1 2026', status: 'active', engineId: 2, targetDate: '2026-03-31', sortOrder: 1 },
      { orgId: 1, title: 'Land / Space Secured in Bali', quarter: 'Q1 2026', status: 'pending', engineId: 2, targetDate: '2026-03-31', sortOrder: 2 },
      { orgId: 1, title: 'Brand & Website Launch', quarter: 'Q2 2026', status: 'pending', engineId: 1, targetDate: '2026-06-30', sortOrder: 3 },
      { orgId: 1, title: 'First 50 Community Members', quarter: 'Q2 2026', status: 'pending', engineId: 1, targetDate: '2026-06-30', sortOrder: 4 },
      { orgId: 1, title: 'RetreatOS MVP Live', quarter: 'Q2 2026', status: 'active', engineId: 3, targetDate: '2026-06-30', sortOrder: 5 },
      { orgId: 1, title: 'First Retreat Event', quarter: 'Q3 2026', status: 'pending', engineId: 2, targetDate: '2026-09-30', sortOrder: 6 },
      { orgId: 1, title: 'Seed Investment Round', quarter: 'Q4 2026', status: 'pending', engineId: 1, targetDate: '2026-12-31', sortOrder: 7 },
    ]).run()

    // 8. Tasks
    db.insert(tasks).values([
      { orgId: 1, title: 'Připravit investor deck pro seed round', status: 'backlog', priority: 'high', engineId: 1, ownerId: 2, description: 'Vytvořit 10-slide investor pitch deck s financials, traction, a team slide.' },
      { orgId: 1, title: 'Finalizovat PT company registraci', status: 'in_progress', priority: 'high', engineId: 2, ownerId: 1, description: 'Dokončit registraci PT s notářem na Bali. Potřeba KTP Fabia.', startedAt: new Date().toISOString() },
      { orgId: 1, title: 'Navrhnout brand identity a logo', status: 'backlog', priority: 'high', engineId: 1, ownerId: 4, description: 'Brand guidelines, logo, barevná paleta, tone of voice pro Poinciana.' },
      { orgId: 1, title: 'Scouting pozemků v Canggu/Ubud oblasti', status: 'in_progress', priority: 'high', engineId: 2, ownerId: 3, description: 'Projít 5-10 potenciálních pozemků, vyhodnotit lokaci, cenu, legal status.', startedAt: new Date().toISOString() },
      { orgId: 1, title: 'Vytvořit content strategy pro social media', status: 'backlog', priority: 'medium', engineId: 1, ownerId: 2, description: 'Content plan na 3 měsíce: Instagram, LinkedIn, blog.' },
      { orgId: 1, title: 'Research konkurenčních retreat center', status: 'backlog', priority: 'medium', engineId: 3, ownerId: 2, description: 'Zmapovat 10 top retreat center celosvětově, analyzovat jejich model, pricing, community.' },
      { orgId: 1, title: 'Setup automatizovaného reportingu', status: 'inbox', priority: 'medium', engineId: 3, ownerId: 2, description: 'Nastavit weekly automated reports z ResortOS pro celý tým.' },
    ]).run()

    // 9. Activity log
    db.insert(activityLog).values({
      orgId: 1,
      action: 'system_seeded',
      entityType: 'system',
      description: 'ResortOS database seeded with Poinciana Global Village data',
    }).run()

    return jsonResponse({
      success: true,
      message: 'Database seeded with Poinciana data',
      data: {
        organization: 1,
        engines: 3,
        projects: 3,
        team_members: 4,
        compass: 1,
        milestones: 7,
        roles: 6,
        tasks: 7,
      },
    })
  } catch (e: any) {
    return errorResponse(`Seed failed: ${e.message}`, 500)
  }
}

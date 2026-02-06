import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// ── Organizations ──────────────────────────────────────────────────────────

export const organizations = sqliteTable('organizations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  mission: text('mission'),
  higherMission: text('higher_mission'),
  values: text('values'), // JSON: [{name, description}]
  antiGoals: text('anti_goals'), // JSON: string[]
  audience: text('audience'),
  anchors: text('anchors'), // JSON: [{name, description}]
  language: text('language').default('cs'),
  timezone: text('timezone').default('Asia/Makassar'),
  status: text('status').default('active'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
})

// ── Projects ───────────────────────────────────────────────────────────────

export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orgId: integer('org_id').references(() => organizations.id),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  status: text('status').default('active'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
})

// ── Engines ────────────────────────────────────────────────────────────────

export const engines = sqliteTable('engines', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orgId: integer('org_id').references(() => organizations.id),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  goal: text('goal'),
  emoji: text('emoji'),
  color: text('color'),
  status: text('status').default('active'),
})

// ── Roles ──────────────────────────────────────────────────────────────────

export const roles = sqliteTable('roles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orgId: integer('org_id').references(() => organizations.id),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  engineId: integer('engine_id').references(() => engines.id),
  roleType: text('role_type').default('ai'), // human | ai | hybrid
  purpose: text('purpose'),
  accountabilities: text('accountabilities'), // JSON: string[]
  boundaries: text('boundaries'), // JSON: string[]
  autonomyMatrix: text('autonomy_matrix'), // JSON: {category: level}
  kpis: text('kpis'), // JSON: [{metric, target}]
  reportsTo: text('reports_to'),
  status: text('status').default('active'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
})

// ── Team Members ───────────────────────────────────────────────────────────

export const teamMembers = sqliteTable('team_members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orgId: integer('org_id').references(() => organizations.id),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  type: text('type').notNull(), // human | ai
  roleId: integer('role_id').references(() => roles.id),
  status: text('status').default('active'),
  email: text('email'),
  timezone: text('timezone'),
  avatarEmoji: text('avatar_emoji'),
  // AI-specific
  aiModel: text('ai_model'),
  aiConfig: text('ai_config'), // JSON
  openclawAgentId: text('openclaw_agent_id'),
  costPerSession: real('cost_per_session'),
  sessionsPerWeek: integer('sessions_per_week'),
  // General
  maxConcurrentTasks: integer('max_concurrent_tasks').default(3),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
})

// ── Tasks ──────────────────────────────────────────────────────────────────

export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orgId: integer('org_id').references(() => organizations.id),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull().default('inbox'),
  priority: text('priority').default('medium'),
  engineId: integer('engine_id').references(() => engines.id),
  projectId: integer('project_id').references(() => projects.id),
  ownerId: integer('owner_id').references(() => teamMembers.id),
  reviewerId: integer('reviewer_id').references(() => teamMembers.id),
  milestoneId: integer('milestone_id').references(() => milestones.id),
  blockerReason: text('blocker_reason'),
  blockedSince: text('blocked_since'),
  estimatedHours: real('estimated_hours'),
  impact: text('impact'),
  output: text('output'),
  learnings: text('learnings'),
  evaluationRating: integer('evaluation_rating'), // 1-5
  sortOrder: integer('sort_order').default(0),
  startedAt: text('started_at'),
  dueAt: text('due_at'),
  completedAt: text('completed_at'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
})

// ── Task Comments ──────────────────────────────────────────────────────────

export const taskComments = sqliteTable('task_comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  taskId: integer('task_id').references(() => tasks.id).notNull(),
  authorId: integer('author_id').references(() => teamMembers.id),
  content: text('content').notNull(),
  confidence: text('confidence'), // HIGH | MEDIUM | LOW
  autonomyLevel: text('autonomy_level'), // L1-L4
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

// ── Milestones ─────────────────────────────────────────────────────────────

export const milestones = sqliteTable('milestones', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orgId: integer('org_id').references(() => organizations.id),
  title: text('title').notNull(),
  description: text('description'),
  engineId: integer('engine_id').references(() => engines.id),
  projectId: integer('project_id').references(() => projects.id),
  ownerId: integer('owner_id').references(() => teamMembers.id),
  status: text('status').default('pending'), // pending | active | done
  targetDate: text('target_date'),
  completedAt: text('completed_at'),
  quarter: text('quarter'),
  year: integer('year'),
  sortOrder: integer('sort_order').default(0),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
})

// ── Compass ────────────────────────────────────────────────────────────────

export const compass = sqliteTable('compass', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orgId: integer('org_id').references(() => organizations.id),
  northStar: text('north_star'),
  purpose: text('purpose'),
  currentReality: text('current_reality'), // JSON: {works:[], doesntWork:[], keyNumbers:[]}
  gaps: text('gaps'), // JSON: [{description, priority, solution}]
  strategicAnchors: text('strategic_anchors'), // JSON: string[]
  threeYearTarget: text('three_year_target'), // JSON
  investmentPhases: text('investment_phases'), // JSON
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
})

// ── Scorecard Metrics ──────────────────────────────────────────────────────

export const scorecardMetrics = sqliteTable('scorecard_metrics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orgId: integer('org_id').references(() => organizations.id),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category'), // evergreen | north_star | growth | fulfillment | innovation | finance | ai_health
  engineId: integer('engine_id').references(() => engines.id),
  unit: text('unit'),
  targetValue: text('target_value'),
  currentValue: text('current_value'),
  previousValue: text('previous_value'),
  status: text('status').default('green'), // green | yellow | red
  trend: text('trend').default('flat'), // up | down | flat
  thresholdGreen: real('threshold_green'),
  thresholdYellow: real('threshold_yellow'),
  sortOrder: integer('sort_order').default(0),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
})

// ── Decision Records ───────────────────────────────────────────────────────

export const decisionRecords = sqliteTable('decision_records', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orgId: integer('org_id').references(() => organizations.id),
  title: text('title').notNull(),
  context: text('context'),
  options: text('options'), // JSON: [{label, pros, cons}]
  decision: text('decision'),
  reasoning: text('reasoning'),
  outcome: text('outcome'),
  decidedById: integer('decided_by_id').references(() => teamMembers.id),
  decidedAt: text('decided_at'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

// ── Lessons Learned ────────────────────────────────────────────────────────

export const lessonsLearned = sqliteTable('lessons_learned', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orgId: integer('org_id').references(() => organizations.id),
  title: text('title').notNull(),
  insight: text('insight'),
  context: text('context'),
  action: text('action'),
  sourceTaskId: integer('source_task_id').references(() => tasks.id),
  createdById: integer('created_by_id').references(() => teamMembers.id),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

// ── Memory Logs ────────────────────────────────────────────────────────────

export const memoryLogs = sqliteTable('memory_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orgId: integer('org_id').references(() => organizations.id),
  date: text('date').notNull(),
  authorId: integer('author_id').references(() => teamMembers.id),
  content: text('content').notNull(),
  logType: text('log_type').default('daily'), // daily | weekly | monthly | quarterly
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
})

// ── Playbooks ──────────────────────────────────────────────────────────────

export const playbooks = sqliteTable('playbooks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orgId: integer('org_id').references(() => organizations.id),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  whenToUse: text('when_to_use'),
  who: text('who'),
  content: text('content'), // Full markdown
  status: text('status').default('active'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
})

// ── Rhythms ────────────────────────────────────────────────────────────────

export const rhythms = sqliteTable('rhythms', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orgId: integer('org_id').references(() => organizations.id),
  name: text('name').notNull(),
  frequency: text('frequency').notNull(), // hourly | daily | weekly | monthly | quarterly
  dayOfWeek: integer('day_of_week'), // 0=Mon for weekly
  time: text('time'), // "09:00"
  description: text('description'),
  agentRole: text('agent_role'), // which role triggers this
  action: text('action'), // action identifier
  participants: text('participants'), // JSON: member IDs
  enabled: integer('enabled', { mode: 'boolean' }).default(true),
  lastCompleted: text('last_completed'),
  nextOccurrence: text('next_occurrence'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

// ── Activity Log ───────────────────────────────────────────────────────────

export const activityLog = sqliteTable('activity_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orgId: integer('org_id').references(() => organizations.id),
  actorId: integer('actor_id').references(() => teamMembers.id),
  action: text('action').notNull(),
  entityType: text('entity_type'),
  entityId: integer('entity_id'),
  description: text('description'),
  autonomyLevel: text('autonomy_level'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

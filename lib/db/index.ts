import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import path from 'path'
import fs from 'fs'

const DB_PATH = process.env.DATABASE_URL || './data/resort-os.db'

// Ensure data directory exists
const dir = path.dirname(DB_PATH)
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true })
}

const sqlite = new Database(DB_PATH)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

export const db = drizzle(sqlite, { schema })

// Initialize tables if they don't exist
export function initDB() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS organizations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      mission TEXT,
      higher_mission TEXT,
      "values" TEXT,
      anti_goals TEXT,
      audience TEXT,
      anchors TEXT,
      language TEXT DEFAULT 'cs',
      timezone TEXT DEFAULT 'Asia/Makassar',
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      org_id INTEGER REFERENCES organizations(id),
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS engines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      org_id INTEGER REFERENCES organizations(id),
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,
      goal TEXT,
      emoji TEXT,
      color TEXT,
      status TEXT DEFAULT 'active'
    );

    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      org_id INTEGER REFERENCES organizations(id),
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      engine_id INTEGER REFERENCES engines(id),
      role_type TEXT DEFAULT 'ai',
      purpose TEXT,
      accountabilities TEXT,
      boundaries TEXT,
      autonomy_matrix TEXT,
      kpis TEXT,
      reports_to TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS team_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      org_id INTEGER REFERENCES organizations(id),
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      type TEXT NOT NULL,
      role_id INTEGER REFERENCES roles(id),
      status TEXT DEFAULT 'active',
      email TEXT,
      timezone TEXT,
      avatar_emoji TEXT,
      ai_model TEXT,
      ai_config TEXT,
      openclaw_agent_id TEXT,
      cost_per_session REAL,
      sessions_per_week INTEGER,
      max_concurrent_tasks INTEGER DEFAULT 3,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS milestones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      org_id INTEGER REFERENCES organizations(id),
      title TEXT NOT NULL,
      description TEXT,
      engine_id INTEGER REFERENCES engines(id),
      project_id INTEGER REFERENCES projects(id),
      owner_id INTEGER REFERENCES team_members(id),
      status TEXT DEFAULT 'pending',
      target_date TEXT,
      completed_at TEXT,
      quarter TEXT,
      year INTEGER,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      org_id INTEGER REFERENCES organizations(id),
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'inbox',
      priority TEXT DEFAULT 'medium',
      engine_id INTEGER REFERENCES engines(id),
      project_id INTEGER REFERENCES projects(id),
      owner_id INTEGER REFERENCES team_members(id),
      reviewer_id INTEGER REFERENCES team_members(id),
      milestone_id INTEGER REFERENCES milestones(id),
      blocker_reason TEXT,
      blocked_since TEXT,
      estimated_hours REAL,
      impact TEXT,
      output TEXT,
      learnings TEXT,
      evaluation_rating INTEGER,
      sort_order INTEGER DEFAULT 0,
      started_at TEXT,
      due_at TEXT,
      completed_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS task_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL REFERENCES tasks(id),
      author_id INTEGER REFERENCES team_members(id),
      content TEXT NOT NULL,
      confidence TEXT,
      autonomy_level TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS compass (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      org_id INTEGER REFERENCES organizations(id),
      north_star TEXT,
      purpose TEXT,
      current_reality TEXT,
      gaps TEXT,
      strategic_anchors TEXT,
      three_year_target TEXT,
      investment_phases TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS scorecard_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      org_id INTEGER REFERENCES organizations(id),
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      engine_id INTEGER REFERENCES engines(id),
      unit TEXT,
      target_value TEXT,
      current_value TEXT,
      previous_value TEXT,
      status TEXT DEFAULT 'green',
      trend TEXT DEFAULT 'flat',
      threshold_green REAL,
      threshold_yellow REAL,
      sort_order INTEGER DEFAULT 0,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS decision_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      org_id INTEGER REFERENCES organizations(id),
      title TEXT NOT NULL,
      context TEXT,
      options TEXT,
      decision TEXT,
      reasoning TEXT,
      outcome TEXT,
      decided_by_id INTEGER REFERENCES team_members(id),
      decided_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS lessons_learned (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      org_id INTEGER REFERENCES organizations(id),
      title TEXT NOT NULL,
      insight TEXT,
      context TEXT,
      action TEXT,
      source_task_id INTEGER REFERENCES tasks(id),
      created_by_id INTEGER REFERENCES team_members(id),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS memory_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      org_id INTEGER REFERENCES organizations(id),
      date TEXT NOT NULL,
      author_id INTEGER REFERENCES team_members(id),
      content TEXT NOT NULL,
      log_type TEXT DEFAULT 'daily',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS playbooks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      org_id INTEGER REFERENCES organizations(id),
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,
      when_to_use TEXT,
      who TEXT,
      content TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rhythms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      org_id INTEGER REFERENCES organizations(id),
      name TEXT NOT NULL,
      frequency TEXT NOT NULL,
      day_of_week INTEGER,
      time TEXT,
      description TEXT,
      agent_role TEXT,
      action TEXT,
      participants TEXT,
      enabled INTEGER DEFAULT 1,
      last_completed TEXT,
      next_occurrence TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      org_id INTEGER REFERENCES organizations(id),
      actor_id INTEGER REFERENCES team_members(id),
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id INTEGER,
      description TEXT,
      autonomy_level TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `)
}

export const TASK_STATUSES = [
  'inbox',
  'backlog',
  'in_progress',
  'blocked',
  'in_review',
  'done',
  'archived',
] as const

export type TaskStatus = (typeof TASK_STATUSES)[number]

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  inbox: 'Inbox',
  backlog: 'Backlog',
  in_progress: 'In Progress',
  blocked: 'Blocked',
  in_review: 'In Review',
  done: 'Done',
  archived: 'Archived',
}

export const TASK_STATUS_EMOJI: Record<TaskStatus, string> = {
  inbox: '📥',
  backlog: '📋',
  in_progress: '🟡',
  blocked: '🚫',
  in_review: '👀',
  done: '✅',
  archived: '📦',
}

export const PRIORITIES = ['high', 'medium', 'low'] as const
export type Priority = (typeof PRIORITIES)[number]

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  high: 'text-accent-red',
  medium: 'text-accent-yellow',
  low: 'text-accent-green',
}

export const AUTONOMY_LEVELS = ['L1', 'L2', 'L3', 'L4'] as const
export type AutonomyLevel = (typeof AUTONOMY_LEVELS)[number]

export const AUTONOMY_LABELS: Record<AutonomyLevel, string> = {
  L1: 'Autonomous',
  L2: 'Notify',
  L3: 'Propose',
  L4: 'Escalate',
}

export const METRIC_STATUSES = ['green', 'yellow', 'red'] as const
export type MetricStatus = (typeof METRIC_STATUSES)[number]

export const METRIC_STATUS_COLORS: Record<MetricStatus, string> = {
  green: 'text-accent-green',
  yellow: 'text-accent-yellow',
  red: 'text-accent-red',
}

export const ENGINES = [
  { slug: 'growth', name: 'Growth', emoji: '📈', color: '#f472b6' },
  { slug: 'fulfillment', name: 'Fulfillment', emoji: '⚙️', color: '#60a5fa' },
  { slug: 'innovation', name: 'Innovation', emoji: '🚀', color: '#a78bfa' },
] as const

export const MEMBER_TYPES = ['human', 'ai'] as const
export type MemberType = (typeof MEMBER_TYPES)[number]

export const LOG_TYPES = ['daily', 'weekly', 'monthly', 'quarterly'] as const
export type LogType = (typeof LOG_TYPES)[number]

export const RHYTHM_FREQUENCIES = ['hourly', 'daily', 'weekly', 'monthly', 'quarterly'] as const
export type RhythmFrequency = (typeof RHYTHM_FREQUENCIES)[number]

// Valid task status transitions
export const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  inbox: ['backlog', 'archived'],
  backlog: ['in_progress', 'inbox', 'archived'],
  in_progress: ['done', 'blocked', 'in_review', 'backlog'],
  blocked: ['in_progress', 'backlog'],
  in_review: ['done', 'in_progress'],
  done: ['archived', 'in_progress'],
  archived: [],
}

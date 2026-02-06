'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TASK_STATUSES, TASK_STATUS_LABELS, TASK_STATUS_EMOJI, PRIORITY_COLORS, PRIORITIES } from '@/lib/constants'
import Link from 'next/link'
import toast from 'react-hot-toast'

type Task = {
  id: number
  title: string
  status: string
  priority: string | null
  engineId: number | null
  ownerId: number | null
  dueAt: string | null
  createdAt: string | null
}

type Member = { id: number; name: string; type: string; avatarEmoji: string | null }
type Engine = { id: number; name: string; emoji: string | null; slug: string }

export function TaskList({
  tasks,
  members,
  engines,
}: {
  tasks: Task[]
  members: Member[]
  engines: Engine[]
}) {
  const router = useRouter()
  const [filter, setFilter] = useState<string>('all')
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState('medium')
  const [newEngineId, setNewEngineId] = useState<string>('')
  const [newOwnerId, setNewOwnerId] = useState<string>('')

  const filtered = filter === 'all'
    ? tasks.filter(t => t.status !== 'archived')
    : tasks.filter(t => t.status === filter)

  const grouped: Record<string, Task[]> = {}
  for (const t of filtered) {
    const key = t.status
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(t)
  }

  const memberMap = Object.fromEntries(members.map(m => [m.id, m]))
  const engineMap = Object.fromEntries(engines.map(e => [e.id, e]))

  async function createTask() {
    if (!newTitle.trim()) return
    const res = await fetch('/api/v1/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTitle.trim(),
        priority: newPriority,
        engine_id: newEngineId ? Number(newEngineId) : null,
        owner_id: newOwnerId ? Number(newOwnerId) : null,
      }),
    })
    if (res.ok) {
      toast.success('Task created')
      setNewTitle('')
      setShowCreate(false)
      router.refresh()
    } else {
      toast.error('Failed to create task')
    }
  }

  async function moveTask(taskId: number, newStatus: string) {
    const res = await fetch(`/api/v1/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      toast.success(`Moved to ${TASK_STATUS_LABELS[newStatus as keyof typeof TASK_STATUS_LABELS]}`)
      router.refresh()
    } else {
      const data = await res.json()
      toast.error(data.error || 'Failed to move task')
    }
  }

  const displayOrder = filter === 'all'
    ? ['in_progress', 'blocked', 'in_review', 'inbox', 'backlog', 'done']
    : [filter]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')}>
            All ({tasks.filter(t => t.status !== 'archived').length})
          </FilterBtn>
          {TASK_STATUSES.filter(s => s !== 'archived').map(s => {
            const count = tasks.filter(t => t.status === s).length
            if (count === 0 && s !== 'inbox' && s !== 'in_progress') return null
            return (
              <FilterBtn key={s} active={filter === s} onClick={() => setFilter(s)}>
                {TASK_STATUS_EMOJI[s]} {TASK_STATUS_LABELS[s]} ({count})
              </FilterBtn>
            )
          })}
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-3 py-1.5 text-sm bg-accent-purple text-white rounded-lg hover:bg-accent-purple/80 transition-colors"
        >
          + New Task
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="rounded-lg border border-base-300 bg-base-100 p-4 space-y-3">
          <input
            autoFocus
            type="text"
            placeholder="Task title..."
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createTask()}
            className="w-full bg-base-200 border border-base-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-accent-purple"
          />
          <div className="flex gap-3">
            <select
              value={newPriority}
              onChange={e => setNewPriority(e.target.value)}
              className="bg-base-200 border border-base-300 rounded px-2 py-1 text-sm"
            >
              {PRIORITIES.map(p => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
            <select
              value={newEngineId}
              onChange={e => setNewEngineId(e.target.value)}
              className="bg-base-200 border border-base-300 rounded px-2 py-1 text-sm"
            >
              <option value="">No engine</option>
              {engines.map(e => (
                <option key={e.id} value={e.id}>{e.emoji} {e.name}</option>
              ))}
            </select>
            <select
              value={newOwnerId}
              onChange={e => setNewOwnerId(e.target.value)}
              className="bg-base-200 border border-base-300 rounded px-2 py-1 text-sm"
            >
              <option value="">Unassigned</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <button onClick={createTask} className="px-3 py-1 text-sm bg-accent-green text-white rounded hover:bg-accent-green/80">
              Create
            </button>
            <button onClick={() => setShowCreate(false)} className="px-3 py-1 text-sm text-[#8888a0] hover:text-white">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Task Groups */}
      {displayOrder.map(status => {
        const group = grouped[status]
        if (!group || group.length === 0) return null
        return (
          <div key={status} className="space-y-2">
            <h3 className="text-xs font-medium text-[#8888a0] uppercase tracking-wider flex items-center gap-2">
              {TASK_STATUS_EMOJI[status as keyof typeof TASK_STATUS_EMOJI]}
              {TASK_STATUS_LABELS[status as keyof typeof TASK_STATUS_LABELS]}
              <span className="bg-base-300 px-1.5 py-0.5 rounded text-[10px]">{group.length}</span>
            </h3>
            <div className="space-y-1">
              {group.map(task => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 rounded-lg border border-base-300 bg-base-100 px-4 py-2.5 hover:border-base-400 transition-colors group"
                >
                  {/* Priority dot */}
                  <span className={`text-lg ${PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS] || ''}`}>
                    {task.priority === 'high' ? '🔴' : task.priority === 'low' ? '🟢' : '🟡'}
                  </span>

                  {/* Title */}
                  <Link href={`/tasks/${task.id}`} className="flex-1 text-sm hover:text-accent-purple truncate">
                    {task.title}
                  </Link>

                  {/* Engine badge */}
                  {task.engineId && engineMap[task.engineId] && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-base-300 text-[#8888a0]">
                      {engineMap[task.engineId].emoji} {engineMap[task.engineId].name}
                    </span>
                  )}

                  {/* Owner */}
                  {task.ownerId && memberMap[task.ownerId] && (
                    <span className="text-xs text-[#8888a0]">
                      {memberMap[task.ownerId].type === 'ai' ? '🤖' : '👤'} {memberMap[task.ownerId].name}
                    </span>
                  )}

                  {/* Status actions */}
                  <select
                    value={task.status}
                    onChange={e => moveTask(task.id, e.target.value)}
                    className="opacity-0 group-hover:opacity-100 bg-base-200 border border-base-300 rounded px-1 py-0.5 text-xs transition-opacity"
                  >
                    {TASK_STATUSES.filter(s => s !== 'archived').map(s => (
                      <option key={s} value={s}>{TASK_STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-[#8888a0]">
          <p>No tasks yet</p>
          <button onClick={() => setShowCreate(true)} className="mt-2 text-accent-purple hover:underline text-sm">
            Create your first task
          </button>
        </div>
      )}
    </div>
  )
}

function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
        active ? 'bg-accent-purple/20 text-accent-purple' : 'text-[#8888a0] hover:text-white hover:bg-base-200'
      }`}
    >
      {children}
    </button>
  )
}

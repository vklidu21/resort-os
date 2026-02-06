'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  TASK_STATUS_LABELS,
  TASK_STATUS_EMOJI,
  VALID_TRANSITIONS,
  PRIORITIES,
  PRIORITY_COLORS,
  AUTONOMY_LABELS,
  type TaskStatus,
} from '@/lib/constants'

type Task = {
  id: number
  title: string
  description: string | null
  status: string
  priority: string | null
  engineId: number | null
  projectId: number | null
  ownerId: number | null
  reviewerId: number | null
  milestoneId: number | null
  blockerReason: string | null
  blockedSince: string | null
  estimatedHours: number | null
  impact: string | null
  output: string | null
  learnings: string | null
  evaluationRating: number | null
  sortOrder: number | null
  startedAt: string | null
  dueAt: string | null
  completedAt: string | null
  createdAt: string | null
  updatedAt: string | null
}

type Comment = {
  id: number
  taskId: number
  authorId: number | null
  content: string
  confidence: string | null
  autonomyLevel: string | null
  createdAt: string | null
}

type Member = { id: number; name: string; type: string; avatarEmoji: string | null }
type Engine = { id: number; name: string; emoji: string | null; slug: string }
type Milestone = { id: number; title: string; status: string | null }
type Project = { id: number; name: string; slug: string }

export function TaskDetail({
  task: initialTask,
  comments: initialComments,
  members,
  engines,
  milestones,
  projects,
}: {
  task: Task
  comments: Comment[]
  members: Member[]
  engines: Engine[]
  milestones: Milestone[]
  projects: Project[]
}) {
  const router = useRouter()
  const [task, setTask] = useState(initialTask)
  const [comments, setComments] = useState(initialComments)
  const [editing, setEditing] = useState(false)
  const [showEval, setShowEval] = useState(false)

  // Edit form state
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDesc, setEditDesc] = useState(task.description || '')
  const [editPriority, setEditPriority] = useState(task.priority || 'medium')
  const [editEngineId, setEditEngineId] = useState(task.engineId?.toString() || '')
  const [editProjectId, setEditProjectId] = useState(task.projectId?.toString() || '')
  const [editOwnerId, setEditOwnerId] = useState(task.ownerId?.toString() || '')
  const [editReviewerId, setEditReviewerId] = useState(task.reviewerId?.toString() || '')
  const [editMilestoneId, setEditMilestoneId] = useState(task.milestoneId?.toString() || '')
  const [editEstHours, setEditEstHours] = useState(task.estimatedHours?.toString() || '')
  const [editDueAt, setEditDueAt] = useState(task.dueAt || '')

  // Comment form
  const [commentText, setCommentText] = useState('')
  const [commentAuthor, setCommentAuthor] = useState('')

  // Evaluation form
  const [evalRating, setEvalRating] = useState(task.evaluationRating || 0)
  const [evalImpact, setEvalImpact] = useState(task.impact || '')
  const [evalLearnings, setEvalLearnings] = useState(task.learnings || '')
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonInsight, setLessonInsight] = useState('')

  const memberMap = Object.fromEntries(members.map(m => [m.id, m]))
  const engineMap = Object.fromEntries(engines.map(e => [e.id, e]))
  const projectMap = Object.fromEntries(projects.map(p => [p.id, p]))
  const milestoneMap = Object.fromEntries(milestones.map(m => [m.id, m]))

  const currentStatus = task.status as TaskStatus
  const allowedTransitions = VALID_TRANSITIONS[currentStatus] || []

  async function moveTask(newStatus: string) {
    const res = await fetch(`/api/v1/tasks/${task.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      const updated = await res.json()
      setTask(updated)
      toast.success(`Moved to ${TASK_STATUS_LABELS[newStatus as TaskStatus]}`)
    } else {
      const data = await res.json()
      toast.error(data.error || 'Failed')
    }
  }

  async function saveEdit() {
    const res = await fetch(`/api/v1/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: editTitle.trim(),
        description: editDesc.trim() || null,
        priority: editPriority,
        engine_id: editEngineId ? Number(editEngineId) : null,
        project_id: editProjectId ? Number(editProjectId) : null,
        owner_id: editOwnerId ? Number(editOwnerId) : null,
        reviewer_id: editReviewerId ? Number(editReviewerId) : null,
        milestone_id: editMilestoneId ? Number(editMilestoneId) : null,
        estimated_hours: editEstHours ? Number(editEstHours) : null,
        due_at: editDueAt || null,
      }),
    })
    if (res.ok) {
      const updated = await res.json()
      setTask(updated)
      setEditing(false)
      toast.success('Task updated')
    } else {
      toast.error('Failed to update')
    }
  }

  async function addComment() {
    if (!commentText.trim()) return
    const res = await fetch(`/api/v1/tasks/${task.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: commentText.trim(),
        author_id: commentAuthor ? Number(commentAuthor) : null,
      }),
    })
    if (res.ok) {
      const newComment = await res.json()
      setComments([newComment, ...comments])
      setCommentText('')
      toast.success('Comment added')
    } else {
      toast.error('Failed to add comment')
    }
  }

  async function submitEvaluation(approve: boolean) {
    const res = await fetch(`/api/v1/tasks/${task.id}/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        approve,
        rating: evalRating || null,
        impact: evalImpact.trim() || null,
        learnings: evalLearnings.trim() || null,
        lesson_title: lessonTitle.trim() || null,
        lesson_insight: lessonInsight.trim() || null,
      }),
    })
    if (res.ok) {
      const updated = await res.json()
      setTask(updated)
      setShowEval(false)
      toast.success(approve ? 'Task approved' : 'Task returned to in progress')
    } else {
      const data = await res.json()
      toast.error(data.error || 'Failed to evaluate')
    }
  }

  async function deleteTask() {
    const res = await fetch(`/api/v1/tasks/${task.id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Task archived')
      router.push('/tasks')
    }
  }

  const canEvaluate = task.status === 'done' || task.status === 'in_review'

  return (
    <div className="max-w-4xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#8888a0]">
        <Link href="/tasks" className="hover:text-white">Tasks</Link>
        <span>/</span>
        <span className="text-white">#{task.id}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {editing ? (
            <input
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              className="w-full text-xl font-semibold bg-base-200 border border-base-300 rounded px-3 py-2 focus:outline-none focus:border-accent-purple"
            />
          ) : (
            <h1 className="text-xl font-semibold">{task.title}</h1>
          )}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
              task.status === 'done' ? 'bg-accent-green/20 text-accent-green' :
              task.status === 'in_progress' ? 'bg-accent-yellow/20 text-accent-yellow' :
              task.status === 'blocked' ? 'bg-accent-red/20 text-accent-red' :
              task.status === 'in_review' ? 'bg-accent-purple/20 text-accent-purple' :
              'bg-base-300 text-[#8888a0]'
            }`}>
              {TASK_STATUS_EMOJI[currentStatus]} {TASK_STATUS_LABELS[currentStatus]}
            </span>
            <span className={`text-xs ${PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS] || ''}`}>
              {task.priority === 'high' ? '🔴 High' : task.priority === 'low' ? '🟢 Low' : '🟡 Medium'}
            </span>
            {task.evaluationRating && (
              <span className="text-xs text-accent-yellow">
                {'★'.repeat(task.evaluationRating)}{'☆'.repeat(5 - task.evaluationRating)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="px-3 py-1.5 text-sm border border-base-300 rounded-lg hover:border-accent-purple text-[#8888a0] hover:text-white transition-colors"
            >
              Edit
            </button>
          )}
          {editing && (
            <>
              <button onClick={saveEdit} className="px-3 py-1.5 text-sm bg-accent-green text-white rounded-lg hover:bg-accent-green/80">Save</button>
              <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-sm text-[#8888a0] hover:text-white">Cancel</button>
            </>
          )}
          {canEvaluate && (
            <button
              onClick={() => setShowEval(!showEval)}
              className="px-3 py-1.5 text-sm bg-accent-purple text-white rounded-lg hover:bg-accent-purple/80"
            >
              Evaluate
            </button>
          )}
        </div>
      </div>

      {/* Status transitions */}
      {allowedTransitions.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs text-[#8888a0] py-1">Move to:</span>
          {allowedTransitions.map(s => (
            <button
              key={s}
              onClick={() => moveTask(s)}
              className="px-2.5 py-1 text-xs rounded-lg border border-base-300 hover:border-accent-purple text-[#8888a0] hover:text-white transition-colors"
            >
              {TASK_STATUS_EMOJI[s]} {TASK_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      )}

      {/* Blocker warning */}
      {task.status === 'blocked' && task.blockerReason && (
        <div className="rounded-lg border border-accent-red/30 bg-accent-red/10 p-3">
          <p className="text-sm text-accent-red font-medium">Blocked</p>
          <p className="text-sm text-[#8888a0] mt-1">{task.blockerReason}</p>
          {task.blockedSince && (
            <p className="text-xs text-[#8888a0] mt-1">Since {new Date(task.blockedSince).toLocaleDateString()}</p>
          )}
        </div>
      )}

      {/* Evaluation panel */}
      {showEval && (
        <div className="rounded-lg border border-accent-purple/30 bg-accent-purple/5 p-4 space-y-4">
          <h3 className="text-sm font-medium text-accent-purple">Evaluate Task</h3>

          <div>
            <label className="block text-xs text-[#8888a0] mb-1">Rating (1-5)</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setEvalRating(n)}
                  className={`text-xl ${n <= evalRating ? 'text-accent-yellow' : 'text-base-300'} hover:text-accent-yellow transition-colors`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#8888a0] mb-1">Impact</label>
            <textarea
              value={evalImpact}
              onChange={e => setEvalImpact(e.target.value)}
              placeholder="What was the impact of this task?"
              className="w-full bg-base-200 border border-base-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-accent-purple resize-none h-20"
            />
          </div>

          <div>
            <label className="block text-xs text-[#8888a0] mb-1">Learnings</label>
            <textarea
              value={evalLearnings}
              onChange={e => setEvalLearnings(e.target.value)}
              placeholder="What did we learn?"
              className="w-full bg-base-200 border border-base-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-accent-purple resize-none h-20"
            />
          </div>

          <details className="group">
            <summary className="text-xs text-[#8888a0] cursor-pointer hover:text-white">
              + Add Lesson Learned (optional)
            </summary>
            <div className="mt-2 space-y-2">
              <input
                value={lessonTitle}
                onChange={e => setLessonTitle(e.target.value)}
                placeholder="Lesson title"
                className="w-full bg-base-200 border border-base-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-accent-purple"
              />
              <textarea
                value={lessonInsight}
                onChange={e => setLessonInsight(e.target.value)}
                placeholder="Key insight"
                className="w-full bg-base-200 border border-base-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-accent-purple resize-none h-16"
              />
            </div>
          </details>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => submitEvaluation(true)}
              className="px-4 py-2 text-sm bg-accent-green text-white rounded-lg hover:bg-accent-green/80"
            >
              Approve
            </button>
            <button
              onClick={() => submitEvaluation(false)}
              className="px-4 py-2 text-sm bg-accent-red text-white rounded-lg hover:bg-accent-red/80"
            >
              Return (needs more work)
            </button>
            <button onClick={() => setShowEval(false)} className="px-4 py-2 text-sm text-[#8888a0] hover:text-white">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content — Left 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="rounded-lg border border-base-300 bg-base-100 p-4">
            <h3 className="text-xs font-medium text-[#8888a0] uppercase tracking-wider mb-2">Description</h3>
            {editing ? (
              <textarea
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                placeholder="Task description..."
                className="w-full bg-base-200 border border-base-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-accent-purple resize-none h-32"
              />
            ) : (
              <p className="text-sm text-[#c0c0d0] whitespace-pre-wrap">
                {task.description || 'No description'}
              </p>
            )}
          </div>

          {/* Output (if task is done) */}
          {(task.output || task.impact || task.learnings) && (
            <div className="rounded-lg border border-accent-green/20 bg-accent-green/5 p-4 space-y-3">
              <h3 className="text-xs font-medium text-accent-green uppercase tracking-wider">Results</h3>
              {task.output && (
                <div>
                  <p className="text-xs text-[#8888a0] mb-1">Output</p>
                  <p className="text-sm text-[#c0c0d0] whitespace-pre-wrap">{task.output}</p>
                </div>
              )}
              {task.impact && (
                <div>
                  <p className="text-xs text-[#8888a0] mb-1">Impact</p>
                  <p className="text-sm text-[#c0c0d0] whitespace-pre-wrap">{task.impact}</p>
                </div>
              )}
              {task.learnings && (
                <div>
                  <p className="text-xs text-[#8888a0] mb-1">Learnings</p>
                  <p className="text-sm text-[#c0c0d0] whitespace-pre-wrap">{task.learnings}</p>
                </div>
              )}
            </div>
          )}

          {/* Comments */}
          <div className="rounded-lg border border-base-300 bg-base-100 p-4">
            <h3 className="text-xs font-medium text-[#8888a0] uppercase tracking-wider mb-3">
              Comments ({comments.length})
            </h3>

            {/* Add comment form */}
            <div className="space-y-2 mb-4">
              <textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full bg-base-200 border border-base-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-accent-purple resize-none h-20"
              />
              <div className="flex items-center gap-2">
                <select
                  value={commentAuthor}
                  onChange={e => setCommentAuthor(e.target.value)}
                  className="bg-base-200 border border-base-300 rounded px-2 py-1 text-xs"
                >
                  <option value="">Anonymous</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.type === 'ai' ? '🤖' : '👤'} {m.name}</option>
                  ))}
                </select>
                <button
                  onClick={addComment}
                  disabled={!commentText.trim()}
                  className="px-3 py-1 text-xs bg-accent-purple text-white rounded hover:bg-accent-purple/80 disabled:opacity-50"
                >
                  Post
                </button>
              </div>
            </div>

            {/* Comment list */}
            <div className="space-y-3">
              {comments.map(c => (
                <div key={c.id} className="border-t border-base-300 pt-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium">
                      {c.authorId && memberMap[c.authorId]
                        ? `${memberMap[c.authorId].type === 'ai' ? '🤖' : '👤'} ${memberMap[c.authorId].name}`
                        : 'System'}
                    </span>
                    {c.confidence && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        c.confidence === 'HIGH' ? 'bg-accent-green/20 text-accent-green' :
                        c.confidence === 'LOW' ? 'bg-accent-red/20 text-accent-red' :
                        'bg-accent-yellow/20 text-accent-yellow'
                      }`}>
                        {c.confidence}
                      </span>
                    )}
                    {c.autonomyLevel && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-purple/20 text-accent-purple">
                        {AUTONOMY_LABELS[c.autonomyLevel as keyof typeof AUTONOMY_LABELS] || c.autonomyLevel}
                      </span>
                    )}
                    <span className="text-[10px] text-[#8888a0]">
                      {c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}
                    </span>
                  </div>
                  <p className="text-sm text-[#c0c0d0] whitespace-pre-wrap">{c.content}</p>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-xs text-[#8888a0] py-2">No comments yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar — Right 1/3 */}
        <div className="space-y-4">
          {/* Meta info card */}
          <div className="rounded-lg border border-base-300 bg-base-100 p-4 space-y-3">
            <h3 className="text-xs font-medium text-[#8888a0] uppercase tracking-wider mb-2">Details</h3>

            {editing ? (
              <div className="space-y-3">
                <Field label="Priority">
                  <select value={editPriority} onChange={e => setEditPriority(e.target.value)} className="w-full bg-base-200 border border-base-300 rounded px-2 py-1 text-xs">
                    {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </Field>
                <Field label="Engine">
                  <select value={editEngineId} onChange={e => setEditEngineId(e.target.value)} className="w-full bg-base-200 border border-base-300 rounded px-2 py-1 text-xs">
                    <option value="">None</option>
                    {engines.map(e => <option key={e.id} value={e.id}>{e.emoji} {e.name}</option>)}
                  </select>
                </Field>
                <Field label="Project">
                  <select value={editProjectId} onChange={e => setEditProjectId(e.target.value)} className="w-full bg-base-200 border border-base-300 rounded px-2 py-1 text-xs">
                    <option value="">None</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </Field>
                <Field label="Owner">
                  <select value={editOwnerId} onChange={e => setEditOwnerId(e.target.value)} className="w-full bg-base-200 border border-base-300 rounded px-2 py-1 text-xs">
                    <option value="">Unassigned</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.type === 'ai' ? '🤖' : '👤'} {m.name}</option>)}
                  </select>
                </Field>
                <Field label="Reviewer">
                  <select value={editReviewerId} onChange={e => setEditReviewerId(e.target.value)} className="w-full bg-base-200 border border-base-300 rounded px-2 py-1 text-xs">
                    <option value="">None</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </Field>
                <Field label="Milestone">
                  <select value={editMilestoneId} onChange={e => setEditMilestoneId(e.target.value)} className="w-full bg-base-200 border border-base-300 rounded px-2 py-1 text-xs">
                    <option value="">None</option>
                    {milestones.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                  </select>
                </Field>
                <Field label="Est. Hours">
                  <input type="number" step="0.5" value={editEstHours} onChange={e => setEditEstHours(e.target.value)} className="w-full bg-base-200 border border-base-300 rounded px-2 py-1 text-xs" placeholder="0" />
                </Field>
                <Field label="Due Date">
                  <input type="date" value={editDueAt} onChange={e => setEditDueAt(e.target.value)} className="w-full bg-base-200 border border-base-300 rounded px-2 py-1 text-xs" />
                </Field>
              </div>
            ) : (
              <div className="space-y-2">
                <MetaRow label="Engine" value={
                  task.engineId && engineMap[task.engineId]
                    ? `${engineMap[task.engineId].emoji} ${engineMap[task.engineId].name}`
                    : '—'
                } />
                <MetaRow label="Project" value={
                  task.projectId && projectMap[task.projectId]
                    ? projectMap[task.projectId].name
                    : '—'
                } />
                <MetaRow label="Owner" value={
                  task.ownerId && memberMap[task.ownerId]
                    ? `${memberMap[task.ownerId].type === 'ai' ? '🤖' : '👤'} ${memberMap[task.ownerId].name}`
                    : 'Unassigned'
                } />
                <MetaRow label="Reviewer" value={
                  task.reviewerId && memberMap[task.reviewerId]
                    ? memberMap[task.reviewerId].name
                    : '—'
                } />
                <MetaRow label="Milestone" value={
                  task.milestoneId && milestoneMap[task.milestoneId]
                    ? milestoneMap[task.milestoneId].title
                    : '—'
                } />
                <MetaRow label="Est. Hours" value={task.estimatedHours ? `${task.estimatedHours}h` : '—'} />
                <MetaRow label="Due" value={task.dueAt ? new Date(task.dueAt).toLocaleDateString() : '—'} />
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="rounded-lg border border-base-300 bg-base-100 p-4">
            <h3 className="text-xs font-medium text-[#8888a0] uppercase tracking-wider mb-2">Timeline</h3>
            <div className="space-y-2 text-xs">
              <TimelineRow label="Created" date={task.createdAt} />
              {task.startedAt && <TimelineRow label="Started" date={task.startedAt} />}
              {task.completedAt && <TimelineRow label="Completed" date={task.completedAt} />}
              <TimelineRow label="Updated" date={task.updatedAt} />
            </div>
          </div>

          {/* Danger zone */}
          <div className="rounded-lg border border-base-300 bg-base-100 p-4">
            <button
              onClick={deleteTask}
              className="w-full px-3 py-1.5 text-xs border border-accent-red/30 text-accent-red rounded-lg hover:bg-accent-red/10 transition-colors"
            >
              Archive Task
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] text-[#8888a0] mb-0.5">{label}</label>
      {children}
    </div>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-[#8888a0]">{label}</span>
      <span className="text-[#c0c0d0]">{value}</span>
    </div>
  )
}

function TimelineRow({ label, date }: { label: string; date: string | null }) {
  if (!date) return null
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#8888a0]">{label}</span>
      <span className="text-[#c0c0d0]">{new Date(date).toLocaleDateString()}</span>
    </div>
  )
}

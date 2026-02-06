'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

type Metric = {
  id: number
  name: string
  description: string | null
  category: string | null
  engineId: number | null
  unit: string | null
  targetValue: string | null
  currentValue: string | null
  previousValue: string | null
  status: string | null
  trend: string | null
}

type Engine = { id: number; name: string; emoji: string | null }

const CATEGORIES = [
  { key: 'evergreen', label: 'Evergreen', emoji: '🌿' },
  { key: 'north_star', label: 'North Star', emoji: '🌟' },
  { key: 'growth', label: 'Growth', emoji: '📈' },
  { key: 'fulfillment', label: 'Fulfillment', emoji: '⚙️' },
  { key: 'innovation', label: 'Innovation', emoji: '🚀' },
  { key: 'finance', label: 'Finance', emoji: '💰' },
  { key: 'ai_health', label: 'AI Health', emoji: '🤖' },
]

const STATUS_COLORS = {
  green: 'bg-accent-green/10 text-accent-green border-accent-green/30',
  yellow: 'bg-accent-yellow/10 text-accent-yellow border-accent-yellow/30',
  red: 'bg-accent-red/10 text-accent-red border-accent-red/30',
}

export function ScorecardView({ metrics, engines }: { metrics: Metric[]; engines: Engine[] }) {
  const router = useRouter()
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState('north_star')
  const [newTarget, setNewTarget] = useState('')
  const [newUnit, setNewUnit] = useState('')

  const grouped: Record<string, Metric[]> = {}
  for (const m of metrics) {
    const key = m.category || 'north_star'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(m)
  }

  async function addMetric() {
    if (!newName.trim()) return
    const res = await fetch('/api/v1/scorecard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newName.trim(),
        category: newCategory,
        target_value: newTarget || null,
        unit: newUnit || null,
      }),
    })
    if (res.ok) {
      toast.success('Metric added')
      setNewName('')
      setNewTarget('')
      setNewUnit('')
      setShowAdd(false)
      router.refresh()
    }
  }

  async function updateValue(id: number, value: string) {
    const res = await fetch(`/api/v1/scorecard/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_value: value }),
    })
    if (res.ok) {
      toast.success('Updated')
      router.refresh()
    }
  }

  async function updateStatus(id: number, status: string) {
    const res = await fetch(`/api/v1/scorecard/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) router.refresh()
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-end">
        <button onClick={() => setShowAdd(!showAdd)} className="px-3 py-1.5 text-sm bg-accent-purple text-white rounded-lg hover:bg-accent-purple/80">
          + Add Metric
        </button>
      </div>

      {showAdd && (
        <div className="rounded-lg border border-base-300 bg-base-100 p-4 flex gap-3 flex-wrap items-end">
          <div>
            <label className="text-xs text-[#8888a0] block mb-1">Name</label>
            <input value={newName} onChange={e => setNewName(e.target.value)} className="bg-base-200 border border-base-300 rounded px-3 py-1.5 text-sm" placeholder="Metric name" />
          </div>
          <div>
            <label className="text-xs text-[#8888a0] block mb-1">Category</label>
            <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="bg-base-200 border border-base-300 rounded px-3 py-1.5 text-sm">
              {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#8888a0] block mb-1">Target</label>
            <input value={newTarget} onChange={e => setNewTarget(e.target.value)} className="bg-base-200 border border-base-300 rounded px-3 py-1.5 text-sm w-24" placeholder="100" />
          </div>
          <div>
            <label className="text-xs text-[#8888a0] block mb-1">Unit</label>
            <input value={newUnit} onChange={e => setNewUnit(e.target.value)} className="bg-base-200 border border-base-300 rounded px-3 py-1.5 text-sm w-20" placeholder="%" />
          </div>
          <button onClick={addMetric} className="px-3 py-1.5 text-sm bg-accent-green text-white rounded">Create</button>
        </div>
      )}

      {CATEGORIES.map(cat => {
        const group = grouped[cat.key]
        if (!group || group.length === 0) return null
        return (
          <div key={cat.key}>
            <h3 className="text-xs font-medium text-[#8888a0] uppercase tracking-wider mb-3 flex items-center gap-2">
              {cat.emoji} {cat.label}
            </h3>
            <div className="rounded-lg border border-base-300 bg-base-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-[#8888a0] border-b border-base-300">
                    <th className="text-left px-4 py-2">Metric</th>
                    <th className="text-right px-4 py-2">Current</th>
                    <th className="text-right px-4 py-2">Target</th>
                    <th className="text-center px-4 py-2">Status</th>
                    <th className="text-center px-4 py-2">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {group.map(m => (
                    <tr key={m.id} className="border-b border-base-300/50 hover:bg-base-200/50">
                      <td className="px-4 py-2.5">
                        {m.name}
                        {m.unit && <span className="text-xs text-[#8888a0] ml-1">({m.unit})</span>}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <input
                          defaultValue={m.currentValue || ''}
                          onBlur={e => {
                            if (e.target.value !== (m.currentValue || '')) {
                              updateValue(m.id, e.target.value)
                            }
                          }}
                          className="w-20 text-right bg-transparent border-b border-transparent hover:border-base-300 focus:border-accent-purple focus:outline-none"
                        />
                      </td>
                      <td className="px-4 py-2.5 text-right text-[#8888a0]">{m.targetValue || '-'}</td>
                      <td className="px-4 py-2.5 text-center">
                        <select
                          value={m.status || 'green'}
                          onChange={e => updateStatus(m.id, e.target.value)}
                          className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[(m.status || 'green') as keyof typeof STATUS_COLORS]} bg-transparent cursor-pointer`}
                        >
                          <option value="green">🟢 Green</option>
                          <option value="yellow">🟡 Yellow</option>
                          <option value="red">🔴 Red</option>
                        </select>
                      </td>
                      <td className="px-4 py-2.5 text-center text-lg">
                        {m.trend === 'up' ? '↑' : m.trend === 'down' ? '↓' : '→'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}

      {metrics.length === 0 && (
        <div className="text-center py-12 text-[#8888a0]">
          <p>No metrics defined yet</p>
          <button onClick={() => setShowAdd(true)} className="mt-2 text-accent-purple hover:underline text-sm">
            Add your first metric
          </button>
        </div>
      )}
    </div>
  )
}

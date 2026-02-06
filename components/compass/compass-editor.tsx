'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

type CompassData = {
  id: number
  northStar: string
  purpose: string
  currentReality: { works: string[]; doesntWork: string[]; keyNumbers: string[] }
  gaps: { description: string; priority: string; solution: string }[]
  strategicAnchors: string[]
  threeYearTarget: unknown
} | null

export function CompassEditor({ initial }: { initial: CompassData }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [northStar, setNorthStar] = useState(initial?.northStar || '')
  const [purpose, setPurpose] = useState(initial?.purpose || '')
  const [works, setWorks] = useState<string[]>(initial?.currentReality?.works || [])
  const [doesntWork, setDoesntWork] = useState<string[]>(initial?.currentReality?.doesntWork || [])
  const [gaps, setGaps] = useState(initial?.gaps || [])
  const [anchors, setAnchors] = useState<string[]>(initial?.strategicAnchors || [])

  async function save() {
    setSaving(true)
    try {
      const res = await fetch('/api/v1/compass', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          north_star: northStar,
          purpose,
          current_reality: { works, doesntWork, keyNumbers: [] },
          gaps,
          strategic_anchors: anchors,
        }),
      })
      if (res.ok) {
        toast.success('Compass saved')
        router.refresh()
      } else {
        toast.error('Failed to save')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* North Star */}
      <Section title="🌟 North Star" description="Your 3-year vision — where are you heading?">
        <textarea
          value={northStar}
          onChange={e => setNorthStar(e.target.value)}
          rows={3}
          className="w-full bg-base-200 border border-base-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent-purple resize-none"
          placeholder="Describe your long-term vision..."
        />
      </Section>

      {/* Purpose */}
      <Section title="🎯 Purpose" description="Why does this project exist?">
        <textarea
          value={purpose}
          onChange={e => setPurpose(e.target.value)}
          rows={2}
          className="w-full bg-base-200 border border-base-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent-purple resize-none"
          placeholder="The deeper reason..."
        />
      </Section>

      {/* Current Reality */}
      <Section title="📍 Current Reality" description="What's working and what isn't">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs text-accent-green mb-2 uppercase tracking-wider">What Works</h4>
            <ListEditor items={works} onChange={setWorks} placeholder="Add what's working..." />
          </div>
          <div>
            <h4 className="text-xs text-accent-red mb-2 uppercase tracking-wider">What Doesn't Work</h4>
            <ListEditor items={doesntWork} onChange={setDoesntWork} placeholder="Add what's not working..." />
          </div>
        </div>
      </Section>

      {/* Gaps */}
      <Section title="🔍 Gaps to Close" description="Critical gaps between current reality and vision">
        {gaps.map((gap, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
            <input
              value={gap.description}
              onChange={e => {
                const newGaps = [...gaps]
                newGaps[i] = { ...gap, description: e.target.value }
                setGaps(newGaps)
              }}
              className="bg-base-200 border border-base-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-accent-purple"
              placeholder="Gap description..."
            />
            <select
              value={gap.priority}
              onChange={e => {
                const newGaps = [...gaps]
                newGaps[i] = { ...gap, priority: e.target.value }
                setGaps(newGaps)
              }}
              className="bg-base-200 border border-base-300 rounded px-3 py-2 text-sm"
            >
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            <div className="flex gap-2">
              <input
                value={gap.solution}
                onChange={e => {
                  const newGaps = [...gaps]
                  newGaps[i] = { ...gap, solution: e.target.value }
                  setGaps(newGaps)
                }}
                className="flex-1 bg-base-200 border border-base-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-accent-purple"
                placeholder="Solution..."
              />
              <button
                onClick={() => setGaps(gaps.filter((_, j) => j !== i))}
                className="text-accent-red hover:text-red-400 px-2"
              >
                ×
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={() => setGaps([...gaps, { description: '', priority: 'MEDIUM', solution: '' }])}
          className="text-xs text-accent-purple hover:underline"
        >
          + Add Gap
        </button>
      </Section>

      {/* Strategic Anchors */}
      <Section title="⚓ Strategic Anchors" description="What gives you competitive advantage">
        <ListEditor items={anchors} onChange={setAnchors} placeholder="Add anchor..." />
      </Section>

      {/* Save */}
      <button
        onClick={save}
        disabled={saving}
        className="px-6 py-2 bg-accent-purple text-white rounded-lg hover:bg-accent-purple/80 transition-colors disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Compass'}
      </button>
    </div>
  )
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-base-300 bg-base-100 p-5">
      <h2 className="text-base font-medium mb-1">{title}</h2>
      <p className="text-xs text-[#8888a0] mb-4">{description}</p>
      {children}
    </div>
  )
}

function ListEditor({ items, onChange, placeholder }: { items: string[]; onChange: (items: string[]) => void; placeholder: string }) {
  const [newItem, setNewItem] = useState('')

  function add() {
    if (!newItem.trim()) return
    onChange([...items, newItem.trim()])
    setNewItem('')
  }

  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs text-[#8888a0]">•</span>
          <input
            value={item}
            onChange={e => {
              const newItems = [...items]
              newItems[i] = e.target.value
              onChange(newItems)
            }}
            className="flex-1 bg-transparent border-b border-transparent hover:border-base-300 focus:border-accent-purple text-sm py-0.5 focus:outline-none"
          />
          <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-accent-red/50 hover:text-accent-red text-xs">
            ×
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#8888a0]">+</span>
        <input
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-b border-base-300 text-sm py-0.5 focus:outline-none focus:border-accent-purple placeholder:text-[#8888a0]/50"
        />
      </div>
    </div>
  )
}

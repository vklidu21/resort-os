'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

type Member = {
  id: number; name: string; slug: string; type: string; roleId: number | null
  status: string | null; email: string | null; timezone: string | null
  avatarEmoji: string | null; aiModel: string | null; openclawAgentId: string | null
  costPerSession: number | null; sessionsPerWeek: number | null
}
type Role = {
  id: number; name: string; slug: string; engineId: number | null
  roleType: string | null; purpose: string | null; status: string | null
}
type Engine = { id: number; name: string; emoji: string | null }

export function TeamView({ members, roles, engines }: { members: Member[]; roles: Role[]; engines: Engine[] }) {
  const router = useRouter()
  const [showAddMember, setShowAddMember] = useState(false)
  const [showAddRole, setShowAddRole] = useState(false)
  const [tab, setTab] = useState<'members' | 'roles'>('members')

  // Add member form
  const [mName, setMName] = useState('')
  const [mType, setMType] = useState('ai')
  const [mRoleId, setMRoleId] = useState('')
  const [mModel, setMModel] = useState('')

  // Add role form
  const [rName, setRName] = useState('')
  const [rEngineId, setREngineId] = useState('')
  const [rPurpose, setRPurpose] = useState('')
  const [rType, setRType] = useState('ai')

  const roleMap = Object.fromEntries(roles.map(r => [r.id, r]))
  const engineMap = Object.fromEntries(engines.map(e => [e.id, e]))

  async function addMember() {
    if (!mName.trim()) return
    const res = await fetch('/api/v1/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: mName.trim(),
        type: mType,
        role_id: mRoleId ? Number(mRoleId) : null,
        ai_model: mModel || null,
      }),
    })
    if (res.ok) { toast.success('Member added'); setMName(''); setShowAddMember(false); router.refresh() }
  }

  async function addRole() {
    if (!rName.trim()) return
    const res = await fetch('/api/v1/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: rName.trim(),
        engine_id: rEngineId ? Number(rEngineId) : null,
        purpose: rPurpose || null,
        role_type: rType,
      }),
    })
    if (res.ok) { toast.success('Role created'); setRName(''); setRPurpose(''); setShowAddRole(false); router.refresh() }
  }

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-base-300 pb-2">
        <button onClick={() => setTab('members')} className={`text-sm pb-1 ${tab === 'members' ? 'text-accent-purple border-b-2 border-accent-purple' : 'text-[#8888a0]'}`}>
          👥 Members ({members.length})
        </button>
        <button onClick={() => setTab('roles')} className={`text-sm pb-1 ${tab === 'roles' ? 'text-accent-purple border-b-2 border-accent-purple' : 'text-[#8888a0]'}`}>
          🎭 Roles ({roles.length})
        </button>
        <div className="flex-1" />
        <button
          onClick={() => tab === 'members' ? setShowAddMember(!showAddMember) : setShowAddRole(!showAddRole)}
          className="px-3 py-1.5 text-sm bg-accent-purple text-white rounded-lg hover:bg-accent-purple/80"
        >
          + Add {tab === 'members' ? 'Member' : 'Role'}
        </button>
      </div>

      {/* Add Member Form */}
      {tab === 'members' && showAddMember && (
        <div className="rounded-lg border border-base-300 bg-base-100 p-4 flex gap-3 flex-wrap items-end">
          <div>
            <label className="text-xs text-[#8888a0] block mb-1">Name</label>
            <input value={mName} onChange={e => setMName(e.target.value)} className="bg-base-200 border border-base-300 rounded px-3 py-1.5 text-sm" placeholder="Agent name" />
          </div>
          <div>
            <label className="text-xs text-[#8888a0] block mb-1">Type</label>
            <select value={mType} onChange={e => setMType(e.target.value)} className="bg-base-200 border border-base-300 rounded px-3 py-1.5 text-sm">
              <option value="ai">🤖 AI Agent</option>
              <option value="human">👤 Human</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-[#8888a0] block mb-1">Role</label>
            <select value={mRoleId} onChange={e => setMRoleId(e.target.value)} className="bg-base-200 border border-base-300 rounded px-3 py-1.5 text-sm">
              <option value="">No role</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          {mType === 'ai' && (
            <div>
              <label className="text-xs text-[#8888a0] block mb-1">Model</label>
              <select value={mModel} onChange={e => setMModel(e.target.value)} className="bg-base-200 border border-base-300 rounded px-3 py-1.5 text-sm">
                <option value="">Select model</option>
                <option value="Claude Opus">Claude Opus</option>
                <option value="Claude Sonnet">Claude Sonnet</option>
                <option value="Claude Haiku">Claude Haiku</option>
              </select>
            </div>
          )}
          <button onClick={addMember} className="px-3 py-1.5 text-sm bg-accent-green text-white rounded">Add</button>
        </div>
      )}

      {/* Add Role Form */}
      {tab === 'roles' && showAddRole && (
        <div className="rounded-lg border border-base-300 bg-base-100 p-4 flex gap-3 flex-wrap items-end">
          <div>
            <label className="text-xs text-[#8888a0] block mb-1">Name</label>
            <input value={rName} onChange={e => setRName(e.target.value)} className="bg-base-200 border border-base-300 rounded px-3 py-1.5 text-sm" placeholder="Role name" />
          </div>
          <div>
            <label className="text-xs text-[#8888a0] block mb-1">Engine</label>
            <select value={rEngineId} onChange={e => setREngineId(e.target.value)} className="bg-base-200 border border-base-300 rounded px-3 py-1.5 text-sm">
              <option value="">Cross-engine</option>
              {engines.map(e => <option key={e.id} value={e.id}>{e.emoji} {e.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#8888a0] block mb-1">Type</label>
            <select value={rType} onChange={e => setRType(e.target.value)} className="bg-base-200 border border-base-300 rounded px-3 py-1.5 text-sm">
              <option value="ai">AI</option>
              <option value="human">Human</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-[#8888a0] block mb-1">Purpose</label>
            <input value={rPurpose} onChange={e => setRPurpose(e.target.value)} className="w-full bg-base-200 border border-base-300 rounded px-3 py-1.5 text-sm" placeholder="Why this role exists" />
          </div>
          <button onClick={addRole} className="px-3 py-1.5 text-sm bg-accent-green text-white rounded">Create</button>
        </div>
      )}

      {/* Members List */}
      {tab === 'members' && (
        <div className="space-y-2">
          {members.map(m => (
            <div key={m.id} className="flex items-center gap-4 rounded-lg border border-base-300 bg-base-100 px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-base-300 text-lg">
                {m.avatarEmoji || (m.type === 'ai' ? '🤖' : m.name.charAt(0))}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{m.name}</div>
                <div className="text-xs text-[#8888a0] flex gap-2">
                  <span>{m.type === 'ai' ? '🤖 AI Agent' : '👤 Human'}</span>
                  {m.roleId && roleMap[m.roleId] && <span>· {roleMap[m.roleId].name}</span>}
                  {m.aiModel && <span>· {m.aiModel}</span>}
                  {m.email && <span>· {m.email}</span>}
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                m.status === 'active' ? 'bg-accent-green/10 text-accent-green' : 'bg-base-300 text-[#8888a0]'
              }`}>
                {m.status}
              </span>
              {m.costPerSession && (
                <span className="text-xs text-[#8888a0]">${m.costPerSession}/session</span>
              )}
            </div>
          ))}
          {members.length === 0 && (
            <div className="text-center py-12 text-[#8888a0]">No team members yet</div>
          )}
        </div>
      )}

      {/* Roles List */}
      {tab === 'roles' && (
        <div className="space-y-2">
          {roles.map(r => (
            <div key={r.id} className="rounded-lg border border-base-300 bg-base-100 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-lg">🎭</span>
                <div className="flex-1">
                  <div className="font-medium text-sm">{r.name}</div>
                  <div className="text-xs text-[#8888a0]">
                    {r.roleType} · {r.engineId && engineMap[r.engineId] ? `${engineMap[r.engineId].emoji} ${engineMap[r.engineId].name}` : 'Cross-engine'}
                  </div>
                </div>
                {r.purpose && <span className="text-xs text-[#8888a0] max-w-xs truncate">{r.purpose}</span>}
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  r.status === 'active' ? 'bg-accent-green/10 text-accent-green' : 'bg-base-300 text-[#8888a0]'
                }`}>
                  {r.status}
                </span>
              </div>
            </div>
          ))}
          {roles.length === 0 && (
            <div className="text-center py-12 text-[#8888a0]">No roles defined yet</div>
          )}
        </div>
      )}
    </div>
  )
}

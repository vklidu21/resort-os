export default function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <section className="rounded-lg border border-base-300 bg-base-100 p-5">
        <h2 className="text-sm font-medium text-[#8888a0] uppercase tracking-wider mb-3">Organization</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-[#8888a0]">Name</span><span>Poinciana Global Village</span></div>
          <div className="flex justify-between"><span className="text-[#8888a0]">Language</span><span>Czech (cs)</span></div>
          <div className="flex justify-between"><span className="text-[#8888a0]">Timezone</span><span>Asia/Makassar (WITA)</span></div>
          <div className="flex justify-between"><span className="text-[#8888a0]">Status</span><span className="text-accent-green">Active</span></div>
        </div>
      </section>

      <section className="rounded-lg border border-base-300 bg-base-100 p-5">
        <h2 className="text-sm font-medium text-[#8888a0] uppercase tracking-wider mb-3">API</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#8888a0]">API Key</span>
            <code className="text-xs bg-base-300 px-2 py-1 rounded">Set via API_KEY env variable</code>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8888a0]">Base URL</span>
            <code className="text-xs bg-base-300 px-2 py-1 rounded">/api/v1/</code>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-base-300 bg-base-100 p-5">
        <h2 className="text-sm font-medium text-[#8888a0] uppercase tracking-wider mb-3">Coming Soon</h2>
        <ul className="text-sm text-[#8888a0] space-y-1">
          <li>• OpenClaw integration settings</li>
          <li>• Markdown export path configuration</li>
          <li>• Theme customization</li>
          <li>• Telegram webhook setup</li>
        </ul>
      </section>
    </div>
  )
}

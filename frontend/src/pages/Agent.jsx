import AgentChat from '../components/AgentChat.jsx'

export default function Agent() {
  return (
    <div className="p-8 h-full flex flex-col max-w-[1400px] mx-auto w-full">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-ink">AI Agent</h1>
        <p className="text-muted text-sm mt-1">Natural-language control plane for your outbound stack.</p>
      </div>
      <div className="flex-1 min-h-0">
        <AgentChat />
      </div>
    </div>
  )
}

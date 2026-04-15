import { PageHeader } from '@hakunahq/ui'
import AgentChat from '../components/AgentChat.jsx'

export default function Agent() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col max-w-[1400px] mx-auto w-full">
      <PageHeader
        title="AI Agent"
        subtitle="Natural-language control plane for your outbound stack."
      />
      <div className="flex-1 min-h-0">
        <AgentChat />
      </div>
    </div>
  )
}

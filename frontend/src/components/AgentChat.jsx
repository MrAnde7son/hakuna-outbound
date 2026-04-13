import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../store/useAppStore.js'
import { streamChat } from '../api/client.js'

const QUICK = [
  'Find 10 CISOs at US fintechs using Tenable',
  "Summarize this week's campaign performance",
  'Who should I follow up with today?',
  'Pause low-performing sequences',
  'Draft follow-up for top replied prospect',
]

export default function AgentChat() {
  const { chatMessages, appendChatMessage, updateLastMessage } = useAppStore()
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [chatMessages, sending])

  async function send(text) {
    const msg = (text ?? input).trim()
    if (!msg || sending) return
    setInput('')
    setSending(true)
    const next = [...chatMessages, { role: 'user', content: msg }]
    useAppStore.setState({ chatMessages: next })
    appendChatMessage({ role: 'assistant', content: '' })
    try {
      await streamChat(next, (tok) => updateLastMessage((c) => c + tok))
    } catch {
      updateLastMessage(() => 'Sorry — request failed.')
    }
    setSending(false)
  }

  return (
    <div className="flex flex-col h-full bg-surface border border-border rounded-xl overflow-hidden shadow-card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-subtle/40">
        <div>
          <div className="font-display text-lg font-semibold text-ink">Hakuna Agent</div>
          <div className="text-xs text-muted">Your outbound copilot</div>
        </div>
        <span className="text-[10px] uppercase tracking-[0.2em] font-semibold px-2.5 py-1 border border-blue-200 bg-accent-blue-soft text-accent-blue rounded-md">
          Vertex AI · Gemini
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {chatMessages.length === 0 && (
          <div className="text-muted text-sm text-center py-12">
            Ask anything — discovery, enrollment, summaries, follow-ups.
          </div>
        )}
        {chatMessages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[78%] px-4 py-3 rounded-lg whitespace-pre-wrap text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-accent-green text-white shadow-sm'
                : 'bg-subtle border border-border text-ink'
            }`}>
              {m.content || (sending && i === chatMessages.length - 1 ? <TypingDots /> : '')}
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 pb-3 flex gap-2 flex-wrap border-t border-border pt-3">
        {QUICK.map((q) => (
          <button
            key={q}
            onClick={() => send(q)}
            className="text-xs px-3 py-1.5 border border-border bg-surface rounded-full text-slate-600 hover:text-ink hover:border-border-strong hover:bg-subtle transition"
          >
            {q}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send() }}
        className="px-5 py-4 border-t border-border flex gap-3 bg-subtle/40"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the agent…"
          className="flex-1 bg-surface border border-border rounded-md px-4 py-2.5 text-sm text-ink outline-none focus:border-accent-green focus:ring-2 focus:ring-accent-green-soft transition"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="px-5 py-2.5 bg-accent-green text-white text-sm font-medium rounded-md disabled:opacity-40 hover:bg-emerald-600 transition shadow-sm"
        >
          Send
        </button>
      </form>
    </div>
  )
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-muted dot-anim" style={{ animationDelay: '0s' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-muted dot-anim" style={{ animationDelay: '0.2s' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-muted dot-anim" style={{ animationDelay: '0.4s' }} />
    </span>
  )
}

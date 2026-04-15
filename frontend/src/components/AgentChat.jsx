import { useEffect, useRef, useState } from 'react'
import { Input, Button, Pill, StatusBadge } from '@hakunahq/ui'
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
    <div
      className="flex flex-col h-full rounded-md overflow-hidden"
      style={{
        background: 'var(--hk-card)',
        border: '1px solid var(--hk-border)',
        boxShadow: 'var(--hk-shadow-sm)',
      }}
    >
      <div
        className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-4"
        style={{
          borderBottom: '1px solid var(--hk-border)',
          background: 'var(--hk-bg-muted)',
        }}
      >
        <div className="min-w-0">
          <div className="font-display text-base sm:text-lg font-semibold">Hakuna Agent</div>
          <div className="text-xs text-muted">Your outbound copilot</div>
        </div>
        <StatusBadge status={sending ? 'running' : 'active'} />
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 sm:py-5 space-y-4">
        {chatMessages.length === 0 && (
          <div className="text-muted text-sm text-center py-12">
            Ask anything — discovery, enrollment, summaries, follow-ups.
          </div>
        )}
        {chatMessages.map((m, i) => {
          const isUser = m.role === 'user'
          return (
            <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-[85%] sm:max-w-[78%] px-4 py-3 rounded-md whitespace-pre-wrap text-sm leading-relaxed break-words"
                style={{
                  background: isUser ? 'var(--hk-success)' : 'var(--hk-bg-subtle)',
                  color: isUser ? 'var(--hk-on-bright)' : 'var(--hk-text)',
                  border: isUser ? 'none' : '1px solid var(--hk-border)',
                  boxShadow: isUser ? 'var(--hk-shadow-sm)' : 'none',
                }}
              >
                {m.content || (sending && i === chatMessages.length - 1 ? <TypingDots /> : '')}
              </div>
            </div>
          )
        })}
      </div>

      <div
        className="px-4 sm:px-5 pb-3 flex gap-2 overflow-x-auto sm:flex-wrap pt-3"
        style={{ borderTop: '1px solid var(--hk-border)' }}
      >
        {QUICK.map((q) => (
          <button
            key={q}
            onClick={() => send(q)}
            className="shrink-0"
            style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
            aria-label={q}
          >
            <Pill label={q} color="var(--hk-text-secondary)" />
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send() }}
        className="px-4 sm:px-5 py-3 sm:py-4 flex gap-2 sm:gap-3"
        style={{ borderTop: '1px solid var(--hk-border)', background: 'var(--hk-bg-muted)' }}
      >
        <Input
          value={input}
          onChange={setInput}
          placeholder="Ask the agent…"
          disabled={sending}
          className="flex-1 min-w-0"
        />
        <Button
          type="submit"
          variant="success"
          disabled={sending || !input.trim()}
          loading={sending}
        >
          Send
        </Button>
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

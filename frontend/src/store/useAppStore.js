import { create } from 'zustand'

export const useAppStore = create((set, get) => ({
  discoveryResults: [],
  setDiscoveryResults: (r) => set({ discoveryResults: r }),

  selectedProspectIds: new Set(),
  toggleSelect: (id) => set((s) => {
    const next = new Set(s.selectedProspectIds)
    next.has(id) ? next.delete(id) : next.add(id)
    return { selectedProspectIds: next }
  }),
  clearSelection: () => set({ selectedProspectIds: new Set() }),
  selectAll: (ids) => set({ selectedProspectIds: new Set(ids) }),

  chatMessages: [],
  setChatMessages: (m) => set({ chatMessages: typeof m === 'function' ? m(get().chatMessages) : m }),
  appendChatMessage: (msg) => set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
  updateLastMessage: (updater) => set((s) => {
    const msgs = [...s.chatMessages]
    if (!msgs.length) return {}
    msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content: updater(msgs[msgs.length - 1].content) }
    return { chatMessages: msgs }
  }),
}))

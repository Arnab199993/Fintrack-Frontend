import { useEffect, useState } from 'react'
import Sidebar from './Sidebar.jsx'
import { api } from '../utils/api.js'

export default function AppShell({ children }) {
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const result = await api.alerts.list({ unreadOnly: true, limit: 1 })
        setUnread(result.data?.unreadCount ?? result.unreadCount ?? 0)
      } catch (_error) {
        setUnread(0)
      }
    }

    fetchUnread()
  }, [])

  return (
    <div className="flex min-h-screen bg-obsidian-950 bg-grid-pattern bg-grid">
      <Sidebar unreadAlerts={unread} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}

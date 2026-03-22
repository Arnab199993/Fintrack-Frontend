import Sidebar from './Sidebar.jsx'
import { MOCK_ALERTS } from '../utils/constants.js'

export default function AppShell({ children }) {
  const unread = MOCK_ALERTS.filter(a => !a.isRead).length

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

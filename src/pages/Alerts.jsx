import { useEffect, useState } from 'react'
import { Bell, BellOff, CheckCheck, Settings, AlertTriangle, TrendingUp, Wallet, Trophy, BarChart3, Zap } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'
import Badge from '../components/ui/Badge.jsx'
import Modal from '../components/ui/Modal.jsx'
import { FormGroup, Input } from '../components/ui/Form.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { useApp } from '../hooks/useApp.js'
import { api } from '../utils/api.js'
import { fmtRelative } from '../utils/helpers.js'
import PrimaryBtn from '../constant/PrimaryBtn.jsx'
import SecondaryBtn from '../constant/SrcondaryBtn.jsx'

const TYPE_CONFIG = {
  budget_exceeded:   { icon: AlertTriangle, color: 'text-neon-red',    bg: 'bg-neon-red/10',    badge: 'red',    label: 'Exceeded'    },
  budget_warning:    { icon: AlertTriangle, color: 'text-neon-yellow', bg: 'bg-neon-yellow/10', badge: 'yellow', label: 'Warning'     },
  large_transaction: { icon: Zap,           color: 'text-neon-orange', bg: 'bg-neon-orange/10', badge: 'orange', label: 'Large Txn'   },
  unusual_spending:  { icon: BarChart3,     color: 'text-neon-blue',   bg: 'bg-neon-blue/10',   badge: 'blue',   label: 'Unusual'     },
  low_balance:       { icon: Wallet,        color: 'text-neon-purple', bg: 'bg-neon-purple/10', badge: 'purple', label: 'Low Balance' },
  goal_achieved:     { icon: Trophy,        color: 'text-neon-green',  bg: 'bg-neon-green/10',  badge: 'green',  label: 'Goal Met'    },
}

const DEFAULT_SETTINGS = {
  largeTransactionThreshold: 500,
  lowBalanceThreshold: 100,
  emailNotifications: true,
  inAppNotifications: true,
}

export default function Alerts() {
  const { showToast } = useApp()
  const [alerts, setAlerts]           = useState([])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settings, setSettings]       = useState(DEFAULT_SETTINGS)
  const [filter, setFilter]           = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const [alertsResult, settingsResult] = await Promise.all([
          api.alerts.list(),
          api.alerts.getSettings(),
        ])
        // Backend: { data: { alerts: [...], unreadCount: N, meta: {...} } }
        const alertsData = alertsResult?.data?.alerts ?? alertsResult?.data ?? []
        setAlerts(Array.isArray(alertsData) ? alertsData : [])
        // Backend: { data: { settings: {...} } }
        const settingsData = settingsResult?.data?.settings ?? settingsResult?.data ?? DEFAULT_SETTINGS
        setSettings(settingsData)
      } catch (error) {
        showToast(error.message || 'Unable to load alerts', 'error')
      } finally {
        setLoading(false)
      }
    }

    loadAlerts()
  }, [])

  const unreadCount = alerts.filter(a => !a.isRead).length

  const visible = alerts.filter(a => {
    if (filter === 'unread') return !a.isRead
    if (filter === 'read')   return  a.isRead
    return true
  })

  const markRead = async (id) => {
    try {
      await api.alerts.markRead(id)
      setAlerts(prev => prev.map(a => a._id === id ? { ...a, isRead: true, readAt: new Date().toISOString() } : a))
    } catch (error) {
      showToast(error.message || 'Unable to mark alert read', 'error')
    }
  }

  const markAllRead = async () => {
    try {
      await api.alerts.markAllRead()
      setAlerts(prev => prev.map(a => ({ ...a, isRead: true, readAt: new Date().toISOString() })))
      showToast('All alerts marked as read', 'success')
    } catch (error) {
      showToast(error.message || 'Unable to mark all alerts read', 'error')
    }
  }

  const handleSettingsSave = async (e) => {
    e.preventDefault()
    try {
      await api.alerts.updateSettings(settings)
      setSettingsOpen(false)
      showToast('Alert settings saved', 'success')
    } catch (error) {
      showToast(error.message || 'Unable to save settings', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alerts"
        subtitle={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
        action={
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="btn-secondary gap-2 text-sm">
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
            <button onClick={() => setSettingsOpen(true)} className="btn-secondary gap-2 text-sm p-2 flex justify-center items-center cursor-pointer">
              <Settings size={14} /> Settings
            </button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 animate-slide-up fill-both">
        {[
          { label: 'Total',  value: alerts.length, color: 'text-ink-900' },
          { label: 'Unread', value: unreadCount,   color: unreadCount > 0 ? 'text-neon-red' : 'text-neon-green' },
          { label: 'Read',   value: alerts.length - unreadCount, color: 'text-neon-green' },
        ].map((s, i) => (
          <div key={s.label} className="card p-4 text-center animate-slide-up fill-both" style={{ animationDelay: `${i * 60}ms` }}>
            <p className="section-label mb-1">{s.label}</p>
            <p className={`font-display font-bold text-2xl ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {[
          { id: 'all', label: 'All' },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'read', label: 'Read' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === tab.id
                ? 'bg-neon-green/10 text-neon-green border border-neon-green/20'
                : 'bg-obsidian-700 text-ink-500 border border-obsidian-600 hover:text-ink-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div className="card overflow-hidden animate-slide-up fill-both delay-100">
        {visible.length === 0 ? (
          <EmptyState icon="🔔" title="No alerts here" sub="You're all caught up!" />
        ) : (
          <div className="divide-y divide-obsidian-700">
            {visible.map((a, i) => {
              const cfg   = TYPE_CONFIG[a.type] ?? TYPE_CONFIG.budget_warning
              const Icon  = cfg.icon
              return (
                <div
                  key={a._id}
                  className={`flex items-start gap-4 px-5 py-4 transition-colors animate-slide-up fill-both ${a.isRead ? 'opacity-60' : 'hover:bg-obsidian-700/40'}`}
                  style={{ animationDelay: `${100 + i * 50}ms` }}
                >
                  {/* icon */}
                  <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon size={16} className={cfg.color} />
                  </div>

                  {/* content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      <p className={`text-sm font-semibold ${a.isRead ? 'text-ink-700' : 'text-ink-900'}`}>{a.title}</p>
                      {!a.isRead && <span className="w-2 h-2 rounded-full bg-neon-red shrink-0 mt-1.5 animate-pulse-slow" />}
                    </div>
                    <p className="text-xs text-ink-500 leading-relaxed">{a.message}</p>
                    <p className="text-[11px] text-ink-500/70 mt-1.5">{fmtRelative(a.createdAt)}</p>
                  </div>

                  {/* right */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Badge variant={cfg.badge}>{cfg.label}</Badge>
                    {!a.isRead && (
                      <button
                        onClick={() => markRead(a._id)}
                        className="text-[11px] text-ink-500 hover:text-neon-green transition-colors font-medium"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Settings modal */}
      <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Alert Settings">
        <form onSubmit={handleSettingsSave} className="space-y-5">
          <FormGroup label="Large Transaction Threshold" hint="Get alerted when a single transaction exceeds this amount">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 text-sm">$</span>
              <Input
                type="number" min="1" step="1" className="pl-7"
                value={settings.largeTransactionThreshold}
                onChange={e => setSettings(s => ({ ...s, largeTransactionThreshold: e.target.value }))}
              />
            </div>
          </FormGroup>

          <FormGroup label="Low Balance Threshold" hint="Get alerted when wallet drops below this amount">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 text-sm">$</span>
              <Input
                type="number" min="0" step="1" className="pl-7"
                value={settings.lowBalanceThreshold}
                onChange={e => setSettings(s => ({ ...s, lowBalanceThreshold: e.target.value }))}
              />
            </div>
          </FormGroup>

          <div className="space-y-3">
            <p className="field-label">Notification Channels</p>
            {[
              { key: 'emailNotifications',   icon: '📧', label: 'Email notifications',    sub: 'Receive alerts to your registered email' },
              { key: 'inAppNotifications',   icon: '🔔', label: 'In-app notifications',   sub: 'Show alerts in this dashboard'           },
            ].map(({ key, icon, label, sub }) => (
              <label key={key} className="flex items-center gap-3 p-3 rounded-xl border border-obsidian-600 hover:border-obsidian-500 cursor-pointer transition-colors">
                <span className="text-lg">{icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink-900">{label}</p>
                  <p className="text-xs text-ink-500">{sub}</p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={settings[key]}
                    onChange={e => setSettings(s => ({ ...s, [key]: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-obsidian-600 rounded-full peer-checked:bg-neon-green/80 transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform" />
                </div>
              </label>
            ))}
          </div>

          <div className="flex gap-3 pt-1">
            <PrimaryBtn size={"large"} type="submit">Save Settings</PrimaryBtn>
            <SecondaryBtn handleClick={() => setSettingsOpen(false)}>Cancel</SecondaryBtn>
          </div>
        </form>
      </Modal>
    </div>
  )
}

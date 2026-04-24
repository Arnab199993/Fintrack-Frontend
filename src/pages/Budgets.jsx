import { useEffect, useState } from 'react'
import { Plus, Edit3, Trash2, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'
import Badge from '../components/ui/Badge.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Modal from '../components/ui/Modal.jsx'
import { FormGroup, Input, Select } from '../components/ui/Form.jsx'
import { useApp } from '../hooks/useApp.js'
import { api } from '../utils/api.js'
import { CATEGORIES } from '../utils/constants.js'
import { fmt, catEmoji, catColor } from '../utils/helpers.js'

const STATUS_CONFIG = {
  healthy:  { variant: 'green',  icon: CheckCircle,    label: 'Healthy'  },
  warning:  { variant: 'yellow', icon: AlertTriangle,  label: 'Warning'  },
  exceeded: { variant: 'red',    icon: XCircle,        label: 'Exceeded' },
}

const EMPTY_FORM = { category: 'food', limitAmount: '', period: 'monthly', alertThreshold: '80' }

export default function Budgets() {
  const { showToast } = useApp()
  const [budgets, setBudgets] = useState([])
  const [filterPeriod, setFilterPeriod] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBudgets = async () => {
      try {
        const result = await api.budgets.list()
        setBudgets(result.data?.budgets ?? result.data ?? [])
      } catch (error) {
        showToast(error.message || 'Unable to load budgets', 'error')
      } finally {
        setLoading(false)
      }
    }
    loadBudgets()
  }, [])

  const visible = filterPeriod ? budgets.filter(b => b.period === filterPeriod) : budgets

  const openAdd = () => { setEditTarget(null); setForm(EMPTY_FORM); setModalOpen(true) }
  const openEdit = (b) => {
    setEditTarget(b)
    setForm({ category: b.category, limitAmount: b.limitAmount, period: b.period, alertThreshold: b.alertThreshold })
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this budget?')) return
    try {
      await api.budgets.remove(id)
      setBudgets(prev => prev.filter(b => b._id !== id))
      showToast('Budget deleted', 'success')
    } catch (error) {
      showToast(error.message || 'Unable to delete budget', 'error')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.limitAmount) return showToast('Enter a limit amount', 'error')

    try {
      if (editTarget) {
        const result = await api.budgets.update(editTarget._id, {
          limitAmount: parseFloat(form.limitAmount),
          alertThreshold: parseInt(form.alertThreshold),
        })
        const updated = result.data?.budget ?? result.budget
        setBudgets(prev => prev.map(b => b._id === editTarget._id ? { ...b, ...(updated ?? {}), limitAmount: parseFloat(form.limitAmount), alertThreshold: parseInt(form.alertThreshold) } : b))
        showToast('Budget updated', 'success')
      } else {
        const result = await api.budgets.create({
          category: form.category,
          limitAmount: parseFloat(form.limitAmount),
          period: form.period,
          alertThreshold: parseInt(form.alertThreshold),
        })
        const created = result.data?.budget ?? result.budget
        if (created) {
          setBudgets(prev => [created, ...prev])
        }
        showToast('Budget created', 'success')
      }
      setModalOpen(false)
    } catch (error) {
      showToast(error.message || 'Unable to save budget', 'error')
    }
  }

  // Totals
  const totalLimit  = budgets.reduce((s, b) => s + b.limitAmount, 0)
  const totalSpent  = budgets.reduce((s, b) => s + b.spentAmount, 0)
  const exceeded    = budgets.filter(b => b.status === 'exceeded').length
  const healthy     = budgets.filter(b => b.status === 'healthy').length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budgets"
        subtitle="Track and manage your spending limits"
        action={<button onClick={openAdd} className="btn-primary"><Plus size={15} /> New Budget</button>}
      />

      {/* Summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up fill-both">
        {[
          { label: 'Total Budget',   value: fmt(totalLimit), accent: 'bg-neon-blue' },
          { label: 'Total Spent',    value: fmt(totalSpent), accent: 'bg-neon-red' },
          { label: 'Budgets on Track', value: healthy,       accent: 'bg-neon-green' },
          { label: 'Budgets Exceeded', value: exceeded,      accent: 'bg-neon-red' },
        ].map((s, i) => (
          <div key={s.label} className="card p-4 relative overflow-hidden animate-slide-up fill-both" style={{ animationDelay: `${i*60}ms` }}>
            <div className={`absolute top-0 left-0 right-0 h-[2px] ${s.accent}`} />
            <p className="section-label mb-2">{s.label}</p>
            <p className="font-display font-bold text-xl text-ink-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        {['', 'weekly', 'monthly', 'yearly'].map(p => (
          <button
            key={p}
            onClick={() => setFilterPeriod(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterPeriod === p ? 'bg-neon-green/10 text-neon-green border border-neon-green/20' : 'bg-obsidian-700 text-ink-500 hover:text-ink-700 border border-obsidian-500'}`}
          >
            {p === '' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Budget cards grid */}
      {visible.length === 0 ? (
        <div className="card"><EmptyState icon="◎" title="No budgets found" sub="Create a budget to start tracking your spending limits" action={<button onClick={openAdd} className="btn-primary"><Plus size={14}/> Create Budget</button>} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map((b, i) => {
            const cfg   = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.healthy
            const Icon  = cfg.icon
            const color = catColor(b.category)
            const pct   = Math.min(b.percentUsed, 100)

            return (
              <div key={b._id} className="card p-5 hover:border-obsidian-500 transition-all duration-200 hover:-translate-y-0.5 animate-slide-up fill-both" style={{ animationDelay: `${i * 60}ms` }}>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: `${color}20` }}>
                      {catEmoji(b.category)}
                    </div>
                    <div>
                      <p className="font-semibold text-ink-900 capitalize">{b.category}</p>
                      <Badge variant="blue" className="mt-0.5">{b.period}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(b)} className="btn-ghost p-1.5 rounded-lg"><Edit3 size={13}/></button>
                    <button onClick={() => handleDelete(b._id)} className="btn-ghost p-1.5 rounded-lg text-neon-red/50 hover:text-neon-red hover:bg-neon-red/10"><Trash2 size={13}/></button>
                  </div>
                </div>

                {/* Amounts */}
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="section-label mb-0.5">Spent</p>
                    <p className={`font-display font-bold text-lg ${b.status === 'exceeded' ? 'text-neon-red' : b.status === 'warning' ? 'text-neon-yellow' : 'text-ink-900'}`}>
                      {fmt(b.spentAmount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="section-label mb-0.5">Limit</p>
                    <p className="font-display font-semibold text-ink-700">{fmt(b.limitAmount)}</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${pct}%`,
                      background: b.status === 'exceeded' ? '#ff453a' : b.status === 'warning' ? '#ffd60a' : color,
                    }}
                  />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-3">
                  <div className={`flex items-center gap-1.5 text-xs font-semibold ${cfg.variant === 'green' ? 'text-neon-green' : cfg.variant === 'yellow' ? 'text-neon-yellow' : 'text-neon-red'}`}>
                    <Icon size={12} />
                    {cfg.label} · {b.percentUsed.toFixed(1)}%
                  </div>
                  <p className="text-xs text-ink-500">
                    {b.remaining > 0 ? `${fmt(b.remaining)} left` : 'Over limit'}
                  </p>
                </div>

                <div className="mt-2 text-[11px] text-ink-500">Alert at {b.alertThreshold}%</div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit Budget' : 'New Budget'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editTarget && (
            <FormGroup label="Category">
              <Select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{catEmoji(c)} {c}</option>)}
              </Select>
            </FormGroup>
          )}
          <div className="grid grid-cols-2 gap-4">
            <FormGroup label="Limit Amount">
              <Input type="number" step="0.01" min="1" placeholder="5000.00" value={form.limitAmount} onChange={e => setForm(f => ({ ...f, limitAmount: e.target.value }))} required />
            </FormGroup>
            {!editTarget && (
              <FormGroup label="Period">
                <Select value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))}>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </Select>
              </FormGroup>
            )}
          </div>
          <FormGroup label="Alert Threshold (%)" hint="Send alert when spending reaches this percentage">
            <Input type="number" min="1" max="100" placeholder="80" value={form.alertThreshold} onChange={e => setForm(f => ({ ...f, alertThreshold: e.target.value }))} />
          </FormGroup>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">{editTarget ? 'Save Changes' : 'Create Budget'}</button>
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

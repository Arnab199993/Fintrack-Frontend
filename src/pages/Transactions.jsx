import { useEffect, useState } from 'react'
import { Plus, Search, ArrowUpRight, ArrowDownRight, Trash2, Edit3 } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'
import Badge from '../components/ui/Badge.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Modal from '../components/ui/Modal.jsx'
import { FormGroup, Input, Select, Textarea } from '../components/ui/Form.jsx'
import { useApp } from '../hooks/useApp.js'
import { api } from '../utils/api.js'
import { CATEGORIES } from '../utils/constants.js'
import { fmt, fmtDate, catEmoji, todayISO } from '../utils/helpers.js'

const EMPTY_FORM = { type: 'debit', amount: '', category: 'food', description: '', date: todayISO(), tags: '' }

export default function Transactions() {
  const { showToast } = useApp()
  const [txns, setTxns] = useState([])
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [receiptFile, setReceiptFile] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const PER_PAGE = 10

  const fetchTransactions = async (pageNumber = 1) => {
    setLoading(true)
    try {
      const result = await api.transactions.list({ page: pageNumber, limit: PER_PAGE, ...(filterType ? { type: filterType } : {}), ...(filterCat ? { category: filterCat } : {}) })
      const data = result.data?.transactions ?? result.transactions ?? []
      const meta = result.data?.meta ?? result.meta ?? {}
      setTxns(data)
      setTotalPages(meta.totalPages || 1)
      setTotalCount(meta.total ?? data.length)
    } catch (error) {
      showToast(error.message || 'Unable to load transactions', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions(page)
  }, [page, filterType, filterCat])

  const filtered = txns.filter(t => {
    if (filterType && t.type !== filterType) return false
    if (filterCat && t.category !== filterCat) return false
    if (search) {
      const q = search.toLowerCase()
      return t.description?.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
    }
    return true
  })

  const paginated = filtered.slice(0, PER_PAGE)

  const openAdd = () => {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setReceiptFile(null)
    setModalOpen(true)
  }

  const openEdit = (transaction) => {
    setEditTarget(transaction)
    setForm({
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description || '',
      date: transaction.date?.slice(0, 10) || todayISO(),
      tags: transaction.tags?.join(', ') || '',
    })
    setReceiptFile(null)
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return
    try {
      await api.transactions.remove(id)
      await fetchTransactions(page)
      showToast('Transaction deleted', 'success')
    } catch (error) {
      showToast(error.message || 'Unable to delete transaction', 'error')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.amount || isNaN(form.amount)) return showToast('Enter a valid amount', 'error')

    setSaving(true)
    try {
      if (editTarget) {
        const result = await api.transactions.update(editTarget._id, {
          category: form.category,
          description: form.description,
          date: form.date,
          tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
        })
        const updated = result.data?.transaction ?? result.transaction
        if (updated) {
          setTxns(prev => prev.map(t => t._id === editTarget._id ? updated : t))
        }
        showToast('Transaction updated', 'success')
      } else {
        const body = {
          type: form.type,
          amount: parseFloat(form.amount),
          category: form.category,
          description: form.description,
          date: form.date,
          tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
        }

        let result
        if (receiptFile) {
          const formData = new FormData()
          Object.entries(body).forEach(([key, value]) => {
            if (Array.isArray(value)) value.forEach(v => formData.append(key, v))
            else formData.append(key, String(value))
          })
          formData.append('receipt', receiptFile)
          result = await api.transactions.createWithReceipt(formData)
        } else {
          result = await api.transactions.create(body)
        }

        const created = result.data?.transaction ?? result.transaction
        if (created) {
          setTxns(prev => [created, ...prev])
          setTotalCount(prev => prev + 1)
        }
        showToast('Transaction added', 'success')
      }
      setModalOpen(false)
      setReceiptFile(null)
      setPage(1)
      await fetchTransactions(1)
    } catch (error) {
      showToast(error.message || 'Unable to save transaction', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        subtitle={`${totalCount} total transactions`}
        action={
          <button onClick={openAdd} className="btn-primary">
            <Plus size={15} /> Add Transaction
          </button>
        }
      />

      <div className="card p-4 flex flex-wrap items-center gap-3 animate-slide-up fill-both">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none" />
          <input
            className="field pl-9"
            placeholder="Search transactions..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select className="field w-auto" value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1) }}>
          <option value="">All Types</option>
          <option value="credit">Credit</option>
          <option value="debit">Debit</option>
        </select>
        <select className="field w-auto" value={filterCat} onChange={e => { setFilterCat(e.target.value); setPage(1) }}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{catEmoji(c)} {c}</option>)}
        </select>
        {(search || filterType || filterCat) && (
          <button className="btn-ghost text-neon-red text-sm" onClick={() => { setSearch(''); setFilterType(''); setFilterCat(''); setPage(1) }}>
            Clear
          </button>
        )}
      </div>

      <div className="card overflow-hidden animate-slide-up fill-both delay-100">
        {loading ? (
          <div className="p-8 text-center text-sm text-ink-500">Loading transactions…</div>
        ) : paginated.length === 0 ? (
          <EmptyState icon="💸" title="No transactions found" sub="Try adjusting your filters" />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Balance After</th>
                  <th className="text-right">Amount</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((t, i) => (
                  <tr key={t._id} className="animate-slide-up fill-both" style={{ animationDelay: `${i * 30}ms` }}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${t.type === 'credit' ? 'bg-neon-green/10' : 'bg-neon-red/10'}`}>
                          {catEmoji(t.category)}
                        </div>
                        <div>
                          <p className="font-medium text-ink-900 text-sm">{t.description || '—'}</p>
                          {t.tags?.length > 0 && <p className="text-[11px] text-ink-500">{t.tags.join(', ')}</p>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge variant={t.type === 'credit' ? 'green' : 'red'}>
                        {catEmoji(t.category)} {t.category}
                      </Badge>
                    </td>
                    <td className="text-ink-500 text-sm">{fmtDate(t.date)}</td>
                    <td className="font-mono text-xs text-ink-500">{t.balanceAfter != null ? fmt(t.balanceAfter) : '—'}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {t.type === 'credit'
                          ? <ArrowUpRight size={13} className="text-neon-green" />
                          : <ArrowDownRight size={13} className="text-neon-red" />}
                        <span className={`font-mono font-semibold text-sm tabular-nums ${t.type === 'credit' ? 'text-neon-green' : 'text-neon-red'}`}>
                          {fmt(t.amount)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEdit(t)} className="btn-ghost p-2 rounded-lg" title="Edit">
                          <Edit3 size={13} />
                        </button>
                        <button onClick={() => handleDelete(t._id)} className="btn-ghost p-2 rounded-lg text-neon-red/60 hover:text-neon-red hover:bg-neon-red/10" title="Delete">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-obsidian-700">
            <p className="text-xs text-ink-500">
              Showing {((page - 1) * PER_PAGE) + 1}–{Math.min(page * PER_PAGE, totalCount)} of {totalCount}
            </p>
            <div className="flex gap-2">
              <button className="btn-secondary text-xs py-1.5 px-3" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <span className="btn-ghost text-xs py-1.5 px-3 cursor-default">Page {page} of {totalPages}</span>
              <button className="btn-secondary text-xs py-1.5 px-3" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setReceiptFile(null) }} title={editTarget ? 'Edit Transaction' : 'New Transaction'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editTarget && (
            <div className="grid grid-cols-2 gap-4">
              <FormGroup label="Type">
                <Select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="debit">💸 Debit</option>
                  <option value="credit">💰 Credit</option>
                </Select>
              </FormGroup>
              <FormGroup label="Amount">
                <Input type="number" step="0.01" min="0.01" placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
              </FormGroup>
            </div>
          )}
          <FormGroup label="Category">
            <Select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c} value={c}>{catEmoji(c)} {c}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Description">
            <Input placeholder="What was this for?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} maxLength={200} />
          </FormGroup>
          <div className="grid grid-cols-2 gap-4">
            <FormGroup label="Date">
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </FormGroup>
            <FormGroup label="Tags" hint="Comma separated">
              <Input placeholder="food, weekly" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
            </FormGroup>
          </div>
          {!editTarget && (
            <FormGroup label="Receipt (optional)">
              <input
                type="file"
                accept="image/*,application/pdf"
                className="field text-sm py-2"
                onChange={e => setReceiptFile(e.target.files?.[0] ?? null)}
              />
            </FormGroup>
          )}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving…' : editTarget ? 'Save Changes' : 'Add Transaction'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => { setModalOpen(false); setReceiptFile(null) }}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

import { ArrowDownLeft, ArrowUpRight, Wallet as WalletIcon, Plus } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'
import Badge from '../components/ui/Badge.jsx'
import Modal from '../components/ui/Modal.jsx'
import { FormGroup, Input, Select } from '../components/ui/Form.jsx'
import { useApp } from '../hooks/useApp.js'
import { api } from '../utils/api.js'
import { fmt, fmtCompact, fmtDate } from '../utils/helpers.js'
import PrimaryBtn from '../constant/PrimaryBtn.jsx'
import SecondaryBtn from '../constant/SrcondaryBtn.jsx'
import { useEffect, useRef, useState } from 'react'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'SGD']

const toNumber = (value) => {
  const amount = typeof value === 'string' ? value.trim() : value
  const parsed = Number(amount)
  return Number.isFinite(parsed) ? parsed : 0
}


export default function Wallet() {
  const hasFetched = useRef(false);
  const { user, setUser, updateUserProfile, showToast } = useApp()
  const [topUpOpen, setTopUpOpen]   = useState(false)
  const [topUpAmount, setTopUpAmount] = useState('')
  const [currency, setCurrency]     = useState(user?.currency ?? 'USD')
  const [transactions, setTransactions] = useState([])   // recent 20 for history display
  const [summaryTotals, setSummaryTotals] = useState({ totalIn: 0, totalOut: 0, startingBalance: 0 })
  const [walletLoading, setWalletLoading] = useState(false)

  // Use summaryTotals for accurate Money In/Out (not limited to 20 transactions)
  const { totalIn, totalOut, startingBalance } = summaryTotals

  const walletBalance = toNumber(user?.walletBalance)
  const topUpValue = toNumber(topUpAmount)

  const loadWallet = async () => {
    if (!user) return
    setWalletLoading(true)
    try {
      const [walletResult, txnResult, dashResult] = await Promise.all([
        api.users.getWallet(),
        api.transactions.list({ limit: 20, page: 1 }),
        api.transactions.analytics.dashboard(),
      ])

      // Fix: backend returns { data: { transactions: [...] } }
      const txns = txnResult?.data?.transactions ?? txnResult?.transactions ?? []
      setTransactions(txns)

      // Fix: backend getWallet returns { data: { wallet: { balance, currency } } }
      const walletPayload = walletResult?.data?.wallet ?? walletResult?.data ?? walletResult
      const balance = toNumber(walletPayload?.balance ?? walletPayload?.walletBalance ?? 0)
      if (balance > 0 || walletPayload) {
        updateUserProfile({ walletBalance: balance })
      }

      // Fix: use all-time dashboard analytics for accurate Money In/Out totals
      // Backend getDashboardSummary returns { allTime: { credit: { total }, debit: { total } } }
      const dash = dashResult?.data ?? dashResult
      const allTimeIn  = toNumber(dash?.allTime?.credit?.total ?? dash?.allTime?.credit ?? 0)
      const allTimeOut = toNumber(dash?.allTime?.debit?.total  ?? dash?.allTime?.debit  ?? 0)

      // Starting balance = current balance - net of all transactions
      const netTxn = allTimeIn - allTimeOut
      const calculatedStart = Math.max(0, toNumber(balance) - netTxn)

      setSummaryTotals({
        totalIn:  allTimeIn,
        totalOut: allTimeOut,
        startingBalance: Math.round(calculatedStart * 100) / 100,
      })
    } catch (error) {
      showToast(error.message || 'Unable to load wallet data', 'error')
    } finally {
      setWalletLoading(false)
    }
  }

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadWallet()
  }, [])

  useEffect(() => {
    setCurrency(user?.currency ?? 'USD')
  }, [user?.currency])

const handleTopUp = async (e) => {
  e.preventDefault()
  const amount = parseFloat(topUpAmount)
  if (!amount || amount <= 0) return showToast('Enter a valid amount', 'error')

  const prevBalance = walletBalance
  // Optimistic update
  updateUserProfile({ walletBalance: prevBalance + amount })

  try {
    const result = await api.users.topUpWallet({ amount })
    // Fix: backend topUp returns { data: { newBalance, currency } } not wallet object
    const newBalance = toNumber(
      result?.data?.newBalance ?? result?.newBalance ??
      result?.data?.wallet?.balance ?? result?.data?.balance ??
      (prevBalance + amount)
    )
    updateUserProfile({ walletBalance: newBalance })

    showToast(`₹${amount.toFixed(2)} added to wallet`, 'success')
    setTopUpOpen(false)
    setTopUpAmount('')
    // Re-sync to get accurate totals
    loadWallet()
  } catch (error) {
    // Revert optimistic update on failure
    updateUserProfile({ walletBalance: prevBalance })
    showToast(error.message || 'Unable to top up wallet', 'error')
  }
}

  const handleCurrencyChange = async (e) => {
    setCurrency(e.target.value)
    try {
      const updateResult = await api.users.updateProfile({ currency: e.target.value })
      const updated = updateResult.data?.user ?? updateResult.user
      if (updated) setUser(updated)
      showToast(`Currency updated to ${e.target.value}`, 'success')
    } catch (error) {
      showToast(error.message || 'Unable to update currency', 'error')
    }
  }

  const quickAmounts = [500, 1000, 5000, 10000]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wallet"
        subtitle="Your virtual finance account"
        action={
          <PrimaryBtn handleClick={() => setTopUpOpen(true)}>
            <Plus size={14} /> Top Up
          </PrimaryBtn>
        }
      />

      {/* Main wallet card */}
      <div className="relative overflow-hidden rounded-2xl border border-neon-blue/20 bg-linear-to-br from-[#0d1b2e] via-obsidian-800 to-obsidian-900 p-8 animate-slide-up fill-both">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-neon-blue/8 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-neon-green/5 blur-2xl pointer-events-none" />

        <div className="relative">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="section-label text-neon-blue/60 mb-2">Available Balance</p>
              <p className="font-display font-bold text-5xl tracking-tight text-white">
                {fmtCompact(walletBalance, currency)}
              </p>
              <p className="text-sm text-ink-500 mt-2">{user?.firstName} {user?.lastName}</p>
            </div>
            <div>
              <div className='section-label mb-2'>Select Currency</div>
              <Select value={currency} onChange={handleCurrencyChange} className="w-24 text-center bg-white/5 border-white/10 text-ink-700 text-sm">
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ArrowDownLeft size={13} className="text-neon-green" />
                <span className="text-xs text-ink-500">Money In</span>
              </div>
              <p className="font-display font-bold text-xl text-neon-green">{fmtCompact(totalIn)}</p>
              <p className="text-xs text-ink-500 mt-0.5">{transactions.filter(t => t.type === 'credit').length} credit transactions</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ArrowUpRight size={13} className="text-neon-red" />
                <span className="text-xs text-ink-500">Money Out</span>
              </div>
              <p className="font-display font-bold text-xl text-neon-red">{fmtCompact(totalOut)}</p>
              <p className="text-xs text-ink-500 mt-0.5">{transactions.filter(t => t.type === 'debit').length} debit transactions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Balance history */}
        <div className="card overflow-hidden animate-slide-up fill-both delay-100">
          <div className="px-5 py-4 border-b border-obsidian-700">
            <h2 className="font-display font-semibold text-sm text-ink-900">Balance History</h2>
          </div>
          <div className="divide-y divide-obsidian-700 max-h-80 overflow-y-auto">
            {transactions.slice(0, 8).map((t, i) => (
              <div key={t._id} className="flex items-center gap-3 px-5 py-3 animate-slide-up fill-both" style={{ animationDelay: `${100 + i * 40}ms` }}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.type === 'credit' ? 'bg-neon-green/10' : 'bg-neon-red/10'}`}>
                  {t.type === 'credit'
                    ? <ArrowDownLeft size={13} className="text-neon-green" />
                    : <ArrowUpRight size={13} className="text-neon-red" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-ink-900 truncate">{t.description}</p>
                  <p className="text-[11px] text-ink-500">{fmtDate(t.date)}</p>
                </div>
                <div className="text-right">
                  <p className={`font-mono text-sm font-semibold ${t.type === 'credit' ? 'text-neon-green' : 'text-neon-red'}`}>
                    {t.type === 'credit' ? '+' : '-'}{fmt(t.amount)}
                  </p>
                  {t.balanceAfter != null && (
                    <p className="text-[11px] text-ink-500 font-mono">{fmt(t.balanceAfter)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Account summary */}
        <div className="flex flex-col gap-4">
          <div className="card p-5 animate-slide-up fill-both delay-200">
            <h2 className="font-display font-semibold text-sm text-ink-900 mb-4">Account Summary</h2>
            <div className="space-y-3">
              {[
                { label: 'Starting Balance', value: fmt(startingBalance),          color: 'text-ink-700' },
                { label: 'Total Credits',    value: `+${fmt(totalIn)}`,        color: 'text-neon-green' },
                { label: 'Total Debits',     value: `-${fmt(totalOut)}`,       color: 'text-neon-red' },
                { label: 'Net Change',       value: fmt(totalIn - totalOut),   color: totalIn - totalOut >= 0 ? 'text-neon-green' : 'text-neon-red' },
                { label: 'Current Balance',  value: fmt(walletBalance),        color: 'text-neon-blue' },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between py-2 border-b border-obsidian-700 last:border-0">
                  <span className="text-sm text-ink-500">{row.label}</span>
                  <span className={`font-mono font-semibold text-sm ${row.color}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Up Modal */}
      <Modal open={topUpOpen} onClose={() => setTopUpOpen(false)} title="Top Up Wallet">
        <form onSubmit={handleTopUp} className="space-y-4">
          <div className="rounded-xl border border-neon-blue/20 bg-neon-blue/5 p-4 text-center">
            <p className="section-label mb-1">Current Balance</p>
            <p className="font-display font-bold text-3xl text-neon-blue">{fmt(walletBalance)}</p>
          </div>
          <FormGroup label="Amount to Add">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500">$</span>
              <Input
                type="number" step="0.01" min="0.01" max="1000000"
                className="pl-7" placeholder="0.00"
                value={topUpAmount}
                onChange={e => setTopUpAmount(e.target.value)}
                required
              />
            </div>
          </FormGroup>

          <div>
            <p className="field-label mb-2">Quick Select</p>
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setTopUpAmount(String(a))}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    topUpAmount === String(a)
                      ? 'bg-neon-green/10 border-neon-green/30 text-neon-green'
                      : 'bg-obsidian-700 border-obsidian-600 text-ink-500 hover:text-ink-700'
                  }`}
                >
                  ${a >= 1000 ? `${a / 1000}K` : a}
                </button>
              ))}
            </div>
          </div>

          {topUpAmount && !Number.isNaN(topUpValue) && topUpValue > 0 && (
            <div className="rounded-xl border border-neon-green/20 bg-neon-green/5 p-3 text-center">
              <p className="text-xs text-ink-500 mb-0.5">New balance after top up</p>
              <p className="font-display font-bold text-xl text-neon-green">
                {fmt(walletBalance + topUpValue)}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <PrimaryBtn size={"large"} type="submit" className="btn-primary flex-1 p-2 cursor-pointer">Confirm Top Up</PrimaryBtn>
            <SecondaryBtn handleClick={() => setTopUpOpen(false)}>Cancel</SecondaryBtn>
          </div>
        </form>
      </Modal>
    </div>
  )
}
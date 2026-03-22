import { useState } from 'react'
import {
  Wallet, TrendingUp, TrendingDown, PiggyBank,
  ArrowUpRight, ArrowDownRight, ShoppingBag, Zap
} from 'lucide-react'
import StatCard from '../components/ui/StatCard.jsx'
import Badge from '../components/ui/Badge.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import { useApp } from '../context/AppContext.jsx'
import {
  MOCK_TRANSACTIONS, MOCK_BUDGETS, MOCK_MONTHLY_TREND,
  MOCK_INSIGHTS, CATEGORY_META
} from '../utils/constants.js'
import { fmt, fmtCompact, fmtDate, catEmoji, catColor } from '../utils/helpers.js'

export default function Dashboard() {
  const { user, navigate } = useApp()

  const income   = MOCK_TRANSACTIONS.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0)
  const expenses = MOCK_TRANSACTIONS.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0)
  const savings  = income - expenses
  const savePct  = income > 0 ? ((savings / income) * 100).toFixed(1) : 0

  const recent   = MOCK_TRANSACTIONS.slice(0, 6)

  /* category spending */
  const catSpend = {}
  MOCK_TRANSACTIONS.filter(t => t.type === 'debit').forEach(t => {
    catSpend[t.category] = (catSpend[t.category] || 0) + t.amount
  })
  const catSorted = Object.entries(catSpend).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const catMax    = catSorted[0]?.[1] || 1

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Good morning, ${user.firstName} 👋`}
        subtitle="Here's your financial snapshot for October 2024"
      />

      {/* Wallet banner */}
      <div className="relative overflow-hidden rounded-2xl border border-neon-blue/20 bg-gradient-to-br from-obsidian-800 via-obsidian-800 to-obsidian-900 p-6 animate-slide-up fill-both">
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-neon-blue/5 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-neon-green/5 blur-xl pointer-events-none" />
        <div className="relative flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="section-label text-neon-blue/70 mb-2">Total Wallet Balance</p>
            <p className="font-display font-bold text-5xl tracking-tight text-white">
              {fmtCompact(user.walletBalance)}
              <span className="text-xl font-normal text-ink-500 ml-2">{user.currency}</span>
            </p>
            <p className="text-sm text-ink-500 mt-2">Updated just now</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('wallet')}
              className="btn-primary px-5 py-2.5 text-sm"
            >
              <Wallet size={15} /> Top Up
            </button>
            <button
              onClick={() => navigate('transactions')}
              className="btn-secondary px-5 py-2.5 text-sm"
            >
              View All
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Monthly Income"   value={fmtCompact(income)}   sub={`${MOCK_TRANSACTIONS.filter(t=>t.type==='credit').length} credits`} icon={TrendingUp}   accent="green"  delay={0}   />
        <StatCard label="Monthly Expenses" value={fmtCompact(expenses)} sub={`${MOCK_TRANSACTIONS.filter(t=>t.type==='debit').length} debits`}  icon={TrendingDown} accent="red"    delay={80}  />
        <StatCard label="Net Savings"      value={fmtCompact(savings)}  sub={`${savePct}% savings rate`}                                         icon={PiggyBank}    accent="blue"   delay={160} />
        <StatCard label="Top Category"     value={catSorted[0]?.[0] ?? '—'} sub={catSorted[0] ? fmt(catSorted[0][1]) : ''}                     icon={ShoppingBag}  accent="purple" delay={240} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent transactions — 2 cols */}
        <div className="lg:col-span-2 card overflow-hidden animate-slide-up fill-both delay-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-obsidian-700">
            <h2 className="font-display font-semibold text-base text-ink-900">Recent Transactions</h2>
            <button onClick={() => navigate('transactions')} className="btn-ghost text-xs gap-1">
              View all <ArrowUpRight size={13} />
            </button>
          </div>
          <div className="divide-y divide-obsidian-700">
            {recent.map((t, i) => (
              <div key={t._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-obsidian-700/40 transition-colors animate-slide-up fill-both" style={{ animationDelay: `${200 + i * 50}ms` }}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${t.type === 'credit' ? 'bg-neon-green/10' : 'bg-neon-red/10'}`}>
                  {catEmoji(t.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-900 truncate">{t.description}</p>
                  <p className="text-xs text-ink-500">{fmtDate(t.date)}</p>
                </div>
                <Badge variant={t.type === 'credit' ? 'green' : 'red'}>
                  {t.type === 'credit' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                  {t.category}
                </Badge>
                <p className={`font-mono font-semibold text-sm tabular-nums shrink-0 ${t.type === 'credit' ? 'text-neon-green' : 'text-neon-red'}`}>
                  {t.type === 'credit' ? '+' : '-'}{fmt(t.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">

          {/* Category breakdown */}
          <div className="card p-5 animate-slide-up fill-both delay-300">
            <h2 className="font-display font-semibold text-sm text-ink-900 mb-4">Spending Breakdown</h2>
            <div className="space-y-3">
              {catSorted.map(([cat, amt]) => (
                <div key={cat}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-ink-700 flex items-center gap-1.5">
                      {catEmoji(cat)} {cat}
                    </span>
                    <span className="text-xs font-mono font-semibold text-ink-700">{fmtCompact(amt)}</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${(amt / catMax) * 100}%`, background: catColor(cat) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI insight teaser */}
          <div className="card p-5 border-neon-purple/20 animate-slide-up fill-both delay-400">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={14} className="text-neon-purple" />
              <h2 className="font-display font-semibold text-sm text-ink-900">AI Insight</h2>
            </div>
            <p className="text-sm text-ink-700 leading-relaxed">{MOCK_INSIGHTS.insights[0]}</p>
            <button onClick={() => navigate('insights')} className="btn-ghost text-xs mt-3 text-neon-purple hover:text-neon-purple/80 px-0 gap-1">
              View all insights <ArrowUpRight size={12} />
            </button>
          </div>

        </div>
      </div>

      {/* Monthly trend */}
      <div className="card p-6 animate-slide-up fill-both delay-300">
        <h2 className="font-display font-semibold text-base text-ink-900 mb-6">6-Month Trend</h2>
        <div className="flex items-end gap-3 h-32">
          {MOCK_MONTHLY_TREND.map((m, i) => {
            const maxVal = Math.max(...MOCK_MONTHLY_TREND.flatMap(x => [x.income, x.expenses]))
            const incH   = (m.income / maxVal) * 100
            const expH   = (m.expenses / maxVal) * 100
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group animate-slide-up fill-both" style={{ animationDelay: `${300 + i * 60}ms` }}>
                <div className="w-full flex items-end justify-center gap-1 h-28">
                  <div
                    className="w-3 rounded-t-sm bg-neon-green/40 group-hover:bg-neon-green transition-colors"
                    style={{ height: `${incH}%` }}
                    title={`Income: ${fmt(m.income)}`}
                  />
                  <div
                    className="w-3 rounded-t-sm bg-neon-red/40 group-hover:bg-neon-red transition-colors"
                    style={{ height: `${expH}%` }}
                    title={`Expenses: ${fmt(m.expenses)}`}
                  />
                </div>
                <span className="text-[10px] text-ink-500 group-hover:text-ink-700 transition-colors">{m.month}</span>
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2 text-xs text-ink-500"><div className="w-3 h-3 rounded-sm bg-neon-green/40" /> Income</div>
          <div className="flex items-center gap-2 text-xs text-ink-500"><div className="w-3 h-3 rounded-sm bg-neon-red/40" /> Expenses</div>
        </div>
      </div>
    </div>
  )
}

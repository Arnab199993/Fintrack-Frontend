import { useEffect, useState } from 'react'
import {
  Wallet, TrendingUp, TrendingDown, PiggyBank,
  ArrowUpRight, ArrowDownRight, ShoppingBag, Zap
} from 'lucide-react'
import StatCard from '../components/ui/StatCard.jsx'
import Badge from '../components/ui/Badge.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import { useApp } from '../hooks/useApp.js'
import { api } from '../utils/api.js'
import { fmt, fmtCompact, fmtDate, catEmoji, catColor } from '../utils/helpers.js'

const monthLabel = (year, month) => {
  const date = new Date(year, month - 1, 1)
  return date.toLocaleString('default', { month: 'short' })
}

export default function Dashboard() {
  const { user, navigate } = useApp()
  const [summary, setSummary] = useState(null)
  const [trend, setTrend] = useState([])
  const [insight, setInsight] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true)
      try {
        const [dashboardResult, categoriesResult, insightsResult, trendResult] = await Promise.all([
          api.transactions.analytics.dashboard(),
          api.transactions.analytics.categories(),
          api.insights.list({ limit: 1 }),
          api.transactions.analytics.trend({ months: 6 }),
        ])

        const dashboardData = dashboardResult.data ?? dashboardResult
        const categoryData = categoriesResult.data ?? categoriesResult
        const trends = trendResult.data ?? trendResult
        const insightsList = insightsResult.data?.insights ?? insightsResult.insights ?? []

        setSummary(dashboardData)
        setCategories(Array.isArray(categoryData) ? categoryData : [])
        setTrend(Array.isArray(trends) ? trends : [])
        setInsight(insightsList[0] ?? null)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [])

  const income   = summary?.thisMonth?.credit?.total ?? 0
  const expenses = summary?.thisMonth?.debit?.total ?? 0
  const savings  = income - expenses
  const savePct  = income > 0 ? ((savings / income) * 100).toFixed(1) : 0

  const recent = summary?.recentTransactions ?? []

  const catSorted = categories.slice(0, 6)
  const catMax = Math.max(...catSorted.map(c => c.total || 0), 1)

  const monthlyTrend = trend.reduce((acc, item) => {
    const label = monthLabel(item.year, item.month)
    const key = `${item.year}-${item.month}`
    const current = acc.find(x => x.label === label)
    if (current) {
      current[item.type] = item.total
    } else {
      acc.push({ label, income: item.type === 'credit' ? item.total : 0, expenses: item.type === 'debit' ? item.total : 0 })
    }
    return acc
  }, []).sort((a, b) => {
    const [ay, am] = a.label.split(' ')
    const [by, bm] = b.label.split(' ')
    return 0
  })

  return (
    <div className="space-y-8">
      <PageHeader
        title={user ? `Good morning, ${user.firstName} 👋` : 'Good morning'}
        subtitle="Here's your financial snapshot"
      />

      <div className="relative overflow-hidden rounded-2xl border border-neon-blue/20 bg-gradient-to-br from-obsidian-800 via-obsidian-800 to-obsidian-900 p-6 animate-slide-up fill-both">
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-neon-blue/5 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-neon-green/5 blur-xl pointer-events-none" />
        <div className="relative flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="section-label text-neon-blue/70 mb-2">Total Wallet Balance</p>
            <p className="font-display font-bold text-5xl tracking-tight text-white">
              {fmtCompact(user?.walletBalance ?? 0)}
              <span className="text-xl font-normal text-ink-500 ml-2">{user?.currency ?? 'USD'}</span>
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Monthly Income" value={fmtCompact(income)} sub={`${summary?.thisMonth?.credit?.count ?? 0} credits`} icon={TrendingUp} accent="green" delay={0} />
        <StatCard label="Monthly Expenses" value={fmtCompact(expenses)} sub={`${summary?.thisMonth?.debit?.count ?? 0} debits`} icon={TrendingDown} accent="red" delay={80} />
        <StatCard label="Net Savings" value={fmtCompact(savings)} sub={`${savePct}% savings rate`} icon={PiggyBank} accent="blue" delay={160} />
        <StatCard label="Top Category" value={catSorted[0]?.category ?? '—'} sub={catSorted[0] ? fmt(catSorted[0].total) : ''} icon={ShoppingBag} accent="purple" delay={240} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

        <div className="flex flex-col gap-6">
          <div className="card p-5 animate-slide-up fill-both delay-300">
            <h2 className="font-display font-semibold text-sm text-ink-900 mb-4">Spending Breakdown</h2>
            <div className="space-y-3">
              {catSorted.map((category, i) => (
                <div key={category.category}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-ink-700 flex items-center gap-1.5">
                      {catEmoji(category.category)} {category.category}
                    </span>
                    <span className="text-xs font-mono font-semibold text-ink-700">{fmtCompact(category.total)}</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${(category.total / catMax) * 100}%`, background: catColor(category.category) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5 border-neon-purple/20 animate-slide-up fill-both delay-400">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={14} className="text-neon-purple" />
              <h2 className="font-display font-semibold text-sm text-ink-900">AI Insight</h2>
            </div>
            <p className="text-sm text-ink-700 leading-relaxed">{insight?.insights?.[0] ?? 'Generate insights to surface your top spending patterns.'}</p>
            <button onClick={() => navigate('insights')} className="btn-ghost text-xs mt-3 text-neon-purple hover:text-neon-purple/80 px-0 gap-1">
              View all insights <ArrowUpRight size={12} />
            </button>
          </div>
        </div>
      </div>

      <div className="card p-6 animate-slide-up fill-both delay-300">
        <h2 className="font-display font-semibold text-base text-ink-900 mb-6">6-Month Trend</h2>
        <div className="flex items-end gap-3 h-32">
          {monthlyTrend.map((m, i) => {
            const maxVal = Math.max(...monthlyTrend.flatMap(x => [x.income ?? 0, x.expenses ?? 0]), 1)
            const incH = (m.income ?? 0) / maxVal * 100
            const expH = (m.expenses ?? 0) / maxVal * 100
            return (
              <div key={m.label} className="flex-1 flex flex-col items-center gap-1 group animate-slide-up fill-both" style={{ animationDelay: `${300 + i * 60}ms` }}>
                <div className="w-full flex items-end justify-center gap-1 h-28">
                  <div
                    className="w-3 rounded-t-sm bg-neon-green/40 group-hover:bg-neon-green transition-colors"
                    style={{ height: `${incH}%` }}
                    title={`Income: ${fmt(m.income ?? 0)}`}
                  />
                  <div
                    className="w-3 rounded-t-sm bg-neon-red/40 group-hover:bg-neon-red transition-colors"
                    style={{ height: `${expH}%` }}
                    title={`Expenses: ${fmt(m.expenses ?? 0)}`}
                  />
                </div>
                <span className="text-[10px] text-ink-500 group-hover:text-ink-700 transition-colors">{m.label}</span>
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

import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Wallet, TrendingUp, TrendingDown, PiggyBank,
  ArrowUpRight, ArrowDownRight, ShoppingBag, Zap
} from 'lucide-react'
import ReactApexChart from 'react-apexcharts'
import StatCard from '../components/ui/StatCard.jsx'
import Badge from '../components/ui/Badge.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import { useApp } from '../hooks/useApp.js'
import { api } from '../utils/api.js'
import { fmt, fmtCompact, fmtDate, catEmoji, catColor, monthLabel } from '../utils/helpers.js'
import PrimaryBtn from '../constant/PrimaryBtn.jsx'
import TrendChart from '../components/charts/TrendChart.jsx'

export default function Dashboard() {
  const isMounted = useRef(false);
  const navigate = useNavigate()
  const { user } = useApp()
  const [summary, setSummary] = useState(null)
  const [trend, setTrend] = useState([])
  const [insight, setInsight] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

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

useEffect(() => {
  if (isMounted.current) return;
  setLoading(false)
  loadDashboard()
 isMounted.current = true
}, [])

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h >= 5  && h < 12) return { text: 'Good morning',   emoji: '☀️' }
    if (h >= 12 && h < 17) return { text: 'Good afternoon', emoji: '🌤️' }
    if (h >= 17 && h < 21) return { text: 'Good evening',   emoji: '🌆' }
    return { text: 'Hey, night owl', emoji: '🌙' }
  }
  const greeting = getGreeting()

  const income   = summary?.thisMonth?.credit?.total ?? 0
  const expenses = summary?.thisMonth?.debit?.total ?? 0
  const savings  = income - expenses
  const savePct  = income > 0 ? ((savings / income) * 100).toFixed(1) : 0

  const recent = summary?.recentTransactions ?? []

  const catSorted = categories.slice(0, 6)
  const catMax = Math.max(...catSorted.map(c => c.total || 0), 1)

  const monthlyTrend = useMemo(() => {
    const map = {}
    trend.forEach(item => {
      const key = `${item.year}-${String(item.month).padStart(2, '0')}`
      if (!map[key]) map[key] = { key, label: monthLabel(item.year, item.month), income: 0, expenses: 0 }
      if (item.type === 'credit') map[key].income   = item.total
      if (item.type === 'debit')  map[key].expenses = item.total
    })
    return Object.values(map).sort((a, b) => a.key.localeCompare(b.key))
  }, [trend])




  return (
    <div className="space-y-8">
      <PageHeader
        title={user ? `${greeting.text}, ${user.firstName} ${greeting.emoji}` : `${greeting.text} ${greeting.emoji}`}
        subtitle="Here's your financial snapshot"
      />

      <div className="relative overflow-hidden rounded-2xl border border-neon-blue/20 bg-linear-to-br from-obsidian-800 via-obsidian-800 to-obsidian-900 p-6 animate-slide-up fill-both">
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-neon-blue/5 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-neon-green/5 blur-xl pointer-events-none" />
        <div className="relative flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="section-label text-neon-blue/70 mb-2">
              Total Wallet Balance
            </p>
            <p className="font-display font-bold text-5xl tracking-tight text-white">
              {fmtCompact(user?.walletBalance ?? 0, user?.currency)}
              <span className="text-xl font-normal text-ink-500 ml-2">
                {user?.currency ?? "USD"}
              </span>
            </p>
            <p className="text-sm text-ink-500 mt-2">Updated just now</p>
          </div>
          <div className="flex gap-3">
            <div>
              <PrimaryBtn handleClick={() => navigate("/wallet")}>
                <Wallet size={15} /> Top Up
              </PrimaryBtn>
            </div>
            <button
              onClick={() => navigate("/transactions")}
              className="btn-secondary px-5 py-2.5 text-sm rounded-sm cursor-pointer"
            >
              View All
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Monthly Income"
          value={fmtCompact(income, user?.currency)}
          sub={`${summary?.thisMonth?.credit?.count ?? 0} credits`}
          icon={TrendingUp}
          accent="green"
          delay={0}
        />
        <StatCard
          label="Monthly Expenses"
          value={fmtCompact(expenses, user?.currency)}
          sub={`${summary?.thisMonth?.debit?.count ?? 0} debits`}
          icon={TrendingDown}
          accent="red"
          delay={80}
        />
        <StatCard
          label="Net Savings"
          value={fmtCompact(savings, user?.currency)}
          sub={`${savePct}% savings rate`}
          icon={PiggyBank}
          accent="blue"
          delay={160}
        />
        <StatCard
          label="Top Category"
          value={catSorted[0]?.category ?? "—"}
          sub={catSorted[0] ? fmt(catSorted[0].total, user?.currency) : ""}
          icon={ShoppingBag}
          accent="purple"
          delay={240}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card overflow-hidden animate-slide-up fill-both delay-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-obsidian-700">
            <h2 className="font-display font-semibold text-base text-ink-900">
              Recent Transactions
            </h2>
            <button
              onClick={() => navigate("/transactions")}
              className="btn-ghost text-xs gap-1 flex justify-between items-center cursor-pointer"
            >
              View all <ArrowUpRight size={13} />
            </button>
          </div>
          <div className="divide-y divide-obsidian-700">
            {recent.length === 0 && !loading && (
              <p className="text-sm text-ink-500 text-center py-8">
                No recent transactions
              </p>
            )}
            {recent.map((t, i) => (
              <div
                key={t._id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-obsidian-700/40 transition-colors animate-slide-up fill-both"
                style={{ animationDelay: `${200 + i * 50}ms` }}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${t.type === "credit" ? "bg-neon-green/10" : "bg-neon-red/10"}`}
                >
                  {catEmoji(t.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-900 truncate">
                    {t.description}
                  </p>
                  <p className="text-xs text-ink-500">{fmtDate(t.date)}</p>
                </div>
                <Badge variant={t.type === "credit" ? "green" : "red"}>
                  {t.type === "credit" ? (
                    <ArrowUpRight size={10} />
                  ) : (
                    <ArrowDownRight size={10} />
                  )}
                  {t.category}
                </Badge>
                <p
                  className={`font-mono font-semibold text-sm tabular-nums shrink-0 ${t.type === "credit" ? "text-neon-green" : "text-neon-red"}`}
                >
                  {t.type === "credit" ? "+" : "-"}
                  {fmt(t.amount, user?.currency)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="card p-5 animate-slide-up fill-both delay-300">
            <h2 className="font-display font-semibold text-sm text-ink-900 mb-4">
              Spending Breakdown
            </h2>
            <div className="space-y-3">
              {catSorted.map((category) => (
                <div key={category.category}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-ink-700 flex items-center gap-1.5">
                      {catEmoji(category.category)} {category.category}
                    </span>
                    <span className="text-xs font-mono font-semibold text-ink-700">
                      {fmtCompact(category.total, user?.currency)}
                    </span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${(category.total / catMax) * 100}%`,
                        background: catColor(category.category),
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5 border-neon-purple/20 animate-slide-up fill-both delay-400">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={14} className="text-neon-purple" />
              <h2 className="font-display font-semibold text-sm text-ink-900">
                Insight
              </h2>
            </div>
            <p className="text-sm text-ink-700 leading-relaxed">
              {insight?.insights?.[0] ??
                "Generate insights to surface your top spending patterns."}
            </p>
            <button
              onClick={() => navigate("/insights")}
              className="btn-ghost text-xs mt-3 text-neon-purple hover:text-neon-purple/80 px-0 gap-1"
            >
              <div className="cursor-pointer flex items-center gap-1">
                View all insights <ArrowUpRight size={12} />
              </div>
            </button>
          </div>
        </div>
      </div>
      <TrendChart monthlyTrend={monthlyTrend}/>
    </div>
  );
}
import { useEffect, useState } from 'react'
import { Sparkles, TrendingUp, TrendingDown, RefreshCw, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'
import Badge from '../components/ui/Badge.jsx'
import { useApp } from '../hooks/useApp.js'
import { api } from '../utils/api.js'
import { fmt, fmtCompact, catEmoji, catColor } from '../utils/helpers.js'
import PrimaryBtn from '../constant/PrimaryBtn.jsx'

const monthLabel = (year, month) => {
  const date = new Date(year, month - 1, 1)
  return date.toLocaleString('default', { month: 'short' })
}

export default function Insights() {
  const { showToast } = useApp()
  const [generating, setGenerating] = useState(false)
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7))
  const [insight, setInsight] = useState(null)
  const [trend, setTrend] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchInsight = async (selectedPeriod) => {
    setLoading(true)
    try {
      const [insightResult, trendResult] = await Promise.all([
        api.insights.getByPeriod(selectedPeriod),
        api.transactions.analytics.trend({ months: 6 }),
      ])

      const insightData =
        insightResult?.data?.insight ?? insightResult?.data ?? insightResult;
      setInsight(insightData);
      setTrend(trendResult.data ?? trendResult ?? [])
    } catch (error) {
      if (error?.status === 404) {
        setInsight(null)
        showToast(`No insight found for ${selectedPeriod}. Generate insights to create one.`, 'info')
      } else {
        showToast(error.message || 'Unable to load insights', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInsight(period)
  }, [period])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const result = await api.insights.generate({ period })
      const insightData =
        result?.data?.insight ?? result?.data ?? result;
      setInsight(insightData);
      showToast(`Insights refreshed for ${period}`, 'success')
    } catch (error) {
      showToast(error.message || 'Unable to generate insights', 'error')
    } finally {
      setGenerating(false)
    }
  }

  const rawBreakdown = insight?.categoryBreakdown ?? {}
const catEntries = (
  rawBreakdown instanceof Map
    ? Array.from(rawBreakdown.entries())
    : Object.entries(rawBreakdown)
).filter(([, v]) => typeof v === 'number').sort((a, b) => b[1] - a[1])
  const catMax = catEntries[0]?.[1] || 1
  const savingsRate = insight?.savingsRate ?? 0
  const totalIncome = insight?.totalIncome ?? 0
  const totalExpenses = insight?.totalExpenses ?? 0

  const monthlyTrend = trend.reduce((acc, item) => {
    const label = monthLabel(item.year, item.month)
    const existing = acc.find(row => row.label === label)
    if (existing) {
      if (item.type === 'credit') existing.income = item.total
      if (item.type === 'debit') existing.expenses = item.total
    } else {
      acc.push({
        label,
        income: item.type === 'credit' ? item.total : 0,
        expenses: item.type === 'debit' ? item.total : 0,
      })
    }
    return acc
  }, []).sort((a, b) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return monthNames.indexOf(a.label) - monthNames.indexOf(b.label)
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Insights"
        subtitle="Intelligent analysis of your spending patterns"
        action={
          <div className="flex items-center gap-3">
            <input
              type="month"
              className="field w-auto"
              value={period}
              onChange={e => setPeriod(e.target.value)}
            />
            <PrimaryBtn
              handleClick={handleGenerate}
              disabled={generating}
            >
              <RefreshCw size={14} className={generating ? 'animate-spin' : ''} />
              {generating ? 'Generating…' : 'Generate'}
            </PrimaryBtn>
          </div>
        }
      />

      <div className="relative overflow-hidden rounded-2xl border border-neon-purple/20 bg-linear-to-br from-obsidian-800 to-obsidian-900 p-6 animate-slide-up fill-both">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-neon-purple/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-neon-blue/5 blur-2xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-neon-purple/20 border border-neon-purple/20 flex items-center justify-center">
              <Sparkles size={15} className="text-neon-purple" />
            </div>
            <span className="section-label text-neon-purple/70">Fintrack Analysis · {period}</span>
          </div>
          <div className="grid grid-cols-3 gap-6 mb-6">
            {[
              { label: 'Total Income', value: fmtCompact(totalIncome), accent: 'text-neon-green', icon: TrendingUp },
              { label: 'Total Expenses', value: fmtCompact(totalExpenses), accent: 'text-neon-red', icon: TrendingDown },
              { label: 'Savings Rate', value: `${savingsRate}%`, accent: savingsRate >= 20 ? 'text-neon-green' : 'text-neon-yellow', icon: null },
            ].map(s => (
              <div key={s.label}>
                <p className="section-label mb-1">{s.label}</p>
                <p className={`font-display font-bold text-2xl tracking-tight ${s.accent}`}>{s.value}</p>
              </div>
            ))}
          </div>
          <div className="w-full bg-obsidian-700 rounded-full h-1.5 mb-1">
            <div
              className="h-full rounded-full bg-linear-to-r from-neon-green to-neon-blue transition-all duration-700"
              style={{ width: `${Math.min(savingsRate, 100)}%` }}
            />
          </div>
          <p className="text-xs text-ink-500">Savings rate — target: 20%+</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card overflow-hidden animate-slide-up fill-both delay-100">
          <div className="px-5 py-4 border-b border-obsidian-700 flex items-center gap-2">
            <Sparkles size={14} className="text-neon-purple" />
            <h2 className="font-display font-semibold text-sm text-ink-900">Smart Observations</h2>
          </div>
          <div className="divide-y divide-obsidian-700">
            {loading ? (
              <div className="p-6 text-sm text-ink-500">Loading insights…</div>
            ) : insight?.insights?.length ? (
              insight.insights.map((msg, i) => {
                const isUp = msg.startsWith('📈')
                const isDown = msg.startsWith('📉')
                const isWarn = msg.startsWith('⚠️')
                const accent = isDown ? 'border-l-neon-green/40' : isUp || isWarn ? 'border-l-neon-red/40' : 'border-l-neon-blue/30'
                return (
                  <div
                    key={i}
                    className={`flex gap-3 px-5 py-4 border-l-2 ${accent} animate-slide-up fill-both`}
                    style={{ animationDelay: `${150 + i * 60}ms` }}
                  >
                    <span className="text-lg shrink-0 mt-0.5">{msg.split(' ')[0]}</span>
                    <p className="text-sm text-ink-700 leading-relaxed">{msg.slice(msg.indexOf(' ') + 1)}</p>
                  </div>
                )
              })
            ) : (
              <div className="p-6 text-sm text-ink-500">No insights available yet. Generate a report to see category summaries and trends.</div>
            )}
          </div>
        </div>

        <div className="card p-5 animate-slide-up fill-both delay-200">
          <h2 className="font-display font-semibold text-sm text-ink-900 mb-5">Category Breakdown</h2>
          <div className="space-y-4">
            {catEntries.length ? catEntries.map(([category, amount], i) => {
              const pct = ((amount / catMax) * 100).toFixed(1)
              const color = catColor(category)
              return (
                <div key={category} className="animate-slide-up fill-both" style={{ animationDelay: `${200 + i * 50}ms` }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{catEmoji(category)}</span>
                      <span className="text-sm font-medium text-ink-700 capitalize">{category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-ink-500">{pct}%</span>
                      <span className="font-mono text-sm font-semibold text-ink-900">{fmt(amount)}</span>
                    </div>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                </div>
              )
            }) : (
              <div className="text-sm text-ink-500">No category breakdown available yet.</div>
            )}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden animate-slide-up fill-both delay-300">
        <div className="px-5 py-4 border-b border-obsidian-700">
          <h2 className="font-display font-semibold text-sm text-ink-900">Month-over-Month Comparison</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Month</th>
                <th className="text-right">Income</th>
                <th className="text-right">Expenses</th>
                <th className="text-right">Saved</th>
                <th className="text-right">Rate</th>
                <th className="text-center">vs Prev Month</th>
              </tr>
            </thead>
            <tbody>
              {monthlyTrend.map((m, i) => {
                const saved = (m.income ?? 0) - (m.expenses ?? 0)
                const rate = m.income ? ((saved / m.income) * 100).toFixed(1) : '0.0'
                const prev = monthlyTrend[i - 1]
                const expDiff = prev ? (((m.expenses ?? 0) - (prev.expenses ?? 0)) / Math.max(prev.expenses ?? 1, 1) * 100).toFixed(1) : null
                return (
                  <tr key={m.label} className="animate-slide-up fill-both" style={{ animationDelay: `${300 + i * 40}ms` }}>
                    <td className="font-semibold text-ink-900">{m.label}</td>
                    <td className="font-mono text-neon-green text-sm">+{fmt(m.income ?? 0)}</td>
                    <td className="font-mono text-neon-red text-sm">-{fmt(m.expenses ?? 0)}</td>
                    <td className="font-mono font-semibold text-sm text-ink-900">{fmt(saved)}</td>
                    <td>
                      <Badge variant={parseFloat(rate) >= 20 ? 'green' : 'yellow'}>{rate}%</Badge>
                    </td>
                    <td>
                      {expDiff === null ? (
                        <span className="text-xs text-ink-500">—</span>
                      ) : (
                        <div className={`inline-flex items-center gap-1 text-xs font-semibold ${parseFloat(expDiff) > 0 ? 'text-neon-red' : 'text-neon-green'}`}>
                          {parseFloat(expDiff) > 0
                            ? <><ArrowUpRight size={11}/> +{expDiff}%</>
                            : <><ArrowDownRight size={11}/> {expDiff}%</>
                          }
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

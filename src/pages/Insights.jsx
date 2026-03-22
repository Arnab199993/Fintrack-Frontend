import { useState } from 'react'
import { Sparkles, TrendingUp, TrendingDown, RefreshCw, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'
import Badge from '../components/ui/Badge.jsx'
import { MOCK_INSIGHTS, MOCK_MONTHLY_TREND, CATEGORY_META } from '../utils/constants.js'
import { fmt, fmtCompact, catEmoji, catColor } from '../utils/helpers.js'
import { useApp } from '../context/AppContext.jsx'

export default function Insights() {
  const { showToast } = useApp()
  const [generating, setGenerating] = useState(false)
  const [period, setPeriod] = useState('2024-10')

  const handleGenerate = () => {
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      showToast('Insights refreshed for ' + period, 'success')
    }, 1800)
  }

  const catEntries = Object.entries(MOCK_INSIGHTS.categoryBreakdown).sort((a, b) => b[1] - a[1])
  const catMax = catEntries[0]?.[1] || 1

  const savingsRate  = MOCK_INSIGHTS.savingsRate
  const totalIncome  = MOCK_INSIGHTS.totalIncome
  const totalExpenses= MOCK_INSIGHTS.totalExpenses

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Insights"
        subtitle="Intelligent analysis of your spending patterns"
        action={
          <div className="flex items-center gap-3">
            <input
              type="month"
              className="field w-auto"
              value={period}
              onChange={e => setPeriod(e.target.value)}
            />
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="btn-primary"
            >
              <RefreshCw size={14} className={generating ? 'animate-spin' : ''} />
              {generating ? 'Generating…' : 'Generate'}
            </button>
          </div>
        }
      />

      {/* Hero insight card */}
      <div className="relative overflow-hidden rounded-2xl border border-neon-purple/20 bg-gradient-to-br from-obsidian-800 to-obsidian-900 p-6 animate-slide-up fill-both">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-neon-purple/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-neon-blue/5 blur-2xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-neon-purple/20 border border-neon-purple/20 flex items-center justify-center">
              <Sparkles size={15} className="text-neon-purple" />
            </div>
            <span className="section-label text-neon-purple/70">AI Analysis · {period}</span>
          </div>
          <div className="grid grid-cols-3 gap-6 mb-6">
            {[
              { label: 'Total Income',   value: fmtCompact(totalIncome),   accent: 'text-neon-green', icon: TrendingUp   },
              { label: 'Total Expenses', value: fmtCompact(totalExpenses), accent: 'text-neon-red',   icon: TrendingDown },
              { label: 'Savings Rate',   value: `${savingsRate}%`,         accent: savingsRate >= 20 ? 'text-neon-green' : 'text-neon-yellow', icon: null },
            ].map(s => (
              <div key={s.label}>
                <p className="section-label mb-1">{s.label}</p>
                <p className={`font-display font-bold text-2xl tracking-tight ${s.accent}`}>{s.value}</p>
              </div>
            ))}
          </div>
          <div className="w-full bg-obsidian-700 rounded-full h-1.5 mb-1">
            <div
              className="h-full rounded-full bg-gradient-to-r from-neon-green to-neon-blue transition-all duration-700"
              style={{ width: `${Math.min(savingsRate, 100)}%` }}
            />
          </div>
          <p className="text-xs text-ink-500">Savings rate — target: 20%+</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Insight messages */}
        <div className="card overflow-hidden animate-slide-up fill-both delay-100">
          <div className="px-5 py-4 border-b border-obsidian-700 flex items-center gap-2">
            <Sparkles size={14} className="text-neon-purple" />
            <h2 className="font-display font-semibold text-sm text-ink-900">Smart Observations</h2>
          </div>
          <div className="divide-y divide-obsidian-700">
            {MOCK_INSIGHTS.insights.map((msg, i) => {
              const isUp     = msg.startsWith('📈')
              const isDown   = msg.startsWith('📉')
              const isWarn   = msg.startsWith('⚠️')
              const accent   = isDown ? 'border-l-neon-green/40' : isUp || isWarn ? 'border-l-neon-red/40' : 'border-l-neon-blue/30'

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
            })}
          </div>
        </div>

        {/* Category spending breakdown */}
        <div className="card p-5 animate-slide-up fill-both delay-200">
          <h2 className="font-display font-semibold text-sm text-ink-900 mb-5">Category Breakdown</h2>
          <div className="space-y-4">
            {catEntries.map(([cat, amt], i) => {
              const pct   = ((amt / catMax) * 100).toFixed(1)
              const color = catColor(cat)
              return (
                <div key={cat} className="animate-slide-up fill-both" style={{ animationDelay: `${200 + i * 50}ms` }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{catEmoji(cat)}</span>
                      <span className="text-sm font-medium text-ink-700 capitalize">{cat}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-ink-500">{pct}%</span>
                      <span className="font-mono text-sm font-semibold text-ink-900">{fmt(amt)}</span>
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
            })}
          </div>
        </div>

      </div>

      {/* Monthly comparison table */}
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
              {MOCK_MONTHLY_TREND.map((m, i) => {
                const saved   = m.income - m.expenses
                const rate    = ((saved / m.income) * 100).toFixed(1)
                const prev    = MOCK_MONTHLY_TREND[i - 1]
                const expDiff = prev ? (((m.expenses - prev.expenses) / prev.expenses) * 100).toFixed(1) : null

                return (
                  <tr key={m.month} className="animate-slide-up fill-both" style={{ animationDelay: `${300 + i * 40}ms` }}>
                    <td className="font-semibold text-ink-900">{m.month}</td>
                    <td className="text-right font-mono text-neon-green text-sm">+{fmt(m.income)}</td>
                    <td className="text-right font-mono text-neon-red text-sm">-{fmt(m.expenses)}</td>
                    <td className="text-right font-mono font-semibold text-sm text-ink-900">{fmt(saved)}</td>
                    <td className="text-right">
                      <Badge variant={parseFloat(rate) >= 20 ? 'green' : 'yellow'}>{rate}%</Badge>
                    </td>
                    <td className="text-center">
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

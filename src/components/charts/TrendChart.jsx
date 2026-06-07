import React, { useMemo } from 'react'
import ReactApexChart from 'react-apexcharts'
import { getCurrencySymbol } from '../../utils/helpers'
import useApp from '../../hooks/useApp';

const TrendChart = ({monthlyTrend}) => {
    const { user } = useApp()
    const currencySymbol = getCurrencySymbol(user?.currency);

      const chartOptions = useMemo(() => ({
        chart: {
          type: 'bar',
          toolbar: { show: false },
          fontFamily: 'inherit',
          stacked: false,
          animations: { enabled: true },
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: monthlyTrend.length <= 2 ? '30%' : monthlyTrend.length <= 4 ? '40%' : '55%',
            borderRadius: 4,
            borderRadiusApplication: 'end',
          },
        },
        dataLabels: { enabled: false },
        stroke: { show: false },
        xaxis: {
          categories: monthlyTrend.map(m => m.label),
          labels: { style: { colors: '#9CA3AF', fontSize: '11px' } },
          axisBorder: { show: false },
          axisTicks: { show: false },
        },
        yaxis: {
          labels: {
            style: { colors: '#9CA3AF', fontSize: '10px' },
            formatter: (val) => `${currencySymbol}${val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}`,
          },
        },
        colors: ['#22c55e', '#ef4444'],
        legend: {
          position: 'bottom',
          labels: { colors: '#9CA3AF' },
          markers: { size: 6, shape: 'circle' },
        },
        grid: { borderColor: '#1f2937', strokeDashArray: 4 },
        tooltip: {
          theme: 'dark',
          y: { formatter: (val) => `${currencySymbol}${Number(val).toLocaleString()}` },
        },
      }), [monthlyTrend, currencySymbol])

      const chartSeries = useMemo(() => [
    { name: 'Income',   data: monthlyTrend.map(m => m.income)   },
    { name: 'Expenses', data: monthlyTrend.map(m => m.expenses) },
  ], [monthlyTrend])
  return (
    <div className="card p-6 animate-slide-up fill-both delay-300">
        <h2 className="font-display font-semibold text-base text-ink-900 mb-6">
          6-Month Trend
        </h2>
        <ReactApexChart
          key={monthlyTrend.map(m => m.key).join(',')}
          series={chartSeries}
          type="bar"
          options={chartOptions}
          height={350}
        />
      </div>
  )
}

export default TrendChart
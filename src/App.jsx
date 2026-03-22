import AppShell from './layouts/AppShell.jsx'
import Toast from './components/ui/Toast.jsx'
import Auth from './pages/Auth.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Transactions from './pages/Transactions.jsx'
import Budgets from './pages/Budgets.jsx'
import Insights from './pages/Insights.jsx'
import Alerts from './pages/Alerts.jsx'
import Wallet from './pages/Wallet.jsx'
import Profile from './pages/Profile.jsx'
import { useApp } from './context/AppContext.jsx'

const PAGE_MAP = {
  dashboard:    Dashboard,
  transactions: Transactions,
  budgets:      Budgets,
  insights:     Insights,
  alerts:       Alerts,
  wallet:       Wallet,
  profile:      Profile,
}

export default function App() {
  const { page } = useApp()

  if (page === 'login') return (
    <>
      <Auth />
      <Toast />
    </>
  )

  const Page = PAGE_MAP[page] ?? Dashboard

  return (
    <>
      <AppShell>
        <div key={page} className="page-enter">
          <Page />
        </div>
      </AppShell>
      <Toast />
    </>
  )
}

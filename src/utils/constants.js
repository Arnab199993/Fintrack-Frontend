export const CATEGORIES = [
  'food','transport','shopping','entertainment','health',
  'education','utilities','rent','salary','investment',
  'gift','travel','subscription','insurance','other',
]

export const CATEGORY_META = {
  food:         { emoji: '🍔', color: '#ff6b6b' },
  transport:    { emoji: '🚗', color: '#4ecdc4' },
  shopping:     { emoji: '🛍️', color: '#a78bfa' },
  entertainment:{ emoji: '🎬', color: '#f59e0b' },
  health:       { emoji: '💊', color: '#34d399' },
  education:    { emoji: '📚', color: '#60a5fa' },
  utilities:    { emoji: '💡', color: '#fbbf24' },
  rent:         { emoji: '🏠', color: '#f87171' },
  salary:       { emoji: '💼', color: '#00ff87' },
  investment:   { emoji: '📈', color: '#4ade80' },
  gift:         { emoji: '🎁', color: '#f472b6' },
  travel:       { emoji: '✈️', color: '#38bdf8' },
  subscription: { emoji: '📱', color: '#818cf8' },
  insurance:    { emoji: '🛡️', color: '#94a3b8' },
  other:        { emoji: '💳', color: '#6b7591' },
}

// ── Mock data for UI demo ─────────────────────────────────────────────────────
export const MOCK_USER = {
  firstName: 'Aditya',
  lastName: 'Sharma',
  email: 'aditya@example.com',
  avatar: null,
  walletBalance: 124580.50,
  currency: 'USD',
}

export const MOCK_TRANSACTIONS = [
  { _id: '1', type: 'debit',  amount: 2840,   category: 'rent',          description: 'Monthly Rent — Oct',        date: '2024-10-01', balanceAfter: 121740.50, tags: ['housing'] },
  { _id: '2', type: 'credit', amount: 85000,   category: 'salary',        description: 'October Salary',            date: '2024-10-05', balanceAfter: 206740.50, tags: ['income'] },
  { _id: '3', type: 'debit',  amount: 1240,    category: 'food',          description: 'Groceries + Dining',        date: '2024-10-08', balanceAfter: 205500.50, tags: ['food','weekly'] },
  { _id: '4', type: 'debit',  amount: 499,     category: 'subscription',  description: 'Adobe Creative Cloud',      date: '2024-10-10', balanceAfter: 205001.50, tags: ['software'] },
  { _id: '5', type: 'debit',  amount: 3200,    category: 'travel',        description: 'Flight to Bangalore',       date: '2024-10-12', balanceAfter: 201801.50, tags: ['work','travel'] },
  { _id: '6', type: 'debit',  amount: 680,     category: 'health',        description: 'Gym + Supplements',         date: '2024-10-14', balanceAfter: 201121.50, tags: ['fitness'] },
  { _id: '7', type: 'credit', amount: 12000,   category: 'investment',    description: 'Dividend Income',           date: '2024-10-15', balanceAfter: 213121.50, tags: ['passive'] },
  { _id: '8', type: 'debit',  amount: 920,     category: 'entertainment', description: 'Concert tickets',           date: '2024-10-18', balanceAfter: 212201.50, tags: ['fun'] },
  { _id: '9', type: 'debit',  amount: 340,     category: 'transport',     description: 'Uber + Metro pass',         date: '2024-10-20', balanceAfter: 211861.50, tags: ['commute'] },
  { _id: '10',type: 'debit',  amount: 15280,   category: 'shopping',      description: 'MacBook accessories',       date: '2024-10-22', balanceAfter: 196581.50, tags: ['tech'] },
  { _id: '11',type: 'debit',  amount: 180,     category: 'utilities',     description: 'Electricity + Internet',    date: '2024-10-24', balanceAfter: 196401.50, tags: ['bills'] },
  { _id: '12',type: 'debit',  amount: 450,     category: 'education',     description: 'Udemy courses',             date: '2024-10-26', balanceAfter: 195951.50, tags: ['learning'] },
]

export const MOCK_BUDGETS = [
  { _id: 'b1', category: 'food',          limitAmount: 5000,  spentAmount: 3840,  period: 'monthly', alertThreshold: 80, percentUsed: 76.8, remaining: 1160,  status: 'healthy',  isActive: true },
  { _id: 'b2', category: 'entertainment', limitAmount: 2000,  spentAmount: 1820,  period: 'monthly', alertThreshold: 80, percentUsed: 91,   remaining: 180,   status: 'warning',  isActive: true },
  { _id: 'b3', category: 'shopping',      limitAmount: 10000, spentAmount: 15280, period: 'monthly', alertThreshold: 80, percentUsed: 152.8,remaining: 0,     status: 'exceeded', isActive: true },
  { _id: 'b4', category: 'transport',     limitAmount: 1500,  spentAmount: 340,   period: 'monthly', alertThreshold: 80, percentUsed: 22.7, remaining: 1160,  status: 'healthy',  isActive: true },
  { _id: 'b5', category: 'health',        limitAmount: 3000,  spentAmount: 680,   period: 'monthly', alertThreshold: 80, percentUsed: 22.7, remaining: 2320,  status: 'healthy',  isActive: true },
  { _id: 'b6', category: 'subscription',  limitAmount: 1000,  spentAmount: 499,   period: 'monthly', alertThreshold: 80, percentUsed: 49.9, remaining: 501,   status: 'healthy',  isActive: true },
]

export const MOCK_ALERTS = [
  { _id: 'a1', type: 'budget_exceeded',   title: 'Budget Exceeded 🚨',        message: "You've exceeded your monthly shopping budget of $10,000. Spent: $15,280.",     isRead: false, createdAt: '2024-10-22T10:30:00Z' },
  { _id: 'a2', type: 'budget_warning',    title: 'Budget Warning ⚠️',         message: "You've used 91% of your monthly entertainment budget ($1,820 of $2,000).",      isRead: false, createdAt: '2024-10-18T15:00:00Z' },
  { _id: 'a3', type: 'large_transaction', title: 'Large Transaction 💸',       message: 'A debit of $15,280 was recorded under shopping.',                               isRead: false, createdAt: '2024-10-22T10:25:00Z' },
  { _id: 'a4', type: 'goal_achieved',     title: 'Budget Goal Achieved 🎉',    message: 'You stayed within your health budget this month. Great discipline!',             isRead: true,  createdAt: '2024-10-14T09:00:00Z' },
  { _id: 'a5', type: 'unusual_spending',  title: 'Unusual Spending Pattern 📊', message: 'You spent 34% more on food vs last month ($1,240 → $1,658).',                 isRead: true,  createdAt: '2024-10-10T08:00:00Z' },
]

export const MOCK_INSIGHTS = {
  period: '2024-10',
  insights: [
    '📈 You spent 34% more on food compared to last period ($924 → $1,240).',
    '📉 Great job! You spent 28% less on entertainment compared to last period.',
    '🏆 Top expense: shopping at $15,280.',
    '💼 Savings rate: 62.4%. Well above the 20% target — excellent!',
    '🆕 First recorded travel expense this period: $3,200.',
    '📊 Your total expenses this month are $25,389 against income of $97,000.',
  ],
  categoryBreakdown: {
    food: 1240, transport: 340, shopping: 15280, entertainment: 920,
    health: 680, utilities: 180, rent: 2840, subscription: 499,
    travel: 3200, education: 450,
  },
  savingsRate: 62.4,
  totalIncome: 97000,
  totalExpenses: 25389,
  topSpendingCategory: 'shopping',
}

export const MOCK_MONTHLY_TREND = [
  { month: 'May',  income: 85000, expenses: 22100 },
  { month: 'Jun',  income: 85000, expenses: 31400 },
  { month: 'Jul',  income: 85000, expenses: 18900 },
  { month: 'Aug',  income: 97000, expenses: 28700 },
  { month: 'Sep',  income: 97000, expenses: 24800 },
  { month: 'Oct',  income: 97000, expenses: 25389 },
]

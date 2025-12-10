import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Filter, DollarSign, PiggyBank } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

function Analytics({ transactions, userData }) {
  const { t } = useTranslation();
  const [timeFilter, setTimeFilter] = useState('month'); // week, month, year, all
  const [categoryFilter, setCategoryFilter] = useState('all');

  const COLORS = {
    income: '#03e26f',
    expense: '#dd573c',
    categories: ['#2b5f76', '#dd573c', '#03e26f', '#c6be4d', '#143052', '#ab3412', '#5f8662', '#dbf22c']
  };

  // Filter transactions by time period
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      
      if (timeFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return transactionDate >= weekAgo;
      } else if (timeFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return transactionDate >= monthAgo;
      } else if (timeFilter === 'year') {
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        return transactionDate >= yearAgo;
      }
      return true; // all
    }).filter(t => categoryFilter === 'all' || t.category === categoryFilter);
  }, [transactions, timeFilter, categoryFilter]);

  // Calculate totals
  const totalIncome = useMemo(() => 
    filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );

  const totalExpenses = useMemo(() => 
    filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );

  // Calculate total budgeted amount (similar to Dashboard logic)
  const totalBudgeted = useMemo(() => {
    try {
      const savedBudgets = localStorage.getItem('budgets');
      if (!savedBudgets) return 0;
      const budgets = JSON.parse(savedBudgets);
      const now = new Date();
      // Calculate active budgets based on period
      const activeBudgets = budgets.filter(budget => {
        if (!budget.createdAt) return true;
        const createdDate = new Date(budget.createdAt);
        const daysDiff = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
        
        if (budget.period === 'weekly') {
          return daysDiff < 7;
        } else if (budget.period === 'monthly') {
          return daysDiff < 30;
        } else if (budget.period === 'yearly') {
          return daysDiff < 365;
        }
        return true;
      });
      return activeBudgets.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
    } catch (e) {
      console.error("Failed to parse budgets from localStorage", e);
      return 0;
    }
  }, []);

  // Calculate available balance (income - expenses - budgets)
  const availableBalance = totalIncome - totalExpenses - totalBudgeted;
  
  // Calculate actual savings (20% of available balance, similar to dashboard)
  // This represents the recommended savings amount
  const actualSavings = Math.round(availableBalance * 0.2);
  
  // Calculate savings rate as percentage of income
  // This shows what portion of income is being saved
  const savingsRate = totalIncome > 0 ? ((actualSavings / totalIncome) * 100).toFixed(1) : 0;

  // Spending by category
  const categoryData = useMemo(() => {
    const categoryTotals = {};
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const biggestCategory = categoryData[0] || { name: 'None', value: 0 };

  // Income vs Expense comparison
  const incomeVsExpenseData = [
    { name: 'Income', amount: totalIncome, fill: COLORS.income },
    { name: 'Expenses', amount: totalExpenses, fill: COLORS.expense }
  ];

  // Trend over time
  const trendData = useMemo(() => {
    const grouped = {};
    filteredTransactions.forEach(t => {
      const date = new Date(t.date);
      let key;
      
      if (timeFilter === 'week') {
        key = date.toLocaleDateString('en-US', { weekday: 'short' });
      } else if (timeFilter === 'month') {
        key = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      } else if (timeFilter === 'year') {
        key = date.toLocaleDateString('en-US', { month: 'short' });
      } else {
        key = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      }

      if (!grouped[key]) {
        grouped[key] = { name: key, income: 0, expense: 0 };
      }
      
      if (t.type === 'income') {
        grouped[key].income += t.amount;
      } else {
        grouped[key].expense += t.amount;
      }
    });

    return Object.values(grouped);
  }, [filteredTransactions, timeFilter]);

  // Savings growth over time
  const savingsGrowthData = useMemo(() => {
    let runningBalance = 0;
    const sortedTransactions = [...filteredTransactions].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    return sortedTransactions.map(t => {
      if (t.type === 'income') {
        runningBalance += t.amount;
      } else {
        runningBalance -= t.amount;
      }
      
      return {
        date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        balance: runningBalance
      };
    });
  }, [filteredTransactions]);

  const allCategories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category));
    return ['all', ...Array.from(cats)];
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        
        
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#2b5f76] font-satoshi text-sm text-gray-700"
          >
            <option value="week">{t('analytics.last_7_days')}</option>
            <option value="month">{t('analytics.last_30_days')}</option>
            <option value="year">{t('analytics.last_year')}</option>
            <option value="all">{t('analytics.all_time')}</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#2b5f76] font-satoshi text-sm text-gray-700"
          >
            {allCategories.map(cat => (
              <option key={cat} value={cat}>{cat === 'all' ? t('transactions.all_categories') : cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#03e26f] to-[#5f8662] rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="font-satoshi text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">{t('analytics.total_income')}</span>
          </div>
          <p className="font-satoshi text-sm text-gray-600 mb-1">{t('analytics.total_income')}</p>
          <p className="font-clash font-bold text-2xl text-[#03e26f]">{totalIncome.toLocaleString()} {userData.currency}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#dd573c] to-[#ab3412] rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <span className="font-satoshi text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">{t('analytics.total_expenses')}</span>
          </div>
          <p className="font-satoshi text-sm text-gray-600 mb-1">{t('analytics.total_expenses')}</p>
          <p className="font-clash font-bold text-2xl text-[#dd573c]">{totalExpenses.toLocaleString()} {userData.currency}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#2b5f76] to-[#143052] rounded-xl flex items-center justify-center">
              <PiggyBank className="w-6 h-6 text-white" />
            </div>
            <span className={`font-satoshi text-xs px-2 py-1 rounded-full ${
              actualSavings >= 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
            }`}>
              {savingsRate}%
            </span>
          </div>
          <p className="font-satoshi text-sm text-gray-600 mb-1">{t('analytics.net_savings')}</p>
          <p className={`font-clash font-bold text-2xl ${actualSavings >= 0 ? 'text-[#03e26f]' : 'text-[#dd573c]'}`}>
            {actualSavings.toLocaleString()} {userData.currency}
          </p>
          <p className="font-satoshi text-xs text-gray-500 mt-1">
            {t('analytics.recommended_savings')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-[#c6be4d] to-[#dbf22c] rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="font-satoshi text-sm text-white/90 mb-1">{t('analytics.biggest_category')}</p>
          <p className="font-clash font-bold text-xl text-white truncate">{biggestCategory.name}</p>
          <p className="font-satoshi text-sm text-white/80">{biggestCategory.value.toLocaleString()} {userData.currency}</p>
        </motion.div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md"
        >
          <h3 className="font-clash font-bold text-lg text-[#0d121a] mb-6">{t('analytics.income_vs_expenses')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={incomeVsExpenseData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#6b7280" style={{ fontFamily: 'Satoshi, sans-serif', fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontFamily: 'Satoshi, sans-serif', fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  fontFamily: 'Satoshi, sans-serif', 
                  borderRadius: '12px', 
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                {incomeVsExpenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Spending by Category Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md"
        >
          <h3 className="font-clash font-bold text-lg text-[#0d121a] mb-6">{t('analytics.spending_by_category')}</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.categories[index % COLORS.categories.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    fontFamily: 'Satoshi, sans-serif', 
                    borderRadius: '12px', 
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p className="font-satoshi text-gray-500">{t('analytics.no_expense_data')}</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6">
        {/* Trend Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md"
        >
          <h3 className="font-clash font-bold text-lg text-[#0d121a] mb-6">{t('analytics.income_expense_trends')}</h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" style={{ fontFamily: 'Satoshi, sans-serif', fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontFamily: 'Satoshi, sans-serif', fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    fontFamily: 'Satoshi, sans-serif', 
                    borderRadius: '12px', 
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend wrapperStyle={{ fontFamily: 'Satoshi, sans-serif', fontSize: '14px' }} />
                <Line type="monotone" dataKey="income" stroke={COLORS.income} strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="expense" stroke={COLORS.expense} strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p className="font-satoshi text-gray-500">{t('analytics.no_transaction_data')}</p>
            </div>
          )}
        </motion.div>

        {/* Savings Growth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md"
        >
          <h3 className="font-clash font-bold text-lg text-[#0d121a] mb-6">{t('analytics.savings_growth_over_time')}</h3>
          {savingsGrowthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={savingsGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" style={{ fontFamily: 'Satoshi, sans-serif', fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontFamily: 'Satoshi, sans-serif', fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    fontFamily: 'Satoshi, sans-serif', 
                    borderRadius: '12px', 
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#2b5f76" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#2b5f76' }}
                  fill="url(#colorBalance)"
                />
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2b5f76" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2b5f76" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p className="font-satoshi text-gray-500">{t('analytics.no_savings_data')}</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Category Breakdown Table */}
      {categoryData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md"
        >
          <h3 className="font-clash font-bold text-lg text-[#0d121a] mb-6">{t('analytics.category_breakdown')}</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-clash font-semibold text-sm text-gray-700">{t('analytics.category')}</th>
                  <th className="text-right py-3 px-4 font-clash font-semibold text-sm text-gray-700">{t('budgets.amount')}</th>
                  <th className="text-right py-3 px-4 font-clash font-semibold text-sm text-gray-700">{t('analytics.percentage')}</th>
                </tr>
              </thead>
              <tbody>
                {categoryData.map((cat, index) => (
                  <tr key={cat.name} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS.categories[index % COLORS.categories.length] }}
                      />
                      <span className="font-satoshi font-medium text-gray-700">{cat.name}</span>
                    </td>
                    <td className="text-right py-3 px-4 font-clash font-semibold text-[#dd573c]">
                      {cat.value.toLocaleString()} {userData.currency}
                    </td>
                    <td className="text-right py-3 px-4 font-satoshi text-gray-600">
                      {((cat.value / totalExpenses) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default Analytics;
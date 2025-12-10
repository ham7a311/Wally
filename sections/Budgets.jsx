import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Plus, X, Trash2, Edit, AlertCircle, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

function Budgets({ transactions, userData }) {
  const { t } = useTranslation();
  
  // Helper function to add notification
  const addNotification = (type, title, description, icon = '🔔') => {
    try {
      const saved = localStorage.getItem('notifications');
      const existingNotifications = saved ? JSON.parse(saved) : [];
      const newNotification = {
        id: Date.now().toString(),
        type,
        title,
        description,
        timestamp: new Date().toISOString(),
        read: false,
        icon
      };
      const updatedNotifications = [newNotification, ...existingNotifications];
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    } catch (e) {
      console.error("Failed to add notification", e);
    }
  };
  const [budgets, setBudgets] = useState(() => {
    try {
    const saved = localStorage.getItem('budgets');
    return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse budgets from localStorage", e);
      return [];
    }
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);
  const [showBalanceWarning, setShowBalanceWarning] = useState(false);
  const [isEditingSpent, setIsEditingSpent] = useState(null);
  const [manualSpentValue, setManualSpentValue] = useState('');
  
  // Form state
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState('monthly');
  const [emoji, setEmoji] = useState('💰');
  const [color, setColor] = useState('#2b5f76');

  const emojis = ['💰', '🍔', '🚗', '🎮', '🏠', '💊', '✈️', '🛍️', '📱', '⚡'];
  const colors = ['#2b5f76', '#dd573c', '#03e26f', '#c6be4d', '#143052', '#ab3412', '#634423'];

  // Calculate income
  const totalIncome = useMemo(() => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  // Filter budgets by period (auto-refresh based on period)
  const activeBudgets = useMemo(() => {
    const now = new Date();
    return budgets.filter(budget => {
      if (!budget.createdAt) return true; // Include budgets without createdAt for backward compatibility
      
      const createdDate = new Date(budget.createdAt);
      const daysDiff = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
      
      if (budget.period === 'weekly') {
        // Weekly budgets refresh every 7 days
        const weeksSinceCreation = Math.floor(daysDiff / 7);
        return weeksSinceCreation === 0 || daysDiff % 7 < 7;
      } else if (budget.period === 'monthly') {
        // Monthly budgets refresh every 30 days
        return daysDiff < 30;
      } else if (budget.period === 'yearly') {
        // Yearly budgets refresh every 365 days
        return daysDiff < 365;
      }
      return true;
    });
  }, [budgets]);

  // Calculate spending per category
  const categorySpending = useMemo(() => {
    const spending = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      spending[t.category] = (spending[t.category] || 0) + t.amount;
    });
    return spending;
  }, [transactions]);

  // Get actual spent amount for a budget (manualSpent takes priority, else use categorySpending)
  const getBudgetSpent = useCallback((budget) => {
    if (budget.manualSpent !== undefined && budget.manualSpent !== null) {
      return parseFloat(budget.manualSpent) || 0;
    }
    return categorySpending[budget.category] || 0;
  }, [categorySpending]);

  // Calculate totals using active budgets with manualSpent support
  const totalBudgeted = activeBudgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = activeBudgets.reduce((sum, b) => sum + getBudgetSpent(b), 0);
  const remainingBudget = totalBudgeted - totalSpent;
  const budgetUsagePercent = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
  
  // Calculate total balance from transactions
  const totalBalance = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return income - expenses;
  }, [transactions]);
  
  // Calculate remaining balance (income minus total budgets)
  const remainingBalanceAfterBudgets = totalIncome - totalBudgeted;

  // Get progress color
  const getProgressColor = (percent) => {
    if (percent < 80) return '#03e26f';
    if (percent < 90) return '#c6be4d';
    return '#dd573c';
  };

  // Handle save budget
  const handleSave = () => {
    if (!category || !amount || parseFloat(amount) <= 0) return;

    const budgetAmount = parseFloat(amount);
    
    // Check if budget exceeds balance - prevent creation if it does
    if (budgetAmount > totalBalance) {
      setShowBalanceWarning(true);
      // Add warning notification
      addNotification(
        'budget',
        'Budget Warning',
        `Your budget for ${category} (${budgetAmount.toLocaleString()} ${userData.currency}) exceeds your available balance (${totalBalance.toLocaleString()} ${userData.currency}). Please lower the budget amount.`,
        '⚠️'
      );
      return; // Don't create the budget
    }

    const budgetData = {
      id: editingBudget ? editingBudget.id : Date.now().toString(),
      category,
      amount: budgetAmount,
      period,
      emoji,
      color,
      manualSpent: editingBudget ? editingBudget.manualSpent : 0, // Initialize with 0
      createdAt: editingBudget ? editingBudget.createdAt : new Date().toISOString()
    };

    const updatedBudgets = editingBudget
      ? budgets.map(b => b.id === editingBudget.id ? budgetData : b)
      : [...budgets, budgetData];

    setBudgets(updatedBudgets);
    try {
    localStorage.setItem('budgets', JSON.stringify(updatedBudgets));
      localStorage.setItem('budgetsTimestamp', Date.now().toString());
    } catch (e) {
      console.error("Failed to save budgets to localStorage", e);
    }
    
    // Add notification when budget is created (not when edited)
    if (!editingBudget) {
      addNotification(
        'budget',
        'Budget Created',
        `New budget created for ${category}: ${budgetAmount.toLocaleString()} ${userData.currency} (${period}).`,
        '💰'
      );
    }
    
    resetForm();
    setIsModalOpen(false);
    setShowBalanceWarning(false);
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setCategory(budget.category);
    setAmount(budget.amount.toString());
    setPeriod(budget.period);
    setEmoji(budget.emoji);
    setColor(budget.color);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (budget) => {
    setBudgetToDelete(budget);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (budgetToDelete) {
      const updated = budgets.filter(b => b.id !== budgetToDelete.id);
    setBudgets(updated);
      try {
    localStorage.setItem('budgets', JSON.stringify(updated));
        localStorage.setItem('budgetsTimestamp', Date.now().toString());
      } catch (e) {
        console.error("Failed to save budgets to localStorage", e);
      }
    }
    setIsDeleteModalOpen(false);
    setBudgetToDelete(null);
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setBudgetToDelete(null);
  };

  const handleUpdateManualSpent = (budgetId, newSpent, options = {}) => {
    const { keepEditing = false } = options;
    const budget = budgets.find(b => b.id === budgetId);
    if (!budget) return;

    // Clamp value between 0 and budget amount
    let spentValue = parseFloat(newSpent);
    if (isNaN(spentValue)) spentValue = 0;
    if (spentValue < 0) spentValue = 0;
    if (spentValue > budget.amount) spentValue = budget.amount;

    const updatedBudgets = budgets.map(b => {
      if (b.id === budgetId) {
        return {
          ...b,
          manualSpent: spentValue
        };
      }
      return b;
    });
    setBudgets(updatedBudgets);
    try {
      localStorage.setItem('budgets', JSON.stringify(updatedBudgets));
      localStorage.setItem('budgetsTimestamp', Date.now().toString());
    } catch (e) {
      console.error("Failed to save budgets to localStorage", e);
    }
    if (!keepEditing) {
      setIsEditingSpent(null);
      setManualSpentValue('');
    }
  };

  const resetForm = useCallback(() => {
    setEditingBudget(null);
    setCategory('');
    setAmount('');
    setPeriod('monthly');
    setEmoji('💰');
    setColor('#2b5f76');
  }, []);

  // Sync budgets to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('budgets', JSON.stringify(budgets));
      localStorage.setItem('budgetsTimestamp', Date.now().toString());
    } catch (e) {
      console.error("Failed to save budgets to localStorage", e);
    }
  }, [budgets]);

  // Handle modal click outside
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isModalOpen && modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalOpen(false);
        resetForm();
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, resetForm]);

  // Top spending category (using manualSpent when available)
  const topSpendingCategory = useMemo(() => {
    // Create a combined spending map using manualSpent when available
    const combinedSpending = {};
    activeBudgets.forEach(budget => {
      const spent = getBudgetSpent(budget);
      combinedSpending[budget.category] = (combinedSpending[budget.category] || 0) + spent;
    });
    
    // Also include transaction-based spending for categories without budgets
    Object.entries(categorySpending).forEach(([cat, amount]) => {
      if (!combinedSpending[cat]) {
        combinedSpending[cat] = amount;
      }
    });
    
    const entries = Object.entries(combinedSpending);
    if (entries.length === 0) return null;
    return entries.reduce((max, curr) => curr[1] > max[1] ? curr : max);
  }, [activeBudgets, categorySpending, getBudgetSpent]);

  // Pie chart data (using active budgets with manualSpent support)
  const pieData = activeBudgets.map(b => ({
    name: b.category,
    value: getBudgetSpent(b)
  })).filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="font-satoshi text-sm text-gray-600">{t('budgets.total_budgeted')}</p>
            <div className="w-10 h-10 bg-gradient-to-br from-[#2b5f76] to-[#143052] rounded-lg flex items-center justify-center">
              <PieChartIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="font-clash font-bold text-3xl text-[#0d121a]">{totalBudgeted.toLocaleString()} {userData.currency}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="font-satoshi text-sm text-gray-600">{t('budgets.total_spent')}</p>
            <div className="w-10 h-10 bg-gradient-to-br from-[#dd573c] to-[#ab3412] rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="font-clash font-bold text-3xl text-[#dd573c]">{totalSpent.toLocaleString()} {userData.currency}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="font-satoshi text-sm text-gray-600">{t('budgets.remaining')}</p>
            {budgetUsagePercent > 90 && (
              <AlertCircle className="w-5 h-5 text-[#dd573c]" />
            )}
          </div>
          <p className={`font-clash font-bold text-3xl ${remainingBudget >= 0 ? 'text-[#03e26f]' : 'text-[#dd573c]'}`}>
            {remainingBudget.toLocaleString()} {userData.currency}
          </p>
        </motion.div>
      </div>

      {/* Small Analytics/Motivational Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-gradient-to-br from-[#2b5f76]/10 to-[#03e26f]/10 rounded-2xl p-6 border-2 border-[#2b5f76]/20 shadow-md"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Budget Usage Percentage */}
          <div className="text-center md:text-left">
            <p className="font-satoshi text-sm text-gray-600 mb-1">{t('budgets.budget_usage')}</p>
            <p className="font-clash font-bold text-2xl text-[#0d121a]">
              {t('budgets.youve_spent')} <span className="text-[#2b5f76]">{budgetUsagePercent.toFixed(0)}%</span> {t('budgets.of_your_total_budget')}
            </p>
          </div>

          {/* Top Spending Category */}
          {topSpendingCategory && (
            <div className="text-center md:text-left">
              <p className="font-satoshi text-sm text-gray-600 mb-1">{t('budgets.top_spending_category')}</p>
              <p className="font-clash font-bold text-2xl text-[#0d121a]">
                <span className="text-[#dd573c]">{topSpendingCategory[0]}</span>
              </p>
            </div>
          )}

          {/* Mini Pie Chart */}
          {pieData.length > 0 && (
            <div className="flex justify-center md:justify-end">
              <div className="w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={20}
                      outerRadius={45}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        border: 'none',
                        fontFamily: 'Satoshi, sans-serif',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Remaining Balance After Budgets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-satoshi text-sm text-gray-600 mb-1">{t('budgets.remaining_balance_after_budgets')}</p>
            <p className={`font-clash font-bold text-3xl ${remainingBalanceAfterBudgets >= 0 ? 'text-[#03e26f]' : 'text-[#dd573c]'}`}>
              {remainingBalanceAfterBudgets.toLocaleString()} {userData.currency}
            </p>
            <p className="font-satoshi text-xs text-gray-500 mt-1">
              {t('budgets.income')} ({totalIncome.toLocaleString()} {userData.currency}) - {t('budgets.total_budgets')} ({totalBudgeted.toLocaleString()} {userData.currency})
            </p>
          </div>
          {remainingBalanceAfterBudgets < 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-[#dd573c]/10 rounded-xl">
              <AlertCircle className="w-5 h-5 text-[#dd573c]" />
              <span className="font-satoshi text-sm text-[#dd573c] font-semibold">{t('budgets.over_budget')}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Total Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-clash font-bold text-lg text-[#0d121a]">{t('budgets.overall_budget_usage')}</h3>
            <p className="font-satoshi text-sm text-gray-600">{budgetUsagePercent.toFixed(1)}% {t('budgets.of_total_budget_used')}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-[#03e26f] text-white font-clash font-semibold rounded-full hover:shadow-lg transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            {t('budgets.new_budget')}
          </motion.button>
        </div>
        <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(budgetUsagePercent, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ backgroundColor: getProgressColor(budgetUsagePercent) }}
          />
        </div>
      </motion.div>

      {/* Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeBudgets.map((budget, index) => {
          const spent = getBudgetSpent(budget);
          const remaining = budget.amount - spent;
          const percentUsed = (spent / budget.amount) * 100;
          const progressColor = getProgressColor(percentUsed);
          const isExceeded = percentUsed >= 100;
          const isEditing = isEditingSpent === budget.id;

          return (
            <motion.div
              key={budget.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-2xl p-6 shadow-lg relative overflow-hidden ${isExceeded ? 'ring-2 ring-[#dd573c] ring-opacity-50' : ''}`}
              style={{ backgroundColor: isExceeded ? '#dd573c' : budget.color }}
            >
              {/* Emoji Badge */}
              <div className="absolute -top-4 -right-4 text-6xl opacity-20">
                {budget.emoji}
              </div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{budget.emoji}</span>
                    <div>
                      <h4 className="font-clash font-bold text-lg text-white">{budget.category}</h4>
                      <p className="font-satoshi text-xs text-white/80 capitalize">{budget.period}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEdit(budget)}
                      className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                    >
                      <Edit className="w-4 h-4 text-white" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteClick(budget)}
                      className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </motion.button>
                  </div>
                </div>

                <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                    <span className="font-satoshi text-sm text-white/80">{t('budgets.spent')}</span>
                    {isEditing ? (
                      <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 border-2 border-white/30 shadow-lg">
                        <input
                          type="number"
                          min="0"
                          max={budget.amount}
                          step="0.1"
                          value={manualSpentValue}
                          onChange={(e) => {
                            const value = e.target.value;
                            setManualSpentValue(value);
                          }}
                          autoFocus
                          className="w-28 px-3 py-2 rounded-lg text-lg font-clash font-bold bg-white text-[#0d121a] focus:outline-none focus:ring-2 focus:ring-white/50 text-right"
                          placeholder="0"
                        />
                        <span className="font-clash text-base text-white font-bold">{userData.currency}</span>
                        <div className="flex items-center gap-1 ml-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              if (manualSpentValue !== '' && manualSpentValue !== null && manualSpentValue !== undefined) {
                                let numValue = parseFloat(manualSpentValue);
                                if (isNaN(numValue)) numValue = 0;
                                if (numValue > budget.amount) numValue = budget.amount;
                                if (numValue < 0) numValue = 0;
                                handleUpdateManualSpent(budget.id, numValue);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-[#03e26f] hover:bg-[#02b558] transition-colors"
                            title="Confirm"
                          >
                            <span className="text-white text-lg leading-none">✓</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setIsEditingSpent(null);
                              setManualSpentValue('');
                            }}
                            className="p-1.5 rounded-lg bg-[#dd573c] hover:bg-[#ab3412] transition-colors"
                            title="Cancel"
                          >
                            <span className="text-white text-lg leading-none">✕</span>
                          </motion.button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
                        <span className="font-satoshi text-xs text-white/70">
                          {t('budgets.amount')}: {budget.amount.toLocaleString()} {userData.currency}
                        </span>
                        {manualSpentValue !== '' && !isNaN(parseFloat(manualSpentValue)) && parseFloat(manualSpentValue) > budget.amount && (
                          <span className="font-satoshi text-xs text-[#dd573c] bg-white px-2 py-0.5 rounded font-semibold">
                            {t('budgets.will_be_capped')}
                          </span>
                        )}
                      </div>
                    </div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setIsEditingSpent(budget.id);
                          setManualSpentValue(spent.toString());
                        }}
                        className="group flex items-center gap-1.5 font-clash font-bold text-xl text-white hover:text-white/90 transition-all cursor-pointer"
                        title="Click to edit spent amount"
                      >
                        <span className="underline decoration-dotted underline-offset-2 decoration-white/60">
                          {spent.toLocaleString()} {userData.currency}
                        </span>
                        <Edit className="w-4 h-4 opacity-70" />
                      </motion.button>
                    )}
                  </div>
                  
                  <div className="relative w-full h-3 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(percentUsed, 100)}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: progressColor }}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-satoshi text-sm text-white/80">
                      {percentUsed.toFixed(0)}% {t('budgets.used')}
                    </span>
                    <span className={`font-clash font-semibold text-lg ${remaining >= 0 ? 'text-white' : 'text-white'}`}>
                      {remaining >= 0 ? `${remaining.toLocaleString()} ${userData.currency} ${t('budgets.left')}` : `${Math.abs(remaining).toLocaleString()} ${userData.currency} ${t('budgets.over')}`}
                    </span>
                  </div>

                  {isExceeded && (
                    <div className="flex items-center gap-2 mt-2 p-2 bg-white/30 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-white" />
                      <span className="font-satoshi text-xs text-white font-semibold">{t('budgets.budget_exceeded')}</span>
                    </div>
                  )}
                  
                  {!isExceeded && percentUsed > 90 && (
                    <div className="flex items-center gap-2 mt-2 p-2 bg-[#c6be4d]/30 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-white" />
                      <span className="font-satoshi text-xs text-white">{t('budgets.approaching_limit')}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Add Budget Card */}
        {budgets.length === 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="border-2 border-dashed border-gray-300 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 hover:border-[#2b5f76] hover:bg-gray-50 transition-all duration-300"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-[#2b5f76] to-[#143052] rounded-full flex items-center justify-center">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <h4 className="font-clash font-bold text-lg text-[#0d121a] mb-1">{t('budgets.create_first_budget')}</h4>
              <p className="font-satoshi text-sm text-gray-600">{t('budgets.start_tracking')}</p>
            </div>
          </motion.button>
        )}
      </div>

      {/* Insights Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-br from-[#2b5f76] to-[#143052] rounded-2xl p-8 shadow-lg"
      >
        <h3 className="font-clash font-bold text-2xl text-white mb-6">{t('budgets.budget_insights')}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="space-y-4">
            <div className="bg-white/10 rounded-xl p-4">
                <p className="font-satoshi text-sm text-white/80 mb-1">{t('budgets.overall_status')}</p>
                <p className="font-clash font-bold text-xl text-white">
                  {remainingBalanceAfterBudgets < 0 
                    ? `🚨 ${t('budgets.warning_budgets_exceed_balance')}` :
                   budgetUsagePercent < 80 
                    ? `🎉 ${t('budgets.great_job')}` : 
                   budgetUsagePercent < 100 
                    ? `⚠️ ${t('budgets.getting_close')}` : 
                   `🚨 ${t('budgets.budget_exceeded_msg')}`}
                </p>
              </div>

              {topSpendingCategory && (
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="font-satoshi text-sm text-white/80 mb-1">{t('budgets.top_spending_category')}</p>
                  <p className="font-clash font-bold text-xl text-white">
                    {topSpendingCategory[0]}: {topSpendingCategory[1].toLocaleString()} {userData.currency}
                  </p>
                </div>
              )}

              <div className="bg-white/10 rounded-xl p-4">
                <p className="font-satoshi text-sm text-white/80 mb-1">{t('budgets.active_budgets')}</p>
                <p className="font-clash font-bold text-xl text-white">{budgets.length} {budgets.length === 1 ? t('budgets.budget') : t('budgets.budgets')}</p>
              </div>
            </div>
          </div>

          {pieData.length > 0 && (
            <div className="bg-white/10 rounded-xl p-4">
              <p className="font-satoshi text-sm text-white/80 mb-4">{t('budgets.spending_distribution')}</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      border: 'none',
                      fontFamily: 'Satoshi, sans-serif'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => {
              setIsModalOpen(false);
              resetForm();
            }}
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-clash font-bold text-2xl text-[#0d121a]">
                  {editingBudget ? t('budgets.edit_budget') : t('budgets.new_budget')}
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </motion.button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block font-satoshi font-medium text-sm text-gray-700 mb-2">{t('budgets.category')}</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Food, Transport"
                    className="w-full p-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#2b5f76] font-satoshi"
                  />
                </div>

                <div>
                  <label className="block font-satoshi font-medium text-sm text-gray-700 mb-2">
                    {t('budgets.amount')} ({userData.currency})
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setShowBalanceWarning(false);
                    }}
                    placeholder="0.00"
                    className={`w-full p-3 rounded-xl border-2 font-satoshi focus:outline-none ${
                      showBalanceWarning ? 'border-[#dd573c] focus:border-[#dd573c]' : 'border-gray-200 focus:border-[#2b5f76]'
                    }`}
                  />
                  {showBalanceWarning && (
                    <div className="mt-2 p-3 bg-[#dd573c]/10 border border-[#dd573c]/30 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-[#dd573c] mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-satoshi text-sm text-[#dd573c] font-semibold mb-1">
                            {t('budgets.balance_too_low')}
                          </p>
                          <p className="font-satoshi text-sm text-[#dd573c]">
                            {t('budgets.budget_exceeds_balance', { 
                              amount: (parseFloat(amount) || 0).toLocaleString(), 
                              currency: userData.currency, 
                              balance: totalBalance.toLocaleString() 
                            })}
                          </p>
                          <p className="font-satoshi text-xs text-[#dd573c]/80 mt-2">
                            {t('budgets.suggest_lower_budget', { 
                              maxAmount: totalBalance.toLocaleString(), 
                              currency: userData.currency 
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end mt-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setShowBalanceWarning(false);
                            setAmount(totalBalance.toString()); // Suggest the max amount
                          }}
                          className="px-4 py-2 bg-[#2b5f76] text-white font-satoshi font-semibold text-sm rounded-lg hover:bg-[#143052] transition-colors"
                        >
                          {t('budgets.use_max_balance')}
                        </motion.button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-satoshi font-medium text-sm text-gray-700 mb-2">{t('budgets.period')}</label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#2b5f76] font-satoshi"
                  >
                    <option value="weekly">{t('budgets.weekly')}</option>
                    <option value="monthly">{t('budgets.monthly')}</option>
                    <option value="yearly">{t('budgets.yearly')}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-satoshi font-medium text-sm text-gray-700 mb-2">{t('budgets.icon')}</label>
                  <div className="flex flex-wrap gap-2">
                    {emojis.map(e => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => setEmoji(e)}
                        className={`text-2xl p-2 rounded-lg transition-all ${
                          emoji === e ? 'bg-[#2b5f76]/10 ring-2 ring-[#2b5f76]' : 'hover:bg-gray-100'
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-satoshi font-medium text-sm text-gray-700 mb-2">{t('budgets.color')}</label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-10 h-10 rounded-lg transition-all ${
                          color === c ? 'ring-2 ring-offset-2 ring-[#2b5f76]' : ''
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  className="w-full py-4 bg-[#03e26f] text-white font-clash font-bold text-lg rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  {editingBudget ? t('budgets.save_changes') : t('budgets.create_budget')}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
          )}
        </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && budgetToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={cancelDelete}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[#dd573c]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-[#dd573c]" />
                </div>
                <h3 className="font-clash font-bold text-2xl text-[#0d121a] mb-2">
                  {t('budgets.are_you_sure_delete')}
                </h3>
                <p className="font-satoshi text-gray-600">
                  {t('budgets.will_permanently_delete')} <span className="font-semibold">{budgetToDelete.category}</span>.
                </p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={cancelDelete}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 font-clash font-semibold rounded-xl hover:bg-gray-300 transition-colors"
                >
                  {t('dashboard.settings.cancel')}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmDelete}
                  className="flex-1 py-3 bg-[#dd573c] text-white font-clash font-semibold rounded-xl hover:bg-[#ab3412] transition-colors"
                >
                  {t('budgets.delete_budget')}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Budgets;
import { useState, useEffect, useCallback, useRef } from 'react';
import { Home, Wallet, TrendingUp, PieChart, Settings, LogOut, User, Bell, Plus, Globe, Info } from 'lucide-react';
import { useUser } from '../hooks/useUser';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import Transactions from './Transactions';
import Analytics from './Analytics';
import Budgets from './Budgets';
import Notifications from './Notifications';

// --- Main Dashboard Component ---
function Dashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { userData, updateUserData, resetUserData } = useUser();
  
  // Force English in dashboard - Arabic coming soon
  useEffect(() => {
    if (i18n.language === 'ar') {
      i18n.changeLanguage('en');
    }
  }, [i18n]);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingWalletName, setIsEditingWalletName] = useState(false);
  const [walletNameInput, setWalletNameInput] = useState(userData.walletName || '');
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [showArabicWarning, setShowArabicWarning] = useState(false);
  // Initialize previous balance from localStorage
  const previousBalanceRef = useRef((() => {
    try {
      const saved = localStorage.getItem('previousBalance');
      return saved ? parseFloat(saved) : null;
    } catch {
      return null;
    }
  })());
  // Initialize previous savings from localStorage
  const previousSavingsRef = useRef((() => {
    try {
      const saved = localStorage.getItem('previousSavings');
      return saved ? parseFloat(saved) : null;
    } catch {
      return null;
    }
  })());
  const [balancePercentageChange, setBalancePercentageChange] = useState(0);
  const [savingsPercentageChange, setSavingsPercentageChange] = useState(0);
    
    const [transactions, setTransactions] = useState(() => {
      try {
        const saved = localStorage.getItem('transactions');
      const loaded = saved ? JSON.parse(saved) : [];
      return loaded.map((t, i) => ({
          ...t, 
        id: String(t.id || `corrupted-${i}-${Date.now()}`)
        }));
    } catch {
        return [];
      }
    });
  
    const [transactionToEdit, setTransactionToEdit] = useState(null);
    const [transactionToDelete, setTransactionToDelete] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Get unread notifications count
  const getUnreadNotificationsCount = useCallback(() => {
    try {
      const saved = localStorage.getItem('notifications');
      if (!saved) return 0;
      const notifications = JSON.parse(saved);
      return notifications.filter(n => !n.read).length;
    } catch (e) {
      console.error("Failed to parse notifications from localStorage", e);
      return 0;
    }
  }, []);

  // State to track unread notifications count
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(() => getUnreadNotificationsCount());

  // Update unread count when activeTab changes (to catch notification updates)
  useEffect(() => {
    setUnreadNotificationsCount(getUnreadNotificationsCount());
  }, [activeTab, getUnreadNotificationsCount]);

  // Listen for storage changes to update unread count (for cross-tab updates)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'notifications') {
        setUnreadNotificationsCount(getUnreadNotificationsCount());
      }
    };
    window.addEventListener('storage', handleStorageChange);
    // Also check on interval for same-tab updates (when notifications are updated in same tab)
    const interval = setInterval(() => {
      const newCount = getUnreadNotificationsCount();
      if (newCount !== unreadNotificationsCount) {
        setUnreadNotificationsCount(newCount);
      }
    }, 500); // Check every 500ms

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [getUnreadNotificationsCount, unreadNotificationsCount]);
  
  // Track budgets changes to recalculate percentage when budgets are added/modified/deleted
  const [budgetsChangeTrigger, setBudgetsChangeTrigger] = useState(0);
  
    const getTotalBalance = useCallback(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    
    // Get total budgeted amount from localStorage
    let totalBudgeted = 0;
    try {
      const savedBudgets = localStorage.getItem('budgets');
      if (savedBudgets) {
        const budgets = JSON.parse(savedBudgets);
        const now = new Date();
        // Calculate active budgets (similar to Budgets.jsx logic)
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
        totalBudgeted = activeBudgets.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
      }
    } catch (e) {
      console.error("Failed to parse budgets from localStorage", e);
    }
    
      return Math.round(income - expenses - totalBudgeted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactions, budgetsChangeTrigger]);
  
    const getSavings = useCallback(() => {
      // If user has a fixed savings goal, use that
      if (userData.savingGoalAmount && userData.savingGoalAmount !== '') {
        return parseInt(userData.savingGoalAmount) || 200;
      }
      // Otherwise, calculate as 20% of total balance (after subtracting budgets)
      const totalBalance = getTotalBalance();
      return Math.round(totalBalance * 0.2);
    }, [userData.savingGoalAmount, getTotalBalance]);
  
  const getTransactionCount = useCallback(() => transactions.length, [transactions]);
  
  // Listen for budget changes in localStorage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'budgets') {
        setBudgetsChangeTrigger(prev => prev + 1);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Also poll for same-tab budget changes by checking budgets timestamp
    const interval = setInterval(() => {
      try {
        const budgetsTimestamp = localStorage.getItem('budgetsTimestamp');
        const lastTimestamp = localStorage.getItem('lastBudgetsTimestamp');
        if (budgetsTimestamp && budgetsTimestamp !== lastTimestamp) {
          localStorage.setItem('lastBudgetsTimestamp', budgetsTimestamp);
          setBudgetsChangeTrigger(prev => prev + 1);
        }
      } catch {
        // Ignore errors
      }
    }, 300);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);
  
  // Calculate and update balance percentage change when balance changes
  useEffect(() => {
    if (!userData.isSetupComplete) return;
    
    const currentBalance = getTotalBalance();
    const prevBalance = previousBalanceRef.current;
    
    if (prevBalance === null) {
      // First time - store current balance as previous, no change yet
      previousBalanceRef.current = currentBalance;
      try {
        localStorage.setItem('previousBalance', currentBalance.toString());
      } catch (e) {
        console.error("Failed to save previous balance", e);
      }
      setBalancePercentageChange(0);
      return;
    }
    
    // If current balance is 0, always show 0%
    if (currentBalance === 0) {
      setBalancePercentageChange(0);
      previousBalanceRef.current = currentBalance;
      try {
        localStorage.setItem('previousBalance', currentBalance.toString());
      } catch (e) {
        console.error("Failed to save previous balance", e);
      }
      return;
    }
    
    // Calculate percentage change: ((new - old) / old) * 100
    // Only calculate if balance actually changed
    if (currentBalance === prevBalance) {
      // No change - set to 0%
      setBalancePercentageChange(0);
    } else if (prevBalance === 0) {
      // Previous balance was 0
      if (currentBalance > 0) {
        setBalancePercentageChange(100);
      } else if (currentBalance < 0) {
        setBalancePercentageChange(-100);
      } else {
        setBalancePercentageChange(0);
      }
      // Update previous balance for next calculation
      previousBalanceRef.current = currentBalance;
      try {
        localStorage.setItem('previousBalance', currentBalance.toString());
      } catch (e) {
        console.error("Failed to save previous balance", e);
      }
    } else {
      const percentageChange = ((currentBalance - prevBalance) / Math.abs(prevBalance) * 100);
      const roundedChange = Math.round(percentageChange * 100) / 100;
      // Ensure we don't have NaN and preserve negative sign
      const finalChange = isNaN(roundedChange) ? 0 : roundedChange;
      setBalancePercentageChange(finalChange);
      
      // Only update previous balance after we've calculated the change
      // This ensures next calculation uses the previous value correctly
      previousBalanceRef.current = currentBalance;
      try {
        localStorage.setItem('previousBalance', currentBalance.toString());
      } catch (e) {
        console.error("Failed to save previous balance", e);
      }
    }
  }, [getTotalBalance, userData.isSetupComplete, transactions, budgetsChangeTrigger]);
  
  // Calculate and update savings percentage change when savings changes
  useEffect(() => {
    if (!userData.isSetupComplete) return;
    
    const currentSavings = getSavings();
    const prevSavings = previousSavingsRef.current;
    
    if (prevSavings === null) {
      // First time - store current savings as previous, no change yet
      previousSavingsRef.current = currentSavings;
      try {
        localStorage.setItem('previousSavings', currentSavings.toString());
      } catch (e) {
        console.error("Failed to save previous savings", e);
      }
      setSavingsPercentageChange(0);
      return;
    }
    
    // If current savings is 0, always show 0%
    if (currentSavings === 0) {
      setSavingsPercentageChange(0);
      previousSavingsRef.current = currentSavings;
      try {
        localStorage.setItem('previousSavings', currentSavings.toString());
      } catch (e) {
        console.error("Failed to save previous savings", e);
      }
      return;
    }
    
    // Calculate percentage change: ((new - old) / old) * 100
    if (currentSavings === prevSavings) {
      // No change - set to 0%
      setSavingsPercentageChange(0);
    } else if (prevSavings === 0) {
      // Previous savings was 0
      if (currentSavings > 0) {
        setSavingsPercentageChange(100);
      } else {
        setSavingsPercentageChange(0);
      }
      // Update previous savings for next calculation
      previousSavingsRef.current = currentSavings;
      try {
        localStorage.setItem('previousSavings', currentSavings.toString());
      } catch (e) {
        console.error("Failed to save previous savings", e);
      }
    } else {
      const percentageChange = ((currentSavings - prevSavings) / Math.abs(prevSavings)) * 100;
      const roundedChange = Math.round(percentageChange * 10) / 10;
      // Ensure we don't have NaN
      setSavingsPercentageChange(isNaN(roundedChange) ? 0 : roundedChange);
      
      // Update previous savings for next calculation
      previousSavingsRef.current = currentSavings;
      try {
        localStorage.setItem('previousSavings', currentSavings.toString());
      } catch (e) {
        console.error("Failed to save previous savings", e);
      }
    }
  }, [getSavings, userData.isSetupComplete, transactions, budgetsChangeTrigger]);
  
    const getPercentageChange = useCallback((type) => {
    if (!userData.isSetupComplete) return 0;
      if (type === 'savings') {
      // Return percentage change compared to previous savings
      const change = savingsPercentageChange;
      return isNaN(change) ? 0 : change;
      }
      if (type === 'balance') {
        const change = balancePercentageChange;
        return isNaN(change) ? 0 : change;
      }
      return 0;
  }, [userData.isSetupComplete, savingsPercentageChange, balancePercentageChange]);
  
    useEffect(() => {
      const currentBalance = getTotalBalance();
      localStorage.setItem('transactions', JSON.stringify(transactions));
      localStorage.setItem('totalBalance', currentBalance.toString());
      localStorage.setItem('savings', getSavings().toString());
      localStorage.setItem('transactionCount', getTransactionCount().toString());
      // Note: previousBalance is updated in getPercentageChange to ensure proper sequencing
    }, [transactions, getTotalBalance, getSavings, getTransactionCount]);
  
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

  const handleAddTransaction = (newTx) => {
    setTransactions([newTx, ...transactions]);
      setIsModalOpen(false);
    
    // Add notification for new transaction
    const transactionType = newTx.type === 'income' ? 'Income' : 'Expense';
    const amount = newTx.amount.toLocaleString();
    const currency = userData.currency;
    addNotification(
      'transaction',
      `New ${transactionType} Added`,
      `${transactionType} of ${amount} ${currency} for ${newTx.description || newTx.category}`,
      newTx.type === 'income' ? '💰' : '💳'
    );
  };
  
  const handleEditTransaction = (upd) => {
    setTransactions(transactions.map(t => t.id === upd.id ? upd : t));
      setTransactionToEdit(null);
      setIsModalOpen(false);
    };
  
  const handleDelete = (tx) => {
    setTransactionToDelete(tx);
      setIsDeleteModalOpen(true);
    };
  
    const confirmDelete = () => {
      if (transactionToDelete) {
      setTransactions(transactions.filter(t => t.id !== transactionToDelete.id));
      }
      setIsDeleteModalOpen(false);
      setTransactionToDelete(null);
    };

  // Keep user language preference but force English in dashboard
  useEffect(() => {
    if (userData.language === 'ar') {
      // Don't change language - keep it as English for dashboard
      // Update user data to remember they prefer Arabic, but show English in dashboard
    } else if (userData.language && i18n.language !== userData.language) {
      i18n.changeLanguage(userData.language);
    }
  }, [userData.language, i18n]);

  useEffect(() => {
    setWalletNameInput(userData.walletName || '');
  }, [userData.walletName]);

  const handleLanguageChange = (lang) => {
    if (lang === 'ar') {
      // Show warning modal for Arabic - feature coming soon
      setShowArabicWarning(true);
      setIsLanguageModalOpen(false);
    } else {
      i18n.changeLanguage(lang);
      updateUserData({ language: lang });
      setIsLanguageModalOpen(false);
    }
  };

  const handleCurrencyChange = (cur) => {
    updateUserData({ currency: cur });
    setIsCurrencyModalOpen(false);
  };

  const handleWalletNameSave = () => {
    updateUserData({ walletName: walletNameInput });
    setIsEditingWalletName(false);
  };

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    try {
      // Import Firebase signOut
      const { signOut } = await import('../utils/firebaseAuth');
      await signOut();
    } catch (e) {
      console.error("Failed to sign out", e);
    }
    // Reset user data
    resetUserData();
    navigate('/');
  };

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'OMR', symbol: 'OMR', name: 'Omani Rial' },
    { code: 'EUR', symbol: 'EUR', name: 'Euro' },
    { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal' }
  ];
  
    const navigationItems = [
    { id: 'dashboard', label: t('dashboard.navigation.dashboard'), icon: Home },
    { id: 'transactions', label: t('dashboard.navigation.transactions'), icon: Wallet },
    { id: 'analytics', label: t('dashboard.navigation.analytics'), icon: TrendingUp },
    { id: 'budgets', label: t('dashboard.navigation.budgets'), icon: PieChart },
    { id: 'notifications', label: t('dashboard.navigation.notifications'), icon: Bell },
    { id: 'settings', label: t('dashboard.navigation.settings'), icon: Settings }
    ];

  // Show "Coming soon" message if user prefers Arabic
  const showComingSoon = userData.language === 'ar';
  
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#ddb4b3]/10 to-[#2b5f76]/5 overflow-x-hidden">
      {/* Sidebar – Always LTR */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col" style={{ direction: 'ltr' }}>
          <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-6 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-[#2b5f76] to-[#143052] rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <h1 className="ml-3 font-clash font-bold text-2xl text-[#0d121a]">
                {userData.walletName || 'Wally'}
              </h1>
            </div>
  
            <nav className="flex-1 px-3 space-y-1">
            {navigationItems.map(item => {
                const Icon = item.icon;
              const active = activeTab === item.id;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full group flex items-center px-3 py-3 text-sm font-satoshi font-medium rounded-xl transition-all duration-300 ${
                    active
                        ? 'bg-gradient-to-r from-[#2b5f76] to-[#143052] text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-[#2b5f76]'
                    }`}
                  >
                  <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${active ? 'text-white' : 'text-gray-400 group-hover:text-[#2b5f76]'}`} />
                    {item.label}
                  </motion.button>
                );
              })}
            </nav>
          </div>
        </aside>
  
      {/* Main Content */}
        <div className="lg:pl-64 flex flex-col min-h-screen w-full max-w-full overflow-x-hidden">
          {/* Top Bar - Visible on all screen sizes */}
          <div className="flex sticky top-0 z-20 flex-shrink-0 h-16 bg-white border-b border-gray-200 w-full max-w-full overflow-x-hidden">
            <div className="flex-1 px-4 sm:px-6 lg:px-8 flex justify-between items-center w-full max-w-full min-w-0">
            <h2 className="hidden lg:block font-clash font-bold text-2xl text-[#0d121a] capitalize truncate min-w-0">
              {t(`dashboard.navigation.${activeTab}`)}
            </h2>
            <h2 className="lg:hidden font-clash font-bold text-xl text-[#0d121a] capitalize truncate min-w-0">
              {userData.walletName || 'Wally'}
            </h2>
              <div className="flex items-center gap-3 lg:gap-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                onClick={() => setActiveTab('notifications')}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-300 relative"
                >
                  <Bell className="w-5 h-5 text-gray-700" />
                  {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#dd573c] rounded-full"></span>
                  )}
                </motion.button>
                <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-gray-200">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setActiveTab('settings')}
                  className="w-10 h-10 bg-gradient-to-br from-[#2b5f76] to-[#143052] rounded-full flex items-center justify-center cursor-pointer">
                    <User className="w-5 h-5 text-white" />
                  </motion.button>
                </div>
                {/* Mobile Settings Button */}
                <motion.button 
                  whileHover={{ scale: 1.1 }} 
                  whileTap={{ scale: 0.9 }} 
                  onClick={() => setActiveTab('settings')}
                  className="lg:hidden w-10 h-10 bg-gradient-to-br from-[#2b5f76] to-[#143052] rounded-full flex items-center justify-center cursor-pointer"
                >
                  <User className="w-5 h-5 text-white" />
                </motion.button>
              </div>
            </div>
          </div>
  
          <main className="flex-1 lg:mt-0 pb-20 lg:pb-0 overflow-y-auto overflow-x-hidden w-full max-w-full">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="py-6 px-4 sm:px-6 lg:px-8 w-full max-w-full"
            >
            {showComingSoon && (
              <div className="bg-gradient-to-r from-[#2b5f76] to-[#143052] rounded-2xl p-6 mb-6 border border-gray-100 shadow-md">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-clash font-bold text-xl text-white mb-1">Arabic Translation Coming Soon</h3>
                    <p className="font-satoshi text-white/90 text-sm">The dashboard is currently available in English. Arabic support is coming soon!</p>
                  </div>
                </div>
              </div>
            )}
              {activeTab === 'dashboard' && (
                <div className="space-y-6 w-full max-w-full overflow-x-hidden">
                  <div className="flex justify-between items-center mb-4 lg:hidden">
                    <h2 className="font-clash font-bold text-2xl text-[#0d121a] capitalize">{t('dashboard.navigation.dashboard')}</h2>
                  </div>
  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-full">
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#2b5f76] to-[#143052] rounded-xl flex items-center justify-center">
                          <Wallet className="w-6 h-6 text-white" />
                        </div>
                        <div className="relative group">
                          <span 
                            className={`font-satoshi text-xs px-2 py-1 rounded-full cursor-help inline-flex items-center gap-1 ${getPercentageChange('balance') > 0 ? 'text-green-600 bg-green-50' : getPercentageChange('balance') < 0 ? 'text-red-600 bg-red-50' : 'text-gray-600 bg-gray-50'}`}
                          >
                          {getPercentageChange('balance') > 0 ? '+' : ''}{getPercentageChange('balance')}%
                            <Info className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </span>
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-[#0d121a] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                            {t('dashboard.balance_percentage_tooltip')}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#0d121a]"></div>
                          </div>
                        </div>
                      </div>
                      <p className="font-satoshi text-sm text-gray-600 mb-1">{t('dashboard.total_balance')}</p>
                      <p className="font-clash font-bold text-2xl text-[#0d121a]">{getTotalBalance().toLocaleString()} {userData.currency}</p>
                    </div>
  
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#03e26f] to-[#5f8662] rounded-xl flex items-center justify-center">
                          <PieChart className="w-6 h-6 text-white" />
                        </div>
                        <div className="relative group">
                          <span 
                            className={`font-satoshi text-xs px-2 py-1 rounded-full cursor-help inline-flex items-center gap-1 ${getPercentageChange('savings') > 0 ? 'text-green-600 bg-green-50' : getPercentageChange('savings') < 0 ? 'text-red-600 bg-red-50' : 'text-gray-600 bg-gray-50'}`}
                          >
                            {getPercentageChange('savings') > 0 ? '+' : ''}{getPercentageChange('savings')}%
                            <Info className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </span>
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-[#0d121a] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                            {t('dashboard.savings_percentage_tooltip')}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#0d121a]"></div>
                          </div>
                        </div>
                      </div>
                      <p className="font-satoshi text-sm text-gray-600 mb-1">{t('dashboard.savings')}</p>
                      <p className="font-clash font-bold text-2xl text-green-600">{getSavings().toLocaleString()} {userData.currency}</p>
                    </div>
  
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#c6be4d] to-[#dbf22c] rounded-xl flex items-center justify-center">
                          <Wallet className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <p className="font-satoshi text-sm text-gray-600 mb-1">{t('dashboard.transactions')}</p>
                      <p className="font-clash font-bold text-2xl text-[#0d121a]">{getTransactionCount()}</p>
                    </div>
                  </div>
  
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-clash font-bold text-xl text-[#0d121a]">{t('dashboard.recent_activity')}</h3>
                    </div>
                    <div className="space-y-4">
                      {transactions.length > 0 ? (
                        transactions.slice(0, 5).map((tx, i) => (
                          <motion.div
                            key={String(tx.id || `temp-${i}`)}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.1 }}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300"
                          >
                            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#2b5f76] to-[#143052] rounded-lg flex items-center justify-center flex-shrink-0">
                                <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-satoshi font-semibold text-xs sm:text-sm text-[#0d121a] truncate">{tx.description}</p>
                                <p className="font-satoshi text-[10px] sm:text-xs text-gray-600 truncate">
                                  {tx.category}<br />
                                  {new Date(tx.date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                                </p>
                              </div>
                            </div>
                            <p className={`font-clash font-bold text-xs sm:text-base flex-shrink-0 ml-2 sm:ml-4 ${tx.type === 'expense' ? 'text-[#dd573c]' : 'text-[#03e26f]'}`}>
                              {tx.type === 'expense' ? '-' : '+'}{tx.amount.toLocaleString()} {userData.currency}
                            </p>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Wallet className="w-8 h-8 text-white" />
                          </div>
                          <p className="font-satoshi text-gray-600">{t('dashboard.no_transactions')}</p>
                        </div>
                      )}
                      {transactions.length > 0 && (
                        <motion.button
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                          onClick={() => setActiveTab('transactions')}
                          className="w-full mt-4 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-[#D97843] to-[#ab3412] text-white font-satoshi font-semibold rounded-xl shadow-md"
                        >
                          <Wallet className="w-5 h-5" />
                          {t('dashboard.view_all_transactions')}
                        </motion.button>
                      )}
                    </div>
                  </div>
  
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('analytics')}
                    className="w-full mt-4 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-[#2b5f76] to-[#143052] text-white font-satoshi font-semibold rounded-xl shadow-md"
                  >
                    <TrendingUp className="w-5 h-5" />
                    {t('dashboard.view_full_analytics')}
                  </motion.button>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div>
                  <div className="flex justify-between items-center mb-4 lg:hidden">
                    <h2 className="font-clash font-bold text-2xl text-[#0d121a] capitalize">{t('dashboard.navigation.analytics')}</h2>
                  </div>
                <Analytics transactions={transactions} userData={userData} />
                </div>
              )}
              {activeTab === 'budgets' && (
                      <div>
                  <div className="flex justify-between items-center mb-4 lg:hidden">
                    <h2 className="font-clash font-bold text-2xl text-[#0d121a] capitalize">{t('dashboard.navigation.budgets')}</h2>
                      </div>
                  <Budgets transactions={transactions} userData={userData} />
                    </div>
              )}
              {activeTab === 'notifications' && (
                          <div>
                  <div className="flex justify-between items-center mb-4 lg:hidden">
                    <h2 className="font-clash font-bold text-2xl text-[#0d121a] capitalize">{t('dashboard.navigation.notifications')}</h2>
                  </div>
                  <Notifications userData={userData} />
                </div>
              )}
              {activeTab === 'transactions' && (
                <Transactions
                  transactions={transactions}
                  userData={userData}
                  onAddTransaction={handleAddTransaction}
                  onEditTransaction={handleEditTransaction}
                  onDeleteTransaction={confirmDelete}
                  transactionToEdit={transactionToEdit}
                  setTransactionToEdit={setTransactionToEdit}
                  setIsModalOpen={setIsModalOpen}
                  handleDelete={handleDelete}
                  isDeleteModalOpen={isDeleteModalOpen}
                  setIsDeleteModalOpen={setIsDeleteModalOpen}
                  transactionToDelete={transactionToDelete}
                  setTransactionToDelete={setTransactionToDelete}
                  isVisible={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  isTransactionPage={true}
                />
              )}
  
              {activeTab === 'settings' && (
                <div>
                  <div className="flex justify-between items-center mb-4 lg:hidden">
                    <h2 className="font-clash font-bold text-2xl text-[#0d121a] capitalize">{t('dashboard.navigation.settings')}</h2>
                  </div>
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-md">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#2b5f76] to-[#143052] rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h4 className="font-clash font-semibold text-lg text-[#0d121a]">{t('dashboard.settings.profile')}</h4>
                        <p className="font-satoshi text-gray-600">{t('dashboard.settings.manage_account')}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="w-full p-4 rounded-xl border border-gray-200 hover:border-[#2b5f76] hover:bg-gray-50 transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-satoshi font-semibold text-[#0d121a] mb-2">{t('dashboard.settings.wallet_name')}</p>
                            {isEditingWalletName ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={walletNameInput}
                                  onChange={e => setWalletNameInput(e.target.value)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') handleWalletNameSave();
                                    else if (e.key === 'Escape') { setIsEditingWalletName(false); setWalletNameInput(userData.walletName || ''); }
                                  }}
                                  autoFocus
                                  className="flex-1 px-3 py-2 rounded-lg border-2 border-[#2b5f76] focus:outline-none font-satoshi"
                                  placeholder={t('dashboard.settings.enter_wallet_name')}
                                />
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleWalletNameSave}
                                  className="px-4 py-2 bg-[#2b5f76] text-white font-satoshi font-semibold rounded-lg hover:bg-[#143052] transition-colors">
                                  {t('dashboard.settings.save')}
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                  onClick={() => { setIsEditingWalletName(false); setWalletNameInput(userData.walletName || ''); }}
                                  className="px-4 py-2 bg-gray-200 text-gray-700 font-satoshi font-semibold rounded-lg hover:bg-gray-300 transition-colors">
                                  {t('dashboard.settings.cancel')}
                                </motion.button>
                              </div>
                            ) : (
                              <p className="font-satoshi text-sm text-gray-600">{userData.walletName || 'Wally'}</p>
                            )}
                          </div>
                          {!isEditingWalletName && (
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setIsEditingWalletName(true)}
                              className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                              <Settings className="w-5 h-5 text-gray-400" />
                            </motion.button>
                          )}
                        </div>
                      </div>

                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsCurrencyModalOpen(true)}
                        className="w-full p-4 rounded-xl border border-gray-200 hover:border-[#2b5f76] hover:bg-gray-50 transition-all duration-300 text-left">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-satoshi font-semibold text-[#0d121a]">{t('dashboard.settings.currency')}</p>
                            <p className="font-satoshi text-sm text-gray-600">{t('dashboard.settings.change_currency')}</p>
                          </div>
                          <span className="font-satoshi font-semibold text-[#2b5f76]">{userData.currency}</span>
                        </div>
                      </motion.button>

                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsLanguageModalOpen(true)}
                        className="w-full p-4 rounded-xl border border-gray-200 hover:border-[#2b5f76] hover:bg-gray-50 transition-all duration-300 text-left">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-satoshi font-semibold text-[#0d121a]">{t('dashboard.settings.language')}</p>
                            <p className="font-satoshi text-sm text-gray-600">{t('dashboard.settings.select_language')}</p>
                          </div>
                          <Globe className="w-5 h-5 text-gray-400" />
                        </div>
                      </motion.button>
                    </div>

                    <div className="pt-6 border-t border-gray-200">
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowLogoutModal(true)}
                        className="w-full group flex items-center justify-center gap-3 px-6 py-4 bg-red-50 border-2 border-red-200 text-red-600 font-satoshi font-semibold rounded-xl">
                        <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        {t('dashboard.settings.logout')}
                      </motion.button>
                    </div>
                  </div>

                  {/* Currency Modal */}
                  {isCurrencyModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setIsCurrencyModalOpen(false)}>
                      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
                        <h3 className="font-clash font-bold text-2xl text-[#0d121a] mb-6">{t('dashboard.settings.currency')}</h3>
                        <div className="space-y-3">
                          {currencies.map(currency => (
                            <motion.button key={currency.code} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleCurrencyChange(currency.code)}
                              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${userData.currency === currency.code ? 'border-[#2b5f76] bg-[#2b5f76]/5' : 'border-gray-200 hover:border-[#2b5f76]/50'}`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-clash font-semibold text-[#0d121a]">{currency.name}</p>
                                  <p className="font-satoshi text-sm text-gray-600">{currency.code}</p>
                                </div>
                                <span className="font-satoshi font-bold text-[#2b5f76] text-xl">{currency.symbol}</span>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Language Modal */}
                  {isLanguageModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setIsLanguageModalOpen(false)}>
                      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
                        <h3 className="font-clash font-bold text-2xl text-[#0d121a] mb-6">{t('dashboard.settings.language')}</h3>
                        <div className="space-y-3">
                          {[
                            { code: 'en', name: 'English', label: t('navbar.english') },
                            { code: 'ar', name: 'العربية', label: t('navbar.arabic'), disabled: true }
                          ].map(lang => (
                            <motion.button 
                              key={lang.code} 
                              whileHover={lang.disabled ? {} : { scale: 1.02 }} 
                              whileTap={lang.disabled ? {} : { scale: 0.98 }} 
                              onClick={() => handleLanguageChange(lang.code)}
                              disabled={lang.disabled}
                              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                                lang.disabled 
                                  ? 'border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed' 
                                  : (userData.language || 'en') === lang.code 
                                    ? 'border-[#2b5f76] bg-[#2b5f76]/5' 
                                    : 'border-gray-200 hover:border-[#2b5f76]/50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-clash font-semibold text-[#0d121a]">{lang.name}</p>
                                    {lang.disabled && (
                                      <span className="px-2 py-0.5 bg-[#dd573c]/10 text-[#dd573c] text-xs font-satoshi font-semibold rounded-full">
                                        Coming Soon
                                      </span>
                                    )}
                                  </div>
                                  <p className="font-satoshi text-sm text-gray-600">{lang.label}</p>
                                </div>
                                {(userData.language || 'en') === lang.code && !lang.disabled && (
                                  <div className="w-6 h-6 bg-[#2b5f76] rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  </div>
                                )}
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Arabic Warning Modal */}
                  {showArabicWarning && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowArabicWarning(false)}>
                      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
                        <div className="text-center mb-6">
                          <div className="w-16 h-16 bg-[#2b5f76]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Globe className="w-8 h-8 text-[#2b5f76]" />
                          </div>
                          <h3 className="font-clash font-bold text-2xl text-[#0d121a] mb-2">Arabic Translation Coming Soon</h3>
                          <p className="font-satoshi text-gray-600">
                            The dashboard is currently available in English only. Arabic support will be available soon. We appreciate your patience!
                          </p>
                        </div>
                        <motion.button 
                          whileHover={{ scale: 1.05 }} 
                          whileTap={{ scale: 0.95 }} 
                          onClick={() => setShowArabicWarning(false)}
                          className="w-full px-4 py-3 bg-[#2b5f76] text-white font-clash font-semibold rounded-xl hover:bg-[#143052] transition-colors"
                        >
                          Got it
                        </motion.button>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Logout Confirmation Modal */}
                  {showLogoutModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowLogoutModal(false)}>
                      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
                        <div className="text-center mb-6">
                          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <LogOut className="w-8 h-8 text-red-600" />
                          </div>
                          <h3 className="font-clash font-bold text-2xl text-[#0d121a] mb-2">{t('dashboard.settings.logout_confirm.title')}</h3>
                          <p className="font-satoshi text-gray-600">
                            {t('dashboard.settings.logout_confirm.message')}
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <motion.button 
                            whileHover={{ scale: 1.05 }} 
                            whileTap={{ scale: 0.95 }} 
                            onClick={() => setShowLogoutModal(false)}
                            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-clash font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                          >
                            {t('dashboard.settings.logout_confirm.cancel')}
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.05 }} 
                            whileTap={{ scale: 0.95 }} 
                            onClick={handleLogout}
                            className="flex-1 px-4 py-3 bg-red-600 text-white font-clash font-semibold rounded-xl hover:bg-red-700 transition-colors"
                          >
                            {t('dashboard.settings.logout_confirm.confirm')}
                          </motion.button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </div>
                </div>
              )}
            </motion.div>
          </main>
  
        {/* Mobile Bottom Nav */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg pb-safe w-full max-w-full overflow-x-hidden">
            <div className="grid grid-cols-5 gap-1 px-3 py-2 w-full max-w-full">
            {navigationItems.filter(item => item.id !== 'notifications').map(item => {
                const Icon = item.icon;
              const active = activeTab === item.id;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    whileHover={{ y: -2 }}
                  animate={{ y: active ? -4 : 0, backgroundColor: active ? '#2b5f76' : '#ffffff', color: active ? '#ffffff' : '#4b5563' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={`flex flex-col items-center justify-center py-3 px-2 rounded-lg ${active ? 'text-white' : 'text-gray-600 hover:text-[#2b5f76] hover:bg-gray-50'}`}
                  >
                  <Icon className={`h-6 w-6 mb-1 ${active ? 'text-white' : 'text-gray-500'}`} />
                  <span className="font-satoshi text-xs font-semibold">
                    {item.label}
                  </span>
                  </motion.button>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    );
  }

export default Dashboard;
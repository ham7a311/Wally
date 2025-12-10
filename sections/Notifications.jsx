import { useState, useEffect, useMemo } from 'react';
import { Bell, Check, TrendingUp, Wallet, PieChart, AlertCircle, Info, X } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

function Notifications({ userData = { currency: 'OMR' } }) {
  // userData is available for future use (e.g., currency, language)
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('notifications');
      if (saved) return JSON.parse(saved);
      
      // Default notifications with user's currency
      const defaultCurrency = userData?.currency || 'OMR';
      return [
        {
          id: '1',
          type: 'budget',
          title: 'Budget Exceeded',
          description: 'Your Food and Dining budget has exceeded 100%',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read: false,
          icon: '🚨'
        },
        {
          id: '2',
          type: 'transaction',
          title: 'New Transaction Added',
          description: `Expense of 45.00 ${defaultCurrency} for Coffee at Starbucks`,
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          read: false,
          icon: '💳'
        },
        {
          id: '3',
          type: 'budget',
          title: 'Approaching Budget Limit',
          description: 'Transport budget is at 85% - only 15% remaining',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          read: true,
          icon: '⚠️'
        },
        {
          id: '4',
          type: 'system',
          title: 'Weekly Summary Ready',
          description: 'Your financial summary for the week is ready to view',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          read: true,
          icon: '📊'
        },
        {
          id: '5',
          type: 'transaction',
          title: 'Large Income Recorded',
          description: `Income of 1,500.00 ${defaultCurrency} from Salary`,
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          read: true,
          icon: '💰'
        }
      ];
    } catch (e) {
      console.error("Failed to parse notifications from localStorage", e);
      return [];
    }
  });

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (e) {
      console.error("Failed to save notifications to localStorage", e);
    }
  }, [notifications]);

  // Filter notifications by tab
  const filteredNotifications = useMemo(() => {
    if (activeTab === 'all') return notifications;
    return notifications.filter(n => n.type === activeTab);
  }, [notifications, activeTab]);

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // Mark single notification as read
  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  // Delete notification
  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMs = now - notificationTime;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return notificationTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Get icon component based on type
  const getIconComponent = (type) => {
    switch (type) {
      case 'budget':
        return <PieChart className="w-5 h-5 text-white" />;
      case 'transaction':
        return <Wallet className="w-5 h-5 text-white" />;
      case 'system':
        return <Info className="w-5 h-5 text-white" />;
      default:
        return <Bell className="w-5 h-5 text-white" />;
    }
  };

  // Get color based on type
  const getTypeColor = (type) => {
    switch (type) {
      case 'budget':
        return 'from-[#c6be4d] to-[#dbf22c]';
      case 'transaction':
        return 'from-[#2b5f76] to-[#143052]';
      case 'system':
        return 'from-[#03e26f] to-[#5f8662]';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const tabs = [
    { id: 'all', label: 'All', icon: Bell },
    { id: 'budget', label: 'Budgets', icon: PieChart },
    { id: 'transaction', label: 'Transactions', icon: Wallet },
    { id: 'system', label: 'System', icon: Info }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-clash font-bold text-2xl text-[#0d121a] mb-1">Notifications</h2>
          <p className="font-satoshi text-sm text-gray-600">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'You\'re all caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-[#2b5f76] text-white font-satoshi font-semibold rounded-xl hover:bg-[#143052] transition-colors"
          >
            <Check className="w-4 h-4" />
            Mark all as read
          </motion.button>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl p-2 border border-gray-100 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-satoshi font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#2b5f76] to-[#143052] text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all duration-300 ${
                  notification.read ? 'border-gray-100' : 'border-[#2b5f76] bg-[#2b5f76]/5'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 bg-gradient-to-br ${getTypeColor(notification.type)} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    {notification.icon ? (
                      <span className="text-2xl">{notification.icon}</span>
                    ) : (
                      getIconComponent(notification.type)
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h4 className={`font-clash font-semibold text-base text-[#0d121a] ${!notification.read ? 'font-bold' : ''}`}>
                        {notification.title}
                      </h4>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.read && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => markAsRead(notification.id)}
                            className="p-1.5 rounded-full bg-[#2b5f76]/10 hover:bg-[#2b5f76]/20 transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4 text-[#2b5f76]" />
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1.5 rounded-full hover:bg-red-50 transition-colors"
                          title="Delete notification"
                        >
                          <X className="w-4 h-4 text-gray-400 hover:text-red-600" />
                        </motion.button>
                      </div>
                    </div>
                    <p className="font-satoshi text-sm text-gray-600 mb-2">
                      {notification.description}
                    </p>
                    <p className="font-satoshi text-xs text-gray-500">
                      {formatTimestamp(notification.timestamp)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="font-clash font-bold text-xl text-[#0d121a] mb-2">
                {activeTab === 'all' ? 'You\'re all caught up!' : `No ${activeTab} notifications`}
              </h3>
              <p className="font-satoshi text-gray-600">
                {activeTab === 'all' 
                  ? 'There are no notifications at the moment.' 
                  : `You don't have any ${activeTab} notifications right now.`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info Card */}
      {notifications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-[#2b5f76]/10 to-[#03e26f]/10 rounded-2xl p-6 border-2 border-[#2b5f76]/20"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#2b5f76] to-[#143052] rounded-xl flex items-center justify-center flex-shrink-0">
              <Info className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-clash font-bold text-lg text-[#0d121a] mb-2">About Notifications</h4>
              <p className="font-satoshi text-sm text-gray-700 leading-relaxed">
                Stay on top of your finances with real-time updates. You'll receive notifications when budgets are exceeded, 
                transactions are added, and weekly summaries are ready. Manage your notification preferences in Settings.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default Notifications;
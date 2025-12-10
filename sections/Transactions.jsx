import { useState, useEffect } from 'react';
import { Plus, X, Search, Filter, Wallet, Pen, Trash2 } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Transactions = ({ 
    isVisible, 
    onClose, 
    userData, 
    onAddTransaction, 
    onEditTransaction, 
    onDeleteTransaction, 
    transactionToEdit, 
    isDeleteModalOpen, 
    setIsDeleteModalOpen, 
    transactionToDelete, 
    setTransactionToDelete, 
    transactions, 
    setTransactionToEdit, 
    setIsModalOpen, 
    handleDelete,
    isTransactionPage 
  }) => {
  const { t, i18n } = useTranslation();
  
  // Force English in dashboard - Arabic coming soon
  useEffect(() => {
    if (i18n.language === 'ar') {
      i18n.changeLanguage('en');
    }
  }, [i18n]);

    const [isLocalModalOpen, setIsLocalModalOpen] = useState(false);
    const [amount, setAmount] = useState(transactionToEdit?.amount?.toString() || '');
  const [transactionType, setTransactionType] = useState(transactionToEdit?.type || 'expense');
  const [description, setDescription] = useState(transactionToEdit?.description || '');
  const [category, setCategory] = useState(transactionToEdit?.category || '');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterType, setFilterType] = useState('');
  
    const categories = {
      expense: ['Food and Dining', 'Subscriptions', 'Transport', 'Utilities', 'Entertainment'],
    income: ['Salary', 'Freelance', 'Investments', 'Gifts', 'Other']
    };
  
    useEffect(() => {
      if (transactionToEdit) {
        setTransactionType(transactionToEdit.type);
        setAmount(transactionToEdit.amount?.toString() || '');
        setDescription(transactionToEdit.description);
        setCategory(transactionToEdit.category || '');
        setIsLocalModalOpen(true); 
      } else {
        setTransactionType('expense');
      setAmount(''); setDescription(''); setCategory('');
        if (isTransactionPage) setIsLocalModalOpen(false);
      }
    }, [transactionToEdit, isTransactionPage]);
  
  const isModalVisible = isVisible || isLocalModalOpen || !!transactionToEdit;
  
  const closeModal = () => {
    if (transactionToEdit) { setTransactionToEdit(null); setIsModalOpen(false); }
      setIsLocalModalOpen(false); 
      if (onClose) onClose(); 
    };
    
    const handleAmountChange = (e) => {
    const v = e.target.value;
    if (v === '' || /^\d*\.?\d*$/.test(v)) setAmount(v);
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
    if (!amount || isNaN(+amount) || +amount <= 0) return;
  
    const data = {
      id: transactionToEdit ? String(transactionToEdit.id) : String(Date.now()),
        type: transactionType,
        amount: parseFloat(amount),
      description,
      category,
        currency: userData.currency,
      date: transactionToEdit ? transactionToEdit.date : new Date().toISOString()
    };

    transactionToEdit ? onEditTransaction(data) : onAddTransaction(data);
    setAmount(''); setDescription(''); setCategory(''); setTransactionType('expense');
    closeModal();
    };
  
    const confirmDelete = () => {
    if (transactionToDelete) onDeleteTransaction();
      setIsDeleteModalOpen(false);
      setTransactionToDelete(null);
    };
  
  const filtered = transactions.filter(tx => {
    const matchSearch = tx.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCategory ? tx.category === filterCategory : true;
    const matchType = filterType ? tx.type === filterType : true;
    return matchSearch && matchCat && matchType;
    });
  
  const allCats = [...new Set([...categories.expense, ...categories.income])];
  
    return (
      <AnimatePresence>
        {isModalVisible && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white/80 via-[#ddb4b3]/10 to-[#2b5f76]/5 backdrop-blur-md">
          <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }} className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md mx-4 border border-gray-100 shadow-xl">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-clash font-bold text-xl text-[#0d121a]">
                  {transactionToEdit ? t('transactions.edit_transaction') : t('transactions.add_transaction')}
                </h3>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={closeModal} className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                  <X className="w-5 h-5 text-gray-600" />
                </motion.button>
              </div>
  
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex bg-gray-100 rounded-xl p-1">
                  <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-satoshi font-medium text-sm transition-colors duration-200 ${transactionType === 'expense' ? 'bg-[#dd573c] text-white shadow-sm' : 'text-gray-700 hover:bg-gray-200'}`}
                    onClick={() => setTransactionType('expense')}>
                    {t('transactions.expense')}
                  </motion.button>
                  <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-satoshi font-medium text-sm transition-colors duration-200 ${transactionType === 'income' ? 'bg-[#03e26f] text-white shadow-sm' : 'text-gray-700 hover:bg-gray-200'}`}
                    onClick={() => setTransactionType('income')}>
                    {t('transactions.income')}
                  </motion.button>
                </div>
  
                <div>
                  <label className="block text-sm font-satoshi font-medium text-gray-700 mb-1.5">
                    {t('budgets.amount')} ({userData.currency})
                  </label>
                  <input type="text" inputMode="decimal" value={amount} onChange={handleAmountChange} required placeholder="0.00"
                    className="w-full p-4 rounded-xl border-2 font-satoshi text-gray-700 focus:outline-none transition-colors duration-300 border-gray-200 focus:border-[#2b5f76]" />
                </div>
  
                <div>
                  <label className="block text-sm font-satoshi font-medium text-gray-700 mb-1.5">{t('transactions.description')}</label>
                  <input type="text" value={description} onChange={e => setDescription(e.target.value)} required placeholder="e.g. Coffee at Starbucks"
                    className="w-full p-4 rounded-xl border-2 font-satoshi text-gray-700 focus:outline-none transition-colors duration-300 border-gray-200 focus:border-[#2b5f76]" />
                </div>
  
                <div>
                  <label className="block text-sm font-satoshi font-medium text-gray-700 mb-1.5">{t('budgets.category')}</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} required
                    className="w-full p-4 rounded-xl border-2 font-satoshi text-gray-700 focus:outline-none transition-colors duration-300 border-gray-200 focus:border-[#2b5f76]">
                    <option value="" disabled>{t('transactions.all_categories')}</option>
                    {categories[transactionType].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
  
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 font-satoshi font-medium text-white rounded-lg transition-all duration-200 hover:shadow-md"
                  style={{ background: transactionType === 'expense' ? 'linear-gradient(to right, #dd573c, #ab3412)' : 'linear-gradient(to right, #03e26f, #5f8662)' }}>
                  <Plus className="w-4 h-4" />
                  {transactionToEdit ? t('budgets.save_changes') : t('transactions.add_transaction')}
                </motion.button>
              </form>
            </div>
            </motion.div>
          </motion.div>
        )}
  
        {isDeleteModalOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-60 flex items-center justify-center bg-black/50">
          <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }} className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 border border-gray-100 shadow-xl">
            <div>
              <h3 className="font-clash font-bold text-lg text-[#0d121a] mb-4">{t('transactions.delete_transaction')}</h3>
              <p className="font-satoshi text-gray-600 mb-6">{t('transactions.are_you_sure_delete_transaction')}</p>
              <div className="flex gap-3 justify-end">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 font-satoshi font-medium text-gray-600 rounded-lg hover:bg-gray-100">
                  {t('dashboard.settings.cancel')}
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={confirmDelete}
                  className="px-4 py-2 font-satoshi font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">
                  {t('transactions.delete_transaction')}
                </motion.button>
              </div>
            </div>
            </motion.div>
          </motion.div>
        )}
  
        {transactions && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-clash font-bold text-xl text-[#0d121a]">{t('dashboard.transactions')}</h3>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                onClick={() => { setTransactionToEdit(null); setIsLocalModalOpen(true); }}
                className="p-2.5 rounded-lg bg-gradient-to-r from-[#2b5f76] to-[#143052] text-white shadow-sm flex items-center gap-1.5 font-satoshi font-medium text-sm">
                <Plus className="w-4 h-4" />
                {t('transactions.add_transaction')}
              </motion.button>
            </div>
  
            <div className="mb-6 space-y-4">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input type="text" placeholder={t('transactions.search')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#2b5f76] font-satoshi text-gray-700" />
              </div>
              <div className="flex gap-4">
                <select value={filterType} onChange={e => setFilterType(e.target.value)}
                  className="w-full p-2 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#2b5f76] font-satoshi text-gray-700">
                  <option value="">{t('transactions.all_types')}</option>
                  <option value="income">{t('transactions.income')}</option>
                  <option value="expense">{t('transactions.expense')}</option>
                </select>
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                  className="w-full p-2 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#2b5f76] font-satoshi text-gray-700">
                  <option value="">{t('transactions.all_categories')}</option>
                  {allCats.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
  
            <div className="space-y-4">
              {filtered.length > 0 ? (
                filtered.map((tx, i) => (
                  <motion.div key={String(tx.id || `temp-${i}`)} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300">
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
                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 ml-2 sm:ml-4">
                      <p className={`font-clash font-bold text-xs sm:text-base ${tx.type === 'expense' ? 'text-[#dd573c]' : 'text-[#03e26f]'}`}>
                        {tx.type === 'expense' ? '-' : '+'}{tx.amount.toLocaleString()} {userData.currency}
                      </p>
                      <div className="flex gap-2">
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { setTransactionToEdit(tx); setIsModalOpen(true); }}
                          className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200" aria-label={t('transactions.edit_transaction')}>
                          <Pen className="w-4 h-4 text-gray-600" />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(tx)}
                          className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200" aria-label={t('transactions.delete_transaction')}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wallet className="w-8 h-8 text-white" />
                  </div>
                  <p className="font-satoshi text-gray-600">{t('transactions.no_transactions')}</p>
                </div>
              )}
            </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    );
  };

export default Transactions;
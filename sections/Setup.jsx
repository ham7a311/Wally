import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check, Target, ShoppingCart, CreditCard, Bell, DollarSign, Link, PiggyBank, Wallet } from 'lucide-react';
import { useUser } from '../hooks/useUser';

function Setup() {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState({
    goal: '',
    spendingFrequency: 5,
    categories: [],
    summaries: '',
    currency: 'OMR',
    income: '',
    savingGoal: '',
    savingGoalAmount: '',
    hasRecentTransaction: '',
    recentActivityAmount: '',
    recentActivityDescription: '',
    walletName: ''
  });

  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const { updateUserData, userData } = useUser();
  const totalSteps = 11;

  const questions = {
    1: {
      title: "Hey 👋, what's your main goal with Wally?",
      subtitle: "This helps us personalize your experience",
      type: "multiple-choice",
      options: [
        { value: "save", label: "Save more money", icon: PiggyBank, color: "from-[#03e26f] to-[#5f8662]" },
        { value: "track", label: "Track expenses", icon: Target, color: "from-[#2b5f76] to-[#143052]" },
        { value: "bills", label: "Manage bills", icon: CreditCard, color: "from-[#dd573c] to-[#ab3412]" },
        { value: "budget", label: "Build a budget", icon: Wallet, color: "from-[#c6be4d] to-[#dbf22c]" }
      ]
    },
    2: {
      title: "How often do you spend money daily?",
      subtitle: "Help us understand your spending habits",
      type: "slider",
      min: 1,
      max: 10
    },
    3: {
      title: "What categories do you spend most on?",
      subtitle: "Select all that apply",
      type: "multi-select",
      options: [
        { value: "food", label: "Food & Dining" },
        { value: "shopping", label: "Shopping" },
        { value: "transport", label: "Transport" },
        { value: "subscriptions", label: "Subscriptions" },
        { value: "utilities", label: "Utilities" },
        { value: "entertainment", label: "Entertainment" }
      ]
    },
    4: {
      title: "Would you like spending summaries?",
      subtitle: "Stay on top of your finances with regular updates",
      type: "multiple-choice",
      options: [
        { value: "daily", label: "Daily summaries", icon: Bell },
        { value: "weekly", label: "Weekly summaries", icon: Bell },
        { value: "none", label: "No summaries", icon: Bell }
      ]
    },
    5: {
      title: "What's your monthly income?",
      subtitle: "Enter your monthly salary amount",
      type: "number-input",
      placeholder: "e.g., 1500"
    },
    6: {
      title: "How much do you want to save monthly?",
      subtitle: "Enter your target savings amount",
      type: "number-input",
      placeholder: "e.g., 200"
    },
    7: {
      title: "Add a recent transaction",
      subtitle: "Tell us about a recent expense or income",
      type: "activity-input"
    },
    8: {
      title: "Name your wallet or account",
      subtitle: "Give it a personal touch",
      type: "text-input",
      placeholder: "e.g., My Main Wallet, Personal Budget..."
    },
    9: {
      title: "All set! 🎉",
      subtitle: "You're ready to take control of your finances",
      type: "completion"
    }
  };

  const handleNext = () => {
    // Validate current step before proceeding
    if (currentStep === 8 && answers.savingGoal === 'no') {
      // Skip saving goal amount validation if user chose "no"
      setCurrentStep(currentStep + 1);
      return;
    }
    
    if (!validateCurrentStep()) {
      return;
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save user data to context when setup is completed
      updateUserData(answers);
      navigate('/dashboard');
    }
  };

  const getFieldNameForStep = (step) => {
    const fieldMap = {
      1: 'goal',
      2: 'spendingFrequency',
      3: 'categories',
      4: 'summaries',
      5: 'income',
      6: 'savingGoalAmount',
      7: 'recentActivity', // Special case - will handle multiple fields
      8: 'walletName'
    };
    return fieldMap[step];
  };

  const validateCurrentStep = () => {
    const fieldName = getFieldNameForStep(currentStep);
    
    // Special case for recent activity - validate based on user choice
    if (currentStep === 7) {
      const hasTransactionValid = validateInput('hasRecentTransaction', answers.hasRecentTransaction);
      
      if (answers.hasRecentTransaction === 'yes') {
        const amountValid = validateInput('recentActivityAmount', answers.recentActivityAmount);
        const descriptionValid = validateInput('recentActivityDescription', answers.recentActivityDescription);
        return hasTransactionValid && amountValid && descriptionValid;
      } else {
        return hasTransactionValid;
      }
    }
    
    const value = answers[fieldName];
    return validateInput(fieldName, value);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateInput = (field, value) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'income':
        if (!value || value.trim() === '') {
          newErrors[field] = 'Income is required';
        } else if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
          newErrors[field] = 'Please enter a valid positive number for your income';
        } else {
          delete newErrors[field];
        }
        break;
      case 'savingGoalAmount':
        if (answers.savingGoal === 'yes' && (!value || value.trim() === '')) {
          newErrors[field] = 'Saving goal amount is required';
        } else if (value && (isNaN(parseFloat(value)) || parseFloat(value) < 0)) {
          newErrors[field] = 'Please enter a valid positive number for your saving goal';
        } else {
          delete newErrors[field];
        }
        break;
      case 'hasRecentTransaction':
        if (!value) {
          newErrors[field] = 'Please select an option';
        } else {
          delete newErrors[field];
        }
        break;
      case 'recentActivityAmount':
        if (answers.hasRecentTransaction === 'yes' && (!value || value.trim() === '')) {
          newErrors[field] = 'Transaction amount is required';
        } else if (value && (isNaN(parseFloat(value)) || parseFloat(value) <= 0)) {
          newErrors[field] = 'Please enter a valid positive number for the amount';
        } else {
          delete newErrors[field];
        }
        break;
      case 'recentActivityDescription':
        if (answers.hasRecentTransaction === 'yes' && (!value || value.trim() === '')) {
          newErrors[field] = 'Transaction description is required';
        } else {
          delete newErrors[field];
        }
        break;
      case 'walletName':
        if (!value || value.trim() === '') {
          newErrors[field] = 'Wallet name is required';
        } else {
          delete newErrors[field];
        }
        break;
      case 'goal':
        if (!value) {
          newErrors[field] = 'Please select a goal';
        } else {
          delete newErrors[field];
        }
        break;
      case 'categories':
        if (!value || value.length === 0) {
          newErrors[field] = 'Please select at least one category';
        } else {
          delete newErrors[field];
        }
        break;
      case 'summaries':
        if (!value) {
          newErrors[field] = 'Please select a summary preference';
        } else {
          delete newErrors[field];
        }
        break;
      case 'savingGoal':
        if (!value) {
          newErrors[field] = 'Please select an option';
        } else {
          delete newErrors[field];
        }
        break;
      default:
        delete newErrors[field];
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAnswer = (field, value) => {
    setAnswers({ ...answers, [field]: value });
    validateInput(field, value);
  };

  const handleMultiSelect = (field, value) => {
    const current = answers[field] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setAnswers({ ...answers, [field]: updated });
  };

  const currentQuestion = questions[currentStep];
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#ddb4b3]/10 to-[#2b5f76]/5 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#03e26f]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#2b5f76]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="font-satoshi text-sm text-gray-600">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="font-satoshi text-sm font-semibold text-[#2b5f76]">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#2b5f76] to-[#03e26f] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 border border-gray-100">
          {/* Question Header */}
          <div className="text-center mb-8">
            <h2 className="font-clash font-bold text-3xl sm:text-4xl text-[#0d121a] mb-3">
              {currentQuestion.title}
            </h2>
            <p className="font-satoshi text-gray-600">
              {currentQuestion.subtitle}
            </p>
          </div>

          {/* Question Content */}
          <div className="mb-8">
            {/* Multiple Choice with Icons */}
            {currentQuestion.type === "multiple-choice" && currentQuestion.options[0]?.icon && (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentQuestion.options.map((option) => {
                    const Icon = option.icon;
                    const fieldName = getFieldNameForStep(currentStep);
                    const isSelected = answers[fieldName] === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleAnswer(fieldName, option.value)}
                        className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                          isSelected
                            ? 'border-[#2b5f76] bg-gradient-to-br from-[#2b5f76]/5 to-[#03e26f]/5 shadow-lg'
                            : 'border-gray-200 hover:border-[#2b5f76]/50 hover:shadow-md'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                          option.color ? `bg-gradient-to-br ${option.color}` : 'bg-gradient-to-br from-[#2b5f76] to-[#143052]'
                        }`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <p className="font-clash font-semibold text-lg text-[#0d121a]">{option.label}</p>
                      </button>
                    );
                  })}
                </div>
                {errors[getFieldNameForStep(currentStep)] && (
                  <p className="mt-4 text-sm text-red-600 font-satoshi">{errors[getFieldNameForStep(currentStep)]}</p>
                )}
              </div>
            )}

            {/* Simple Multiple Choice */}
            {currentQuestion.type === "multiple-choice" && !currentQuestion.options[0]?.icon && (
              <div>
                <div className="space-y-3">
                  {currentQuestion.options.map((option) => {
                    const fieldName = getFieldNameForStep(currentStep);
                    const isSelected = answers[fieldName] === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleAnswer(fieldName, option.value)}
                        className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left font-satoshi font-medium ${
                          isSelected
                            ? 'border-[#2b5f76] bg-[#2b5f76] text-white shadow-lg'
                            : 'border-gray-200 text-gray-700 hover:border-[#2b5f76]/50 hover:shadow-md'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                {errors[getFieldNameForStep(currentStep)] && (
                  <p className="mt-4 text-sm text-red-600 font-satoshi">{errors[getFieldNameForStep(currentStep)]}</p>
                )}
              </div>
            )}

            {/* Slider */}
            {currentQuestion.type === "slider" && (
              <div className="space-y-6">
                <div className="text-center">
                  <span className="font-clash font-bold text-5xl text-[#2b5f76]">
                    {answers.spendingFrequency}
                  </span>
                  <p className="font-satoshi text-sm text-gray-600 mt-2">
                    transactions per day
                  </p>
                </div>
                <input
                  type="range"
                  min={currentQuestion.min}
                  max={currentQuestion.max}
                  value={answers.spendingFrequency}
                  onChange={(e) => handleAnswer('spendingFrequency', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #2b5f76 0%, #2b5f76 ${(answers.spendingFrequency / currentQuestion.max) * 100}%, #e5e7eb ${(answers.spendingFrequency / currentQuestion.max) * 100}%, #e5e7eb 100%)`
                  }}
                />
              </div>
            )}

            {/* Multi-Select */}
            {currentQuestion.type === "multi-select" && (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {currentQuestion.options.map((option) => {
                    const isSelected = answers.categories?.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleMultiSelect('categories', option.value)}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 font-satoshi font-medium text-sm ${
                          isSelected
                            ? 'border-[#03e26f] bg-gradient-to-br from-[#03e26f]/10 to-[#5f8662]/10 text-[#0d121a] shadow-md'
                            : 'border-gray-200 text-gray-700 hover:border-[#03e26f]/50'
                        }`}
                      >
                        {option.label}
                        {isSelected && (
                          <Check className="w-4 h-4 ml-auto text-[#03e26f]" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {errors.categories && (
                  <p className="mt-4 text-sm text-red-600 font-satoshi">{errors.categories}</p>
                )}
              </div>
            )}

            {/* Dropdown */}
            {currentQuestion.type === "dropdown" && (
              <select
                value={answers.currency}
                onChange={(e) => handleAnswer('currency', e.target.value)}
                className="w-full p-4 rounded-xl border-2 border-gray-200 font-satoshi text-gray-700 focus:outline-none focus:border-[#2b5f76] transition-colors duration-300"
              >
                {currentQuestion.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}

            {/* Number Input */}
            {currentQuestion.type === "number-input" && (
              <div>
                <input
                  type="number"
                  step="0.01"
                  value={answers.income}
                  onChange={(e) => handleAnswer('income', e.target.value)}
                  placeholder={currentQuestion.placeholder}
                  className={`w-full p-4 rounded-xl border-2 font-satoshi text-gray-700 focus:outline-none transition-colors duration-300 ${
                    errors.income ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-[#2b5f76]'
                  }`}
                />
                {errors.income && (
                  <p className="mt-2 text-sm text-red-600 font-satoshi">{errors.income}</p>
                )}
              </div>
            )}

            {/* Text Input */}
            {currentQuestion.type === "text-input" && (
              <div>
                <input
                  type="text"
                  value={currentStep === 8 ? answers.savingGoalAmount : answers.walletName}
                  onChange={(e) => handleAnswer(currentStep === 8 ? 'savingGoalAmount' : 'walletName', e.target.value)}
                  placeholder={currentQuestion.placeholder}
                  className={`w-full p-4 rounded-xl border-2 font-satoshi text-gray-700 focus:outline-none transition-colors duration-300 ${
                    errors[currentStep === 8 ? 'savingGoalAmount' : 'walletName'] ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-[#2b5f76]'
                  }`}
                />
                {errors[currentStep === 8 ? 'savingGoalAmount' : 'walletName'] && (
                  <p className="mt-2 text-sm text-red-600 font-satoshi">{errors[currentStep === 8 ? 'savingGoalAmount' : 'walletName']}</p>
                )}
              </div>
            )}

            {/* Activity Input */}
            {currentQuestion.type === "activity-input" && (
              <div className="space-y-4">
                {/* First, ask if they have a recent transaction */}
                <div>
                  <label className="block font-satoshi font-semibold text-sm text-gray-700 mb-3">
                    Do you have a recent transaction to share?
                  </label>
                  <div className="space-y-3">
                    <button
                      onClick={() => handleAnswer('hasRecentTransaction', 'yes')}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left font-satoshi font-medium ${
                        answers.hasRecentTransaction === 'yes'
                          ? 'border-[#2b5f76] bg-[#2b5f76] text-white shadow-lg'
                          : 'border-gray-200 text-gray-700 hover:border-[#2b5f76]/50 hover:shadow-md'
                      }`}
                    >
                      Yes, I have a recent transaction
                    </button>
                    <button
                      onClick={() => handleAnswer('hasRecentTransaction', 'no')}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left font-satoshi font-medium ${
                        answers.hasRecentTransaction === 'no'
                          ? 'border-[#2b5f76] bg-[#2b5f76] text-white shadow-lg'
                          : 'border-gray-200 text-gray-700 hover:border-[#2b5f76]/50 hover:shadow-md'
                      }`}
                    >
                      No recent transactions
                    </button>
                  </div>
                  {errors.hasRecentTransaction && (
                    <p className="mt-2 text-sm text-red-600 font-satoshi">{errors.hasRecentTransaction}</p>
                  )}
                </div>

                {/* Show transaction details only if user selected "yes" */}
                {answers.hasRecentTransaction === 'yes' && (
                  <>
                    <div>
                      <label className="block font-satoshi font-semibold text-sm text-gray-700 mb-2">
                        Transaction Amount ({userData.currency})
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={answers.recentActivityAmount}
                        onChange={(e) => handleAnswer('recentActivityAmount', e.target.value)}
                        placeholder="e.g., 45.50"
                        className={`w-full p-4 rounded-xl border-2 font-satoshi text-gray-700 focus:outline-none transition-colors duration-300 ${
                          errors.recentActivityAmount ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-[#2b5f76]'
                        }`}
                      />
                      {errors.recentActivityAmount && (
                        <p className="mt-2 text-sm text-red-600 font-satoshi">{errors.recentActivityAmount}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block font-satoshi font-semibold text-sm text-gray-700 mb-2">
                        Where did you spend this money?
                      </label>
                      <textarea
                        value={answers.recentActivityDescription}
                        onChange={(e) => handleAnswer('recentActivityDescription', e.target.value)}
                        placeholder="e.g., Grocery shopping at Carrefour, Gas station, Online shopping..."
                        rows={3}
                        className={`w-full p-4 rounded-xl border-2 font-satoshi text-gray-700 focus:outline-none transition-colors duration-300 resize-none ${
                          errors.recentActivityDescription ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-[#2b5f76]'
                        }`}
                      />
                      {errors.recentActivityDescription && (
                        <p className="mt-2 text-sm text-red-600 font-satoshi">{errors.recentActivityDescription}</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Completion */}
            {currentQuestion.type === "completion" && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-gradient-to-br from-[#03e26f] to-[#5f8662] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <p className="font-satoshi text-lg text-gray-600 mb-2">
                  Your personalized dashboard is ready!
                </p>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-satoshi font-semibold rounded-full hover:border-[#2b5f76] hover:text-[#2b5f76] transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            )}
            
            <button
              onClick={handleNext}
              className="ml-auto group flex items-center gap-2 px-8 py-3 bg-[#D97843] text-white font-clash font-semibold rounded-full hover:shadow-[0_0_30px_rgba(217,120,67,0.6)] hover:scale-105 active:scale-95 transition-all duration-300"
            >
              {currentStep === totalSteps ? 'Get Started' : 'Continue'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Skip Option */}
        {currentStep < totalSteps && (
          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="font-satoshi text-sm text-gray-600 hover:text-[#2b5f76] transition-colors duration-300"
            >
              Skip setup and explore
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Setup;
import { useState, useEffect } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Home, TrendingUp, DollarSign, PieChart, AlertCircle, Loader2 } from 'lucide-react';
import logo from "../assets/logo-removebg-preview.png";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useUser } from '../hooks/useUser';
import { signUp, signIn, signInWithGoogle, signInWithGitHub, onAuthStateChange, getFirebaseErrorMessage } from '../utils/firebaseAuth';
import { incrementUserCount } from '../utils/userStats';

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

function Auth() {
  const { t, i18n } = useTranslation();
  const { updateUserData } = useUser();
  const [isLogin, setIsLogin] = useState(false);
  const [language, setLanguage] = useState(i18n.language === 'ar' ? 'en' : i18n.language);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const navigate = useNavigate();
  
  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        // User is already logged in, redirect to dashboard
        navigate('/dashboard');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    // Enable Arabic translation for Auth.jsx page
    if (lang === 'ar') {
      i18n.changeLanguage('ar');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    // Validate email
    if (!formData.email.trim()) {
      setError(t('auth.errors.email_required'));
      return false;
    }
    if (!isValidEmail(formData.email)) {
      setError(t('auth.errors.email_invalid'));
      return false;
    }

    // Validate password
    if (!formData.password) {
      setError(t('auth.errors.password_required'));
      return false;
    }
    if (formData.password.length < 6) {
      setError(t('auth.errors.password_min_length'));
      return false;
    }

    // For signup, validate name and terms
    if (!isLogin) {
      if (!formData.name.trim()) {
        setError(t('auth.errors.name_required'));
        return false;
      }
      if (!termsAccepted) {
        setError(t('auth.errors.terms_required'));
        return false;
      }
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await signUp(formData.email, formData.password, formData.name);
      const user = result.user;

      // Initialize user data
      updateUserData({
        walletName: user.displayName || formData.name.trim(),
        language: language,
        isSetupComplete: false
      });

      // Increment user count for new signup
      await incrementUserCount();

      setSuccess(t('auth.success.account_created'));
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      console.error("Signup error:", error);
      setError(getFirebaseErrorMessage(error));
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await signIn(formData.email, formData.password);
      const user = result.user;

      // Load user data if exists
      try {
        const savedUserData = localStorage.getItem('userData');
        if (savedUserData) {
          const parsed = JSON.parse(savedUserData);
          updateUserData({
            ...parsed,
            walletName: parsed.walletName || user.displayName
          });
        } else {
          updateUserData({
            walletName: user.displayName || user.email?.split('@')[0],
            language: language,
            isSetupComplete: false
          });
        }
      } catch (e) {
        console.error("Failed to load user data", e);
        updateUserData({
          walletName: user.displayName || user.email?.split('@')[0],
          language: language,
          isSetupComplete: false
        });
      }

      setSuccess(t('auth.success.logged_in'));
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      console.error("Login error:", error);
      setError(getFirebaseErrorMessage(error));
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (isLogin) {
      handleLogin();
    } else {
      handleSignup();
    }
  };

  // Clear form when switching between login/signup
  const handleToggleMode = (loginMode) => {
    setIsLogin(loginMode);
    setFormData({
      name: '',
      email: '',
      password: ''
    });
    setError('');
    setSuccess('');
    setTermsAccepted(false);
    setRememberMe(false);
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await signInWithGoogle();
      const user = result.user;

      // Check if this is a new user (first time signing in)
      const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;
      
      // Load or initialize user data
      try {
        const savedUserData = localStorage.getItem('userData');
        if (savedUserData) {
          const parsed = JSON.parse(savedUserData);
          updateUserData({
            ...parsed,
            walletName: parsed.walletName || user.displayName
          });
        } else {
          updateUserData({
            walletName: user.displayName || user.email?.split('@')[0],
            language: language,
            isSetupComplete: false
          });
        }
      } catch (e) {
        console.error("Failed to load user data", e);
        updateUserData({
          walletName: user.displayName || user.email?.split('@')[0],
          language: language,
          isSetupComplete: false
        });
      }

      // Increment user count only for new users
      if (isNewUser) {
        await incrementUserCount();
      }

      setSuccess(t('auth.success.logged_in'));
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError(getFirebaseErrorMessage(error));
      setIsLoading(false);
    }
  };

  // Handle GitHub Sign-In
  const handleGitHubSignIn = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await signInWithGitHub();
      const user = result.user;

      // Check if this is a new user (first time signing in)
      const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;

      // Load or initialize user data
      try {
        const savedUserData = localStorage.getItem('userData');
        if (savedUserData) {
          const parsed = JSON.parse(savedUserData);
          updateUserData({
            ...parsed,
            walletName: parsed.walletName || user.displayName
          });
        } else {
          updateUserData({
            walletName: user.displayName || user.email?.split('@')[0],
            language: language,
            isSetupComplete: false
          });
        }
      } catch (e) {
        console.error("Failed to load user data", e);
        updateUserData({
          walletName: user.displayName || user.email?.split('@')[0],
          language: language,
          isSetupComplete: false
        });
      }

      // Increment user count only for new users
      if (isNewUser) {
        await incrementUserCount();
      }

      setSuccess(t('auth.success.logged_in'));
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      console.error('GitHub sign-in error:', error);
      setError(getFirebaseErrorMessage(error));
      setIsLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-white via-[#ddb4b3]/10 to-[#2b5f76]/5">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#03e26f]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#2b5f76]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#dd573c]/5 rounded-full blur-3xl"></div>
      </div>

      {/* Left Side - Branding & Features (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 relative p-12 flex-col justify-start space-y-12">
        {/* Logo, Language Switcher & Home Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} className='h-22 w-auto'/>
          </div>
          <div className="flex items-center gap-4">
            {/* Language Switcher for Desktop */}
            <div className="flex gap-1 bg-white border-2 border-gray-200 rounded-full p-1">
              <button
                onClick={() => handleLanguageChange('en')}
                className={`px-3 py-1 rounded-full font-satoshi font-medium text-xs transition-all duration-300 ${
                  language === 'en'
                    ? 'bg-[#2b5f76] text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => handleLanguageChange('ar')}
                className={`px-3 py-1 rounded-full font-satoshi font-medium text-xs transition-all duration-300 ${
                  language === 'ar'
                    ? 'bg-[#2b5f76] text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                AR
              </button>
            </div>
            <Link to="/" className="flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-gray-200 rounded-full font-satoshi font-medium text-sm text-gray-700 hover:border-[#2b5f76] hover:text-[#2b5f76] transition-all duration-300">
              <Home className="w-4 h-4" />
              Home
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <div>
            <h1 className="font-clash font-bold text-5xl text-[#0d121a] leading-tight">
              {t('auth.left_side.title_part1')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2b5f76] via-[#dd573c] to-[#634423]">
                {t('auth.left_side.title_part2')}
              </span>{' '}
              {t('auth.left_side.title_part3')}
            </h1>
            <p className="font-satoshi text-lg text-gray-600 max-w-md mt-4">
              {t('auth.left_side.description')}
            </p>
          </div>

          {/* Feature Cards */}
          <div className="space-y-4">
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#2b5f76] to-[#143052] rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-clash font-semibold text-lg text-[#0d121a] mb-1">{t('auth.left_side.feature_1.title')}</h3>
                  <p className="font-satoshi text-sm text-gray-600">{t('auth.left_side.feature_1.description')}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#dd573c] to-[#ab3412] rounded-xl flex items-center justify-center flex-shrink-0">
                  <PieChart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-clash font-semibold text-lg text-[#0d121a] mb-1">{t('auth.left_side.feature_2.title')}</h3>
                  <p className="font-satoshi text-sm text-gray-600">{t('auth.left_side.feature_2.description')}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#03e26f] to-[#5f8662] rounded-xl flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-clash font-semibold text-lg text-[#0d121a] mb-1">{t('auth.left_side.feature_3.title')}</h3>
                  <p className="font-satoshi text-sm text-gray-600">{t('auth.left_side.feature_3.description')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="relative max-w-md w-full">
          {/* Mobile Logo & Home Button */}
          <div className="lg:hidden flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <img src={logo} className='w-auto h-16'/>
            </div>
            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <div className="flex gap-1 bg-white border-2 border-gray-200 rounded-full p-1">
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`px-3 py-1 rounded-full font-satoshi font-medium text-xs transition-all duration-300 ${
                    language === 'en'
                      ? 'bg-[#2b5f76] text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => handleLanguageChange('ar')}
                  className={`px-3 py-1 rounded-full font-satoshi font-medium text-xs transition-all duration-300 ${
                    language === 'ar'
                      ? 'bg-[#2b5f76] text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  AR
                </button>
              </div>
              <Link to="/" className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-full font-satoshi font-medium text-sm text-gray-700 hover:border-[#2b5f76] hover:text-[#2b5f76] transition-all duration-300">
                <Home className="w-4 h-4" />
                Home
              </Link>
            </div>
          </div>

          {/* Auth Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 border border-gray-100">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="font-clash font-bold text-3xl text-[#0d121a] mb-2">
                {isLogin ? t('auth.welcome_back') : t('auth.welcome_to_wally')}
              </h1>
              <p className="font-satoshi text-sm text-gray-600">
                {isLogin ? t('auth.sign_in_message') : t('auth.sign_up_message')}
              </p>
            </div>

            {/* Toggle Tabs */}
            <div className="flex gap-2 mb-8 bg-gray-100 rounded-full p-1">
              <button
                onClick={() => handleToggleMode(false)}
                className={`flex-1 py-2.5 rounded-full font-clash font-semibold text-sm transition-all duration-300 ${
                  !isLogin
                    ? 'bg-[#2b5f76] text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('auth.sign_up')}
              </button>
              <button
                onClick={() => handleToggleMode(true)}
                className={`flex-1 py-2.5 rounded-full font-clash font-semibold text-sm transition-all duration-300 ${
                  isLogin
                    ? 'bg-[#2b5f76] text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('auth.sign_in')}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="font-satoshi text-sm text-red-600">{error}</p>
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-start gap-2"
              >
                <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <p className="font-satoshi text-sm text-green-600">{success}</p>
              </motion.div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Field (Sign Up Only) */}
              {!isLogin && (
                <div>
                  <label className="block font-satoshi font-medium text-sm text-gray-700 mb-2">
                    {t('auth.full_name')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl font-satoshi text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2b5f76] focus:border-transparent transition-all duration-300"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block font-satoshi font-medium text-sm text-gray-700 mb-2">
                  {t('auth.email_address')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl font-satoshi text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2b5f76] focus:border-transparent transition-all duration-300"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block font-satoshi font-medium text-sm text-gray-700 mb-2">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl font-satoshi text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2b5f76] focus:border-transparent transition-all duration-300"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password (Login Only) */}
              {isLogin && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember"
                      name="remember"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-[#2b5f76] focus:ring-[#2b5f76] border-gray-300 rounded cursor-pointer"
                    />
                    <label htmlFor="remember" className="ml-2 block font-satoshi text-sm text-gray-700 cursor-pointer">
                      {t('auth.remember_me')}
                    </label>
                  </div>
                  <a href="#forgot" className="font-satoshi text-sm text-[#2b5f76] hover:text-[#143052] transition-colors duration-300">
                    {t('auth.forgot_password')}
                  </a>
                </div>
              )}

              {/* Terms & Conditions (Sign Up Only) */}
              {!isLogin && (
                <div className="flex items-start">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="h-4 w-4 mt-0.5 text-[#2b5f76] focus:ring-[#2b5f76] border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="terms" className="ml-2 block font-satoshi text-sm text-gray-700 cursor-pointer">
                    {t('auth.terms')}{' '}
                    <a href="#terms" className="text-[#2b5f76] hover:text-[#143052] transition-colors duration-300">
                      {t('auth.terms_of_service')}
                    </a>
                    {' '}{t('auth.and')}{' '}
                    <a href="#privacy" className="text-[#2b5f76] hover:text-[#143052] transition-colors duration-300">
                      {t('auth.privacy_policy')}
                    </a>
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="group w-full flex items-center justify-center gap-2 py-3.5 bg-[#D97843] text-white font-clash font-semibold rounded-full cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_rgba(217,120,67,0.6)] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isLogin ? t('auth.sign_in') : t('auth.create_account')}...
                  </>
                ) : (
                  <>
                    {isLogin ? t('auth.sign_in') : t('auth.create_account')}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white font-satoshi text-gray-500">{t('auth.or_continue_with')}</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 rounded-xl font-satoshi font-medium text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {isLoading ? '...' : 'Google'}
              </motion.button>
              <motion.button
                onClick={handleGitHubSignIn}
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 rounded-xl font-satoshi font-medium text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                {isLoading ? '...' : 'GitHub'}
              </motion.button>
            </div>

            {/* Bottom Text */}
            <p className="mt-8 text-center font-satoshi text-sm text-gray-600">
              {isLogin ? t('auth.dont_have_account') + ' ' : t('auth.already_have_account') + ' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-[#2b5f76] hover:text-[#143052] font-medium transition-colors duration-300"
              >
                {isLogin ? t('auth.sign_up_link') : t('auth.sign_in_link')}
              </button>
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-20 right-10 w-24 h-24 opacity-5">
        <div className="grid grid-cols-4 gap-2">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-[#dd573c] rounded-full"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Auth;
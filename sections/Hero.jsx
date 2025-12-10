import { useState, useEffect } from 'react';
import { ArrowRight, Wallet, TrendingUp, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { subscribeToUserCount } from '../utils/userStats';

function Hero() {
  const { t, i18n } = useTranslation();
  const [activeUsers, setActiveUsers] = useState(0);
  const [targetUsers, setTargetUsers] = useState(0);

  // Determine text direction based on language
  const isRtl = i18n.language === 'ar';

  // Subscribe to real-time user count updates
  useEffect(() => {
    const unsubscribe = subscribeToUserCount((count) => {
      setTargetUsers(count);
    });

    return () => unsubscribe();
  }, []);

  // Animate active users count when target changes
  useEffect(() => {
    if (targetUsers === 0) return; // Don't animate if we haven't loaded the count yet

    const duration = 2000; // 2 seconds
    const steps = 60;
    const startValue = activeUsers;
    const difference = targetUsers - startValue;
    const increment = difference / steps;
    let current = startValue;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(current + increment, targetUsers);
      setActiveUsers(Math.floor(current));

      if (step >= steps || current >= targetUsers) {
        clearInterval(timer);
        setActiveUsers(targetUsers);
      }
    }, duration / steps);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUsers]);

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#ddb4b3]/10 to-[#2b5f76]/5 pt-20">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#03e26f]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#2b5f76]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#dd573c]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className={`space-y-8 text-center ${isRtl ? 'lg:text-right' : 'lg:text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#143052]/5 border border-[#2b5f76]/20 rounded-full">
              <span className="w-2 h-2 bg-[#03e26f] rounded-full animate-pulse"></span>
              <span className="text-sm font-satoshi font-medium text-[#143052]">
                {t('hero.badge')}
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="font-clash font-bold text-5xl sm:text-6xl lg:text-7xl text-[#0d121a] leading-tight">
              {t('hero.main_heading.part1')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2b5f76] via-[#dd573c] to-[#634423]">
                {t('hero.main_heading.part2')}
              </span>{' '}
              {t('hero.main_heading.part3')}
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-gray-600 font-satoshi max-w-2xl">
              {t('hero.subheading')}
            </p>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 justify-center ${isRtl ? 'lg:justify-end' : 'lg:justify-start'}`}>
              <Link to="/auth">
              <button className="group px-10 py-4 bg-[#D97843] text-white font-clash font-semibold rounded-full cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_rgba(217,120,67,0.6)] hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                {t('hero.cta.get_started')}
                <ArrowRight className={`w-5 h-5 ${isRtl ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'} transition-transform`} />
              </button>
              </Link>
            
            </div>

            {/* Stats */}
            <div className={`flex flex-wrap gap-8 justify-center ${isRtl ? 'lg:justify-end' : 'lg:justify-start'} pt-8 border-t border-gray-200`}>
              <div>
                <p className="font-clash font-bold text-3xl text-[#143052]">
                  {2}+
                </p>
                <p className="font-satoshi text-sm text-gray-600">{t('hero.stats.users.label')}</p>
              </div>
              <div>
                <p className="font-clash font-bold text-3xl text-[#143052]">{t('hero.stats.rating.value')}</p>
                <p className="font-satoshi text-sm text-gray-600">{t('hero.stats.rating.label')}</p>
              </div>
            </div>
          </div>

          {/* Right Content - Feature Cards */}
          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Card 1 */}
              <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100" dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="w-12 h-12 bg-gradient-to-br from-[#2b5f76] to-[#143052] rounded-xl flex items-center justify-center mb-4">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-clash font-semibold text-lg text-[#0d121a] mb-2">
                  {t('hero.features.budgeting.title')}
                </h3>
                <p className="font-satoshi text-sm text-gray-600">
                  {t('hero.features.budgeting.description')}
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 sm:mt-8" dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="w-12 h-12 bg-gradient-to-br from-[#dd573c] to-[#ab3412] rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-clash font-semibold text-lg text-[#0d121a] mb-2">
                  {t('hero.features.insights.title')}
                </h3>
                <p className="font-satoshi text-sm text-gray-600">
                  {t('hero.features.insights.description')}
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100" dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="w-12 h-12 bg-gradient-to-br from-[#03e26f] to-[#5f8662] rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-clash font-semibold text-lg text-[#0d121a] mb-2">
                  {t('hero.features.security.title')}
                </h3>
                <p className="font-satoshi text-sm text-gray-600">
                  {t('hero.features.security.description')}
                </p>
              </div>

              {/* Card 4 - Highlight Card */}
              <div className="bg-gradient-to-br from-[#2b5f76] to-[#143052] p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 sm:mt-8" dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="mb-4">
                  <p className="font-satoshi text-sm text-white/80 mb-1">{t('hero.highlight_card.month')}</p>
                  <p className="font-clash font-bold text-3xl text-white">{t('hero.highlight_card.amount')}</p>
                </div>
                <p className="font-satoshi text-sm text-white/90">
                  {t('hero.highlight_card.description')}
                </p>
                <div className="mt-4 flex items-center gap-1">
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-[#03e26f] h-2 rounded-full w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating decoration */}
            <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-[#03e26f]/5 via-[#dd573c]/5 to-[#2b5f76]/5 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>

      {/* Bottom Wave Decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="url(#wave-gradient)"/>
          <defs>
            <linearGradient id="wave-gradient" x1="0" y1="0" x2="1440" y2="0">
              <stop offset="0%" stopColor="#2b5f76" stopOpacity="0.1"/>
              <stop offset="50%" stopColor="#dd573c" stopOpacity="0.05"/>
              <stop offset="100%" stopColor="#03e26f" stopOpacity="0.1"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
    </section>
  );
}

export default Hero;
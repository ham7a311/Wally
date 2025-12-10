import { Wallet, PieChart, Bell, Lock, TrendingUp, Users, Smartphone, BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

function Features() {
  const { t, i18n } = useTranslation();
  
  // Determine text direction based on language
  const isRtl = i18n.language === 'ar';

  const features = [
    {
      icon: Wallet,
      title: t('features.items.expense_tracking.title'),
      description: t('features.items.expense_tracking.description'),
      gradient: "from-[#2b5f76] to-[#143052]"
    },
    {
      icon: PieChart,
      title: t('features.items.budget_reports.title'),
      description: t('features.items.budget_reports.description'),
      gradient: "from-[#dd573c] to-[#ab3412]"
    },
    {
      icon: Bell,
      title: t('features.items.notifications.title'),
      description: t('features.items.notifications.description'),
      gradient: "from-[#03e26f] to-[#5f8662]"
    },
    {
      icon: Lock,
      title: t('features.items.security.title'),
      description: t('features.items.security.description'),
      gradient: "from-[#634423] to-[#ab3412]"
    },
    {
      icon: TrendingUp,
      title: t('features.items.goal_setting.title'),
      description: t('features.items.goal_setting.description'),
      gradient: "from-[#c6be4d] to-[#dbf22c]"
    },
    {
      icon: Users,
      title: t('features.items.shared_wallets.title'),
      description: t('features.items.shared_wallets.description'),
      gradient: "from-[#2b5f76] to-[#03e26f]"
    },
    {
      icon: Smartphone,
      title: t('features.items.mobile_first.title'),
      description: t('features.items.mobile_first.description'),
      gradient: "from-[#dd573c] to-[#c6be4d]"
    },
    {
      icon: BarChart3,
      title: t('features.items.financial_insights.title'),
      description: t('features.items.financial_insights.description'),
      gradient: "from-[#143052] to-[#2b5f76]"
    }
  ];

  return (
    <section className="relative py-20 bg-white overflow-hidden" id="features">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2b5f76]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#03e26f]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#143052]/5 border border-[#2b5f76]/20 rounded-full mb-4">
            <span className="w-2 h-2 bg-[#dd573c] rounded-full animate-pulse"></span>
            <span className="text-sm font-satoshi font-medium text-[#143052]">
              {t('features.badge')}
            </span>
          </div>
          
          <h2 className="font-clash font-bold text-4xl sm:text-5xl lg:text-6xl text-[#0d121a]">
            {t('features.heading.part1')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2b5f76] via-[#dd573c] to-[#634423]">
              {t('features.heading.part2')}
            </span>
          </h2>
          
          <p className="text-lg text-gray-600 font-satoshi max-w-2xl mx-auto">
            {t('features.subheading')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-white p-6 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
                dir={isRtl ? 'rtl' : 'ltr'}
              >
                {/* Icon */}
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Title */}
                <h3 className="font-clash font-semibold text-xl text-[#0d121a] mb-3">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="font-satoshi text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Effect Border */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`}></div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="inline-flex flex-col sm:flex-row gap-4 items-center">
            <Link to="/auth">
            <button className="px-8 py-4 bg-[#D97843] text-white font-clash font-semibold rounded-full cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_rgba(217,120,67,0.6)] hover:scale-105 active:scale-95">
              {t('features.cta.start_trial')}
            </button>
            </Link>
            <p className="font-satoshi text-sm text-gray-600">
              {t('features.cta.trial_info')}
            </p>
          </div>
        </div>
      </div>

      {/* Decorative dots pattern */}
      <div className="absolute top-20 right-10 w-32 h-32 opacity-5">
        <div className="grid grid-cols-4 gap-2">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-[#2b5f76] rounded-full"></div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-20 left-10 w-32 h-32 opacity-5">
        <div className="grid grid-cols-4 gap-2">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-[#dd573c] rounded-full"></div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
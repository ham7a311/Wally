import { Check, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom"

function Pricing() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const availableFeatures = [
    {
      title: t('pricing.features.visual_reports.title'),
      description: t('pricing.features.visual_reports.description')
    },
    {
      title: t('pricing.features.real_time_insights.title'),
      description: t('pricing.features.real_time_insights.description')
    },
    {
      title: t('pricing.features.goal_tracking.title'),
      description: t('pricing.features.goal_tracking.description')
    },
    {
      title: t('pricing.features.priority_support.title'),
      description: t('pricing.features.priority_support.description')
    },
    {
      title: t('pricing.features.ad_free.title'),
      description: t('pricing.features.ad_free.description')
    }
  ];

  const comingSoonFeatures = [
    {
      title: t('pricing.features.arabic_dashboard.title'),
      description: t('pricing.features.arabic_dashboard.description')
    },
    {
      title: t('pricing.features.smart_categorization.title'),
      description: t('pricing.features.smart_categorization.description')
    },
    {
      title: t('pricing.features.mobile_apps.title'),
      description: t('pricing.features.mobile_apps.description')
    },
    {
      title: t('pricing.features.shared_wallets.title'),
      description: t('pricing.features.shared_wallets.description')
    }, 
    {
      title: t('pricing.features.export_data.title'),
      description: t('pricing.features.export_data.description')
    },
  ];

  return (
    <section className="relative py-20 bg-white overflow-hidden" id="pricing">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#dd573c]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#03e26f]/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2b5f76]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#143052]/5 border border-[#2b5f76]/20 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-[#03e26f]" />
            <span className="text-sm font-satoshi font-medium text-[#143052]">
              {t('pricing.badge')}
            </span>
          </div>
          
          <h2 className="font-clash font-bold text-4xl sm:text-5xl lg:text-6xl text-[#0d121a]">
            {t('pricing.heading.part1')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2b5f76] via-[#dd573c] to-[#634423]">
              {t('pricing.heading.part2')}
            </span>
          </h2>
          
          <p className="text-lg text-gray-600 font-satoshi max-w-2xl mx-auto">
            {t('pricing.subheading')}
          </p>
        </div>

        {/* Free Plan Card */}
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-white to-[#2b5f76]/5 rounded-3xl p-8 sm:p-12 border-2 border-[#2b5f76] shadow-2xl">
            {/* Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-[#03e26f] to-[#5f8662] text-white px-8 py-2 rounded-full font-clash font-semibold text-sm shadow-lg">
                {t('pricing.badge_text')}
              </div>
            </div>

            {/* Plan Header */}
            <div className="text-center mb-12 pt-4" dir={isRtl ? 'rtl' : 'ltr'}>
              <h3 className="font-clash font-bold text-3xl text-[#0d121a] mb-3">
                {t('pricing.plan_title')}
              </h3>
              <div className="flex items-baseline justify-center gap-2 mb-4">
                <span className="font-clash font-bold text-6xl text-[#0d121a]">
                  {t('pricing.plan_price')}
                </span>
                <span className="font-satoshi text-2xl text-gray-600">
                  {t('pricing.plan_currency')}
                </span>
                <span className="font-satoshi text-lg text-gray-500">{t('pricing.plan_period')}</span>
              </div>
              <p className="font-satoshi text-lg text-gray-600 max-w-xl mx-auto">
                {t('pricing.plan_description')}
              </p>
            </div>

            {/* Features Grid */}
            <div className="space-y-8 mb-10" dir={isRtl ? 'rtl' : 'ltr'}>
              {/* Available Now */}
              <div>
                <h4 className="font-clash font-bold text-xl text-[#0d121a] mb-6 text-center">
                  {t('pricing.available_now')}
                </h4>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                  {availableFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#03e26f] to-[#5f8662] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h5 className="font-clash font-semibold text-base text-[#0d121a] mb-1">
                          {feature.title}
                        </h5>
                        <p className="font-satoshi text-sm text-gray-600">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-dashed border-gray-300"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-6 bg-gradient-to-br from-white to-[#2b5f76]/5 font-satoshi font-semibold text-sm text-gray-500">
                    {t('pricing.coming_soon')}
                  </span>
                </div>
              </div>

              {/* Coming Soon */}
              <div>
                <h4 className="font-clash font-bold text-xl text-[#0d121a] mb-6 text-center">
                  {t('pricing.coming_soon_title')}
                </h4>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                  {comingSoonFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#dd573c] to-[#ab3412] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h5 className="font-clash font-semibold text-base text-[#0d121a] mb-1">
                          {feature.title}
                        </h5>
                        <p className="font-satoshi text-sm text-gray-600">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center" dir={isRtl ? 'rtl' : 'ltr'}>
              <Link to="/auth">
              <button className="px-12 py-4 bg-[#D97843] text-white font-clash font-bold text-lg rounded-full cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_rgba(217,120,67,0.6)] hover:scale-105 active:scale-95">
                {t('pricing.cta.button')}
              </button>
              </Link>
              <p className="font-satoshi text-sm text-gray-500 mt-4">
                {t('pricing.cta.subtext')}
              </p>
            </div>

            {/* Gradient Border Effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#03e26f]/10 via-transparent to-[#2b5f76]/10 pointer-events-none"></div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="mt-16 text-center space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm font-satoshi text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gradient-to-br from-[#2b5f76] to-[#143052] rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span>{t('pricing.info.no_hidden_fees')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gradient-to-br from-[#2b5f76] to-[#143052] rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span>{t('pricing.info.all_features_included')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gradient-to-br from-[#2b5f76] to-[#143052] rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span>{t('pricing.info.cancel_anytime')}</span>
            </div>
          </div>

          <p className="font-satoshi text-sm text-gray-500 max-w-2xl mx-auto">
            {t('pricing.info.questions')}{' '}
            <a href="https://wa.me/96894990747" className="text-[#2b5f76] hover:text-[#143052] font-medium underline">
              {t('pricing.info.contact')}
            </a>
            {' '}{t('pricing.info.contact_text')}
          </p>
        </div>
      </div>

      {/* Decorative dots pattern */}
      <div className="absolute top-20 left-10 w-32 h-32 opacity-5">
        <div className="grid grid-cols-4 gap-2">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-[#2b5f76] rounded-full"></div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-20 right-10 w-32 h-32 opacity-5">
        <div className="grid grid-cols-4 gap-2">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-[#dd573c] rounded-full"></div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Pricing;
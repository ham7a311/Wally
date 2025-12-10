import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function FAQ() {
  const { t, i18n } = useTranslation();
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: t('faq.items.create_budget.question'),
      answer: t('faq.items.create_budget.answer')
    },
    {
      question: t('faq.items.transactions.question'),
      answer: t('faq.items.transactions.answer')
    },
    {
      question: t('faq.items.analytics.question'),
      answer: t('faq.items.analytics.answer')
    },
    {
      question: t('faq.items.budget_tracking.question'),
      answer: t('faq.items.budget_tracking.answer')
    },
    {
      question: t('faq.items.settings.question'),
      answer: t('faq.items.settings.answer')
    },
    {
      question: t('faq.items.exceeded_budget.question'),
      answer: t('faq.items.exceeded_budget.answer')
    },
    {
      question: t('faq.items.category_spending.question'),
      answer: t('faq.items.category_spending.answer')
    },
    {
      question: t('faq.items.pricing.question'),
      answer: t('faq.items.pricing.answer')
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative py-20 bg-gradient-to-br from-white via-[#ddb4b3]/5 to-white overflow-hidden" id="faq">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-0 w-96 h-96 bg-[#03e26f]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#2b5f76]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#143052]/5 border border-[#2b5f76]/20 rounded-full mb-4">
            <HelpCircle className="w-4 h-4 text-[#dd573c]" />
            <span className="text-sm font-satoshi font-medium text-[#143052]">
              {t('faq.badge')}
            </span>
          </div>
          
          <h2 className="font-clash font-bold text-4xl sm:text-5xl lg:text-6xl text-[#0d121a]">
            {t('faq.heading.part1')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2b5f76] via-[#dd573c] to-[#634423]">
              {t('faq.heading.part2')}
            </span>
          </h2>
          
          <p className="text-lg text-gray-600 font-satoshi max-w-2xl mx-auto">
            {t('faq.subheading')}
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left transition-all duration-300 hover:bg-gray-50"
              >
                <h3 className="font-clash font-semibold text-lg sm:text-xl text-[#0d121a] pr-4">
                  {faq.question}
                </h3>
                <ChevronDown
                  className={`w-6 h-6 text-[#2b5f76] flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-5 pt-2">
                  <p className="font-satoshi text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center bg-gradient-to-br from-[#2b5f76] to-[#143052] rounded-3xl p-8 sm:p-12 shadow-xl">
          <h3 className="font-clash font-bold text-3xl sm:text-4xl text-white mb-4">
            {t('faq.cta.heading')}
          </h3>
          <p className="font-satoshi text-lg text-white/90 mb-6 max-w-xl mx-auto">
            {t('faq.cta.subheading')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://wa.me/96894990747" className="px-10 py-4 bg-[#D97843] text-white font-clash font-semibold rounded-full cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_rgba(217,120,67,0.6)] hover:scale-105 active:scale-95">
              {t('faq.cta.contact_support')}
            </a>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-40 right-10 w-24 h-24 opacity-5">
        <div className="grid grid-cols-3 gap-2">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-[#dd573c] rounded-full"></div>
          ))}
        </div>
      </div>

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

export default FAQ;
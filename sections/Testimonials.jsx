import { Star, Quote, User, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom"

function Testimonials() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const testimonials = [
    {
      name: t('testimonials.testimonial_1.name'),
      role: t('testimonials.testimonial_1.role'),
      rating: 5,
      text: t('testimonials.testimonial_1.text')
    },
    {
      name: t('testimonials.testimonial_2.name'),
      role: t('testimonials.testimonial_2.role'),
      rating: 5,
      text: t('testimonials.testimonial_2.text')
    },
    {
      name: t('testimonials.testimonial_3.name'),
      role: t('testimonials.testimonial_3.role'),
      rating: 5,
      text: t('testimonials.testimonial_3.text')
    },
    {
      name: t('testimonials.testimonial_4.name'),
      role: t('testimonials.testimonial_4.role'),
      rating: 5,
      text: t('testimonials.testimonial_4.text')
    },
    {
      name: t('testimonials.testimonial_5.name'),
      role: t('testimonials.testimonial_5.role'),
      rating: 5,
      text: t('testimonials.testimonial_5.text')
    },
    {
      name: t('testimonials.testimonial_6.name'),
      role: t('testimonials.testimonial_6.role'),
      rating: 5,
      text: t('testimonials.testimonial_6.text')
    }
  ];

  return (
    <section className="relative py-20 bg-gradient-to-br from-white via-[#ddb4b3]/5 to-white overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2b5f76]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#03e26f]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#143052]/5 border border-[#2b5f76]/20 rounded-full mb-4">
            <Star className="w-4 h-4 text-[#dd573c]" />
            <span className="text-sm font-satoshi font-medium text-[#143052]">
              {t('testimonials.badge')}
            </span>
          </div>
          
          <h2 className="font-clash font-bold text-4xl sm:text-5xl lg:text-6xl text-[#0d121a]">
            {t('testimonials.heading.part1')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2b5f76] via-[#dd573c] to-[#634423]">
              {t('testimonials.heading.part2')}
            </span>
          </h2>
          
          <p className="text-lg text-gray-600 font-satoshi max-w-2xl mx-auto">
            {t('testimonials.subheading')}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative bg-white rounded-2xl p-8 border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 left-8">
                <div className="w-10 h-10 bg-gradient-to-br from-[#2b5f76] to-[#143052] rounded-full flex items-center justify-center shadow-lg">
                  <Quote className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4 mt-2">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#dd573c] text-[#dd573c]" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="font-satoshi text-gray-700 leading-relaxed mb-6">
                "{testimonial.text}"
              </p>

              {/* User Info */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <User
                        className="w-12 h-12 rounded-full object-cover text-[#2b5f76]"
                    />
                    <div>
                        <h4 className="font-clash font-semibold text-base text-[#0d121a]">
                        {testimonial.name}
                        </h4>
                        <p className="font-satoshi text-sm text-gray-600 bg-[#2b5f76] text-white px-2 py-1 rounded">
                        {testimonial.role}
                        </p>
                    </div>
                </div>

              {/* Gradient Effect on Hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#2b5f76]/5 via-transparent to-[#dd573c]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-[#dd573c] text-[#dd573c]" />
              ))}
            </div>
            <p className="font-clash font-bold text-2xl text-[#0d121a]">5/5</p>
            <p className="font-satoshi text-sm text-gray-600 mt-2">{t('testimonials.stats.average_rating')}</p>
          </div>

          <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-2">
             {<User className="w-6 h-6 text-[#2b5f76]"/>}
            </div>
            <p className="font-clash font-bold text-2xl text-[#0d121a] mb-2">2+</p>
            <p className="font-satoshi text-sm text-gray-600 mt-2">{t('testimonials.stats.happy_users')}</p>
          </div>

          <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-2">
             {<DollarSign className="w-6 h-6 text-[#03e26f]"/>}
            </div>
            <p className="font-clash font-bold text-2xl text-[#0d121a] mb-2">OMR 25+</p>
            <p className="font-satoshi text-sm text-gray-600 mt-2">{t('testimonials.stats.money_managed')}</p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center" dir={isRtl ? 'rtl' : 'ltr'}>
            <Link to="/auth">
            <button className="px-12 py-4 bg-[#D97843] text-white font-clash font-bold text-lg rounded-full cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_rgba(217,120,67,0.6)] hover:scale-105 active:scale-95">
            {t('testimonials.cta.button')}
          </button>
            </Link>
          <p className="font-satoshi text-sm text-gray-500 mt-4">
            {t('testimonials.cta.subtext')}
          </p>
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

export default Testimonials;
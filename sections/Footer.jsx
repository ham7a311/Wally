import { Phone, MapPin, Instagram, Github } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import logoLight from "../assets/logoLight.png";

function Footer() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const footerLinks = {
    product: [
      { label: t('footer.links.product.features'), href: "#features" },
      { label: t('footer.links.product.pricing'), href: "#pricing" },
      { label: t('footer.links.product.faq'), href: "#faq" }
    ],
    company: [
      { label: t('footer.links.company.about'), href: "#about" },
      { label: t('footer.links.company.careers'), href: "#careers" }
    ],
    support: [
      { label: t('footer.links.support.help'), href: "#help" },
      { label: t('footer.links.support.contact'), href: "#contact" }
    ],
    legal: [
      { label: t('footer.links.legal.privacy'), href: "#privacy" },
      { label: t('footer.links.legal.terms'), href: "#terms" }
    ]
  };

  const socialLinks = [
    { icon: Github, href: "https://github.com/ham7a311", label: t('footer.social.github') },
    { icon: Phone, href: "https://wa.me/96894990747", label: t('footer.social.x') },
    { icon: Instagram, href: "https://instagram.com/ham7a311__", label: t('footer.social.instagram') }
  ];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <footer className="relative bg-gradient-to-br from-[#0d121a] via-[#143052] to-[#0d121a] text-white overflow-hidden" id="contact">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2b5f76]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#dd573c]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12" dir={isRtl ? 'rtl' : 'ltr'}>
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <img src={logoLight} className="h-30 w-auto" alt={t('footer.brand.alt')} />
              <p className="font-satoshi text-sm text-gray-400 leading-relaxed">
                {t('footer.brand.description')}
              </p>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#dd573c] to-[#ab3412] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <a href="tel:+96812345678" className="font-satoshi text-sm text-gray-400 hover:text-[#03e26f] transition-colors duration-300">
                  {t('footer.contact.phone')}
                </a>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#03e26f] to-[#5f8662] rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <span className="font-satoshi text-sm text-gray-400">
                  {t('footer.contact.address')}
                </span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-clash font-semibold text-lg text-white mb-4">{t('footer.links.product.title')}</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="font-satoshi text-sm text-gray-400 hover:text-[#03e26f] transition-colors duration-300 inline-block"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-clash font-semibold text-lg text-white mb-4">{t('footer.links.company.title')}</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="font-satoshi text-sm text-gray-400 hover:text-[#03e26f] transition-colors duration-300 inline-block"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-clash font-semibold text-lg text-white mb-4">{t('footer.links.support.title')}</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="font-satoshi text-sm text-gray-400 hover:text-[#03e26f] transition-colors duration-300 inline-block"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-clash font-semibold text-lg text-white mb-4">{t('footer.links.legal.title')}</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="font-satoshi text-sm text-gray-400 hover:text-[#03e26f] transition-colors duration-300 inline-block"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="py-8 border-t border-gray-700" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="max-w-xl mx-auto text-center">
            <h4 className="font-clash font-semibold text-xl text-white mb-2">
              {t('footer.newsletter.title')}
            </h4>
            <p className="font-satoshi text-sm text-gray-400 mb-6">
              {t('footer.newsletter.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder={t('footer.newsletter.placeholder')}
                className="flex-1 px-6 py-3 bg-white/10 border border-gray-600 rounded-full font-satoshi text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#2b5f76] transition-colors duration-300"
              />
              <button className="px-8 py-3 bg-[#D97843] text-white font-clash font-semibold rounded-full cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_rgba(217,120,67,0.6)] hover:scale-105 active:scale-95">
                {t('footer.newsletter.subscribe')}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-gray-700" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <p className="font-satoshi text-sm text-gray-400 text-center md:text-left">
              {t('footer.copyright')}
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 bg-white/10 hover:bg-gradient-to-br hover:from-[#2b5f76] hover:to-[#143052] rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  >
                    <Icon className="w-5 h-5 text-gray-400 hover:text-white transition-colors duration-300" />
                  </a>
                );
              })}
            </div>

            {/* Language/Region Selector */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeLanguage('en')}
                className={`px-4 py-2 ${i18n.language === 'en' ? 'bg-[#2b5f76]' : 'bg-white/10 hover:bg-white/20'} border border-gray-600 rounded-full font-satoshi text-sm text-gray-400 hover:text-white transition-all duration-300`}
              >
                {t('footer.language.english')}
              </button>
              <button
                onClick={() => changeLanguage('ar')}
                className={`px-4 py-2 ${i18n.language === 'ar' ? 'bg-[#2b5f76]' : 'bg-white/10 hover:bg-white/20'} border border-gray-600 rounded-full font-satoshi text-sm text-gray-400 hover:text-white transition-all duration-300`}
              >
                {t('footer.language.arabic')}
              </button>
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-gray-600 rounded-full font-satoshi text-sm text-gray-400 hover:text-white transition-all duration-300">
                {t('footer.currency')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative dots pattern */}
      <div className="absolute bottom-10 right-10 w-24 h-24 opacity-5">
        <div className="grid grid-cols-4 gap-2">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-white rounded-full"></div>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
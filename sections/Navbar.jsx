import { Link } from 'react-router-dom';
import logo from '../assets/logo-removebg-preview.png';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

function Navbar() {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const langDropdownRef = useRef(null);
  const mobileLangDropdownRef = useRef(null);

  const navItems = [
    { label: t('navbar.features'), href: '#features' },
    { label: t('navbar.faq'), href: '#faq' },
    { label: t('navbar.pricing'), href: '#pricing' },
    { label: t('navbar.testimonials'), href: '#testimonials' },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsLangOpen(false);
    if (isMenuOpen) toggleMenu();
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(event.target) &&
        mobileLangDropdownRef.current &&
        !mobileLangDropdownRef.current.contains(event.target)
      ) {
        setIsLangOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/80 backdrop-blur-sm shadow-lg' : 'bg-white shadow-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <img src={logo} alt="Wally Logo" className="h-20 w-auto" />
          </Link>

          {/* Center: Links */}
          <div className="hidden md:flex space-x-8 items-center">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-gray-700 hover:text-gray-900 relative group transition-all duration-300 font-satoshi font-medium"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2B6B7F] group-hover:w-full transition-all duration-300"></span>
              </a>
            ))}
            
            {/* Language Dropdown */}
            <div className="relative" ref={langDropdownRef}>
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="text-gray-700 hover:text-gray-900 relative group transition-all duration-300 flex items-center font-satoshi font-medium"
              >
                {t('navbar.language')}
                <ChevronDown className={`h-5 w-5 ml-1 transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`} />
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2B6B7F] group-hover:w-full transition-all duration-300"></span>
              </button>
              {isLangOpen && (
                <div className="absolute left-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => changeLanguage('en')}
                    className={`block font-satoshi font-medium w-full text-left px-4 py-2 rounded-t-lg transition-all duration-200 transform hover:scale-105 hover:pl-5 ${
                      i18n.language === 'en' 
                        ? 'bg-[#2B6B7F] text-white' 
                        : 'text-gray-700'
                    }`}
                  >
                    {t('navbar.english')}
                  </button>
                  <button
                    onClick={() => changeLanguage('ar')}
                    className={`block font-satoshi font-medium w-full text-left px-4 py-2 rounded-b-lg transition-all duration-200 transform hover:scale-105 hover:pl-5 ${
                      i18n.language === 'ar' 
                        ? 'bg-[#2B6B7F] text-white' 
                        : 'text-gray-700'
                    }`}
                  >
                    {t('navbar.arabic')}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: CTA Button (Get Started / Sign In) */}
          <div className="hidden md:flex">
            <Link to="/auth">
              <button
                className="px-10 py-2.5 bg-[#D97843] text-[#F5F7FA] font-satoshi font-bold rounded-full cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_rgba(217,120,67,0.6)] hover:scale-105 active:scale-95"
              >
                {t('navbar.get_started')}
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden pr-2 flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-700 focus:outline-none p-2"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/80 backdrop-blur-lg shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="block text-gray-700 hover:text-[#2B6B7F] hover:bg-gray-50 px-3 py-2 rounded-md transition-all duration-300 font-medium font-satoshi"
                onClick={toggleMenu}
              >
                {item.label}
              </a>
            ))}
            
            {/* Language Dropdown for Mobile */}
            <div className="relative" ref={mobileLangDropdownRef}>
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="block text-gray-700 hover:text-[#2B6B7F] hover:bg-gray-50 px-3 py-2 rounded-md flex items-center transition-all duration-300 w-full font-medium font-satoshi"
              >
                {t('navbar.language')}
                <ChevronDown className={`h-5 w-5 ml-1 transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>
              {isLangOpen && (
                <div className="ml-3 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-xl">
                  <button
                    onClick={() => changeLanguage('en')}
                    className={`block w-full text-left px-4 py-2 rounded-t-lg transition-all duration-300 font-satoshi font-medium ${
                      i18n.language === 'en' 
                        ? 'bg-[#2B6B7F] text-white' 
                        : 'text-gray-700 hover:bg-[#2B6B7F] hover:text-white'
                    }`}
                  >
                    {t('navbar.english')}
                  </button>
                  <button
                    onClick={() => changeLanguage('ar')}
                    className={`block w-full text-left px-4 py-2 rounded-b-lg transition-all duration-300 font-satoshi font-medium ${
                      i18n.language === 'ar' 
                        ? 'bg-[#2B6B7F] text-white' 
                        : 'text-gray-700 hover:bg-[#2B6B7F] hover:text-white'
                    }`}
                  >
                    {t('navbar.arabic')}
                  </button>
                </div>
              )}
            </div>
            
            <Link to="/auth" className="block px-3">
              <button
                className="w-full mt-2 px-8 py-3 bg-[#D97843] text-[#F5F7FA] font-satoshi font-bold rounded-full transition-all duration-300 hover:shadow-[0_0_30px_rgba(217,120,67,0.6)] hover:scale-105 active:scale-95 cursor-pointer"
              >
                {t('navbar.get_started')}
              </button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
import React, { useState } from 'react';
import { ExternalLink, Github, Heart, Mail, FileText, Shield, Globe } from 'lucide-react';
import { LegalModal } from './LegalModal';
import { getTranslation } from '../constants/translations';

/**
 * Footer - 网站页脚组件（支持多语言）
 * 包含相关页面链接、法律条款、联系方式等
 */
export const Footer = React.memo(({ isDarkMode, language = 'en' }) => {
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalType, setLegalType] = useState('terms'); // 'terms' or 'privacy'

  const t = (key) => getTranslation(language, key);

  const openLegal = (type) => {
    setLegalType(type);
    setLegalModalOpen(true);
  };

  const currentYear = new Date().getFullYear();

  // 链接列表
  const productLinks = [
    {
      label: 'Nano Banana',
      href: 'https://nanobananapro.site',
      icon: Globe,
      external: true,
    },
    {
      label: 'GitHub',
      href: 'https://github.com/tkaptop/promptcraft',
      icon: Github,
      external: true,
    },
  ];

  const legalLinks = [
    {
      label: t('footer_terms'),
      onClick: () => openLegal('terms'),
      icon: FileText,
    },
    {
      label: t('footer_privacy'),
      onClick: () => openLegal('privacy'),
      icon: Shield,
    },
  ];

  return (
    <>
      <footer 
        className={`w-full border-t ${
          isDarkMode 
            ? 'bg-gradient-to-b from-gray-900/50 to-black/80 border-white/10' 
            : 'bg-gradient-to-b from-gray-50/80 to-white/90 border-gray-200/60'
        }`}
      >
        {/* Main Footer Content */}
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
            
            {/* Brand Section */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <img 
                  src="/Logo_icon.svg" 
                  alt="Banana Prompt" 
                  className="w-10 h-10"
                />
                <h3 className={`text-xl font-bold tracking-tight ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Banana Prompt
                </h3>
              </div>
              <p className={`text-sm leading-relaxed max-w-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {t('footer_brand_desc')}
              </p>
              <div className={`flex items-center gap-2 text-xs ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                <span>{t('footer_made_with')}</span>
                <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                <span>{t('footer_by')}</span>
                <a 
                  href="https://nanobananapro.site" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`font-medium hover:text-orange-500 transition-colors ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  nanobananapro.site
                </a>
              </div>
            </div>

            {/* Products & Resources */}
            <div className="space-y-4">
              <h4 className={`text-sm font-semibold uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {t('footer_resources')}
              </h4>
              <ul className="space-y-3">
                {productLinks.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group flex items-center gap-2 text-sm transition-colors ${
                        isDarkMode 
                          ? 'text-gray-400 hover:text-orange-400' 
                          : 'text-gray-600 hover:text-orange-600'
                      }`}
                    >
                      <link.icon className="w-4 h-4" />
                      <span>{link.label}</span>
                      {link.external && (
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="mailto:tanshilong@gmail.com"
                    className={`group flex items-center gap-2 text-sm transition-colors ${
                      isDarkMode 
                        ? 'text-gray-400 hover:text-orange-400' 
                        : 'text-gray-600 hover:text-orange-600'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    <span>{t('footer_contact_us')}</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h4 className={`text-sm font-semibold uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {t('footer_legal')}
              </h4>
              <ul className="space-y-3">
                {legalLinks.map((link, idx) => (
                  <li key={idx}>
                    <button
                      onClick={link.onClick}
                      className={`group flex items-center gap-2 text-sm transition-colors ${
                        isDarkMode 
                          ? 'text-gray-400 hover:text-orange-400' 
                          : 'text-gray-600 hover:text-orange-600'
                      }`}
                    >
                      <link.icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`border-t ${
          isDarkMode ? 'border-white/5' : 'border-gray-200/40'
        }`}>
          <div className="max-w-6xl mx-auto px-6 md:px-12 py-5">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className={`text-xs ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                © {currentYear} Banana Prompt. {t('footer_all_rights')}
              </p>
              
              <div className={`flex items-center gap-4 text-xs ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                <span>{t('footer_wechat_official')}：面壁者逻辑说</span>
                <span className={`w-1 h-1 rounded-full ${
                  isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                }`} />
                <span>WeChat: nanobana</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Legal Modal */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        type={legalType}
        isDarkMode={isDarkMode}
        language={language}
      />
    </>
  );
});

Footer.displayName = 'Footer';

export default Footer;

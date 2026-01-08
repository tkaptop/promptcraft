import React, { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTranslation } from '../constants/translations';
import { LEGAL_LAST_UPDATED, TERMS_SECTIONS, PRIVACY_SECTIONS } from '../content/legal';

/**
 * LegalModal - 展示法律条款的模态框（支持多语言UI，内容仅英文）
 * type: 'terms' | 'privacy'
 */
export const LegalModal = React.memo(({ isOpen, onClose, type, isDarkMode, language = 'en' }) => {
  const isTerms = type === 'terms';
  const contentRef = useRef(null);

  const t = (key) => getTranslation(language, key);

  const title = isTerms ? t('footer_terms') : t('footer_privacy');
  const lastUpdated = LEGAL_LAST_UPDATED;

  // 打开时滚动到顶部
  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [isOpen, type]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Container - 使用 flexbox 居中 */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
              style={{
                background: isDarkMode
                  ? 'linear-gradient(180deg, #1f1f1f 0%, #171717 100%)'
                  : 'linear-gradient(180deg, #ffffff 0%, #f8f8f8 100%)',
              }}
            >
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b ${
              isDarkMode ? 'border-white/10' : 'border-gray-200'
            }`}>
              <div>
                <h2 className={`text-xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {title}
                </h2>
                <p className={`text-xs mt-1 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {t('legal_last_updated')}: {lastUpdated}
                </p>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-xl transition-colors ${
                  isDarkMode
                    ? 'hover:bg-white/10 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div 
              ref={contentRef}
              className={`flex-1 overflow-y-auto px-6 py-6 custom-scrollbar ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              {isTerms ? <TermsContent isDarkMode={isDarkMode} /> : <PrivacyContent isDarkMode={isDarkMode} />}
            </div>

            {/* Footer */}
            <div className={`px-6 py-4 border-t ${
              isDarkMode ? 'border-white/10' : 'border-gray-200'
            }`}>
              <button
                onClick={onClose}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  isDarkMode
                    ? 'bg-white/10 hover:bg-white/20 text-white'
                    : 'bg-gray-900 hover:bg-gray-800 text-white'
                }`}
              >
                {t('legal_i_understand')}
              </button>
            </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
});

LegalModal.displayName = 'LegalModal';

/**
 * Terms of Service Content (English Only)
 */
const TermsContent = ({ isDarkMode }) => {
  const headingClass = `text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`;
  const paragraphClass = `text-sm leading-relaxed mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`;
  const listClass = `list-disc list-inside text-sm leading-relaxed mb-4 space-y-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`;

  return (
    <div className="space-y-6">
      {TERMS_SECTIONS.map((sec) => (
        <section key={sec.title}>
          <h3 className={headingClass}>{sec.title}</h3>
          {sec.paragraphs?.map((p, idx) => (
            <p key={idx} className={paragraphClass}>
              {p}
            </p>
          ))}
          {sec.bullets?.length ? (
            <ul className={listClass}>
              {sec.bullets.map((b) => (
                <li key={b}>
                  {b.startsWith('Website:') ? (
                    <>
                      Website:{' '}
                      <a
                        href="https://nanobananapro.site"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-500 hover:underline"
                      >
                        nanobananapro.site
                      </a>
                    </>
                  ) : (
                    b
                  )}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </div>
  );
};

/**
 * Privacy Policy Content (English Only)
 */
const PrivacyContent = ({ isDarkMode }) => {
  const headingClass = `text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`;
  const paragraphClass = `text-sm leading-relaxed mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`;
  const listClass = `list-disc list-inside text-sm leading-relaxed mb-4 space-y-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`;

  return (
    <div className="space-y-6">
      {PRIVACY_SECTIONS.map((sec) => (
        <section key={sec.title}>
          <h3 className={headingClass}>{sec.title}</h3>
          {sec.paragraphs?.map((p, idx) => (
            <p key={idx} className={paragraphClass}>
              {p}
            </p>
          ))}
          {sec.bullets?.length ? (
            <ul className={listClass}>
              {sec.bullets.map((b) => (
                <li key={b}>
                  {b.startsWith('Website:') ? (
                    <>
                      Website:{' '}
                      <a
                        href="https://nanobananapro.site"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-500 hover:underline"
                      >
                        nanobananapro.site
                      </a>
                    </>
                  ) : (
                    b
                  )}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </div>
  );
};

export default LegalModal;

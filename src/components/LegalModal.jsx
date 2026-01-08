import React, { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTranslation } from '../constants/translations';

/**
 * LegalModal - 展示法律条款的模态框（支持多语言UI，内容仅英文）
 * type: 'terms' | 'privacy'
 */
export const LegalModal = React.memo(({ isOpen, onClose, type, isDarkMode, language = 'en' }) => {
  const isTerms = type === 'terms';
  const contentRef = useRef(null);

  const t = (key) => getTranslation(language, key);

  const title = isTerms ? t('footer_terms') : t('footer_privacy');
  const lastUpdated = 'January 8, 2026';

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
      <section>
        <h3 className={headingClass}>1. Acceptance of Terms</h3>
        <p className={paragraphClass}>
          By accessing and using Banana Prompt ("the Service"), you accept and agree to be bound by these Terms of Service. 
          If you do not agree to these terms, please do not use the Service.
        </p>
      </section>

      <section>
        <h3 className={headingClass}>2. Description of Service</h3>
        <p className={paragraphClass}>
          Banana Prompt is a free AI image prompt library and management tool designed to work with Nano Banana 
          and other AI image generation platforms. The Service provides:
        </p>
        <ul className={listClass}>
          <li>Curated AI image prompt templates</li>
          <li>Variable-based prompt customization</li>
          <li>One-click copy functionality</li>
          <li>Template sharing capabilities</li>
          <li>Local data storage for user customizations</li>
        </ul>
      </section>

      <section>
        <h3 className={headingClass}>3. User Conduct</h3>
        <p className={paragraphClass}>
          When using Banana Prompt, you agree not to:
        </p>
        <ul className={listClass}>
          <li>Use the Service for any unlawful purpose or in violation of any applicable laws</li>
          <li>Create or share prompts that generate harmful, abusive, or inappropriate content</li>
          <li>Attempt to interfere with or disrupt the Service or its infrastructure</li>
          <li>Misrepresent your identity or affiliation with any person or organization</li>
          <li>Violate the intellectual property rights of others</li>
        </ul>
      </section>

      <section>
        <h3 className={headingClass}>4. Intellectual Property</h3>
        <p className={paragraphClass}>
          The Service, including its original content, features, and functionality, is owned by Banana Prompt 
          and is protected by international copyright, trademark, and other intellectual property laws. 
          User-created templates and customizations remain the property of their respective creators.
        </p>
      </section>

      <section>
        <h3 className={headingClass}>5. Third-Party Services</h3>
        <p className={paragraphClass}>
          Banana Prompt is designed to work with Nano Banana and other third-party AI image generation services. 
          Your use of these third-party services is subject to their respective terms and conditions. 
          We are not responsible for the content generated by these platforms or their availability.
        </p>
      </section>

      <section>
        <h3 className={headingClass}>6. Data Storage</h3>
        <p className={paragraphClass}>
          All user data, including custom templates and settings, is stored locally in your browser. 
          We do not store your data on our servers. You are responsible for backing up your data. 
          We are not liable for any data loss resulting from browser data clearing or device issues.
        </p>
      </section>

      <section>
        <h3 className={headingClass}>7. Disclaimer of Warranties</h3>
        <p className={paragraphClass}>
          The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. 
          We do not warrant that the Service will be uninterrupted, secure, or error-free. 
          Use of the Service is at your own risk.
        </p>
      </section>

      <section>
        <h3 className={headingClass}>8. Limitation of Liability</h3>
        <p className={paragraphClass}>
          In no event shall Banana Prompt, its operators, or affiliates be liable for any indirect, incidental, 
          special, consequential, or punitive damages arising out of or related to your use of the Service.
        </p>
      </section>

      <section>
        <h3 className={headingClass}>9. Changes to Terms</h3>
        <p className={paragraphClass}>
          We reserve the right to modify these Terms of Service at any time. We will notify users of any material 
          changes by posting the new terms on the Service. Your continued use of the Service after such modifications 
          constitutes your acceptance of the updated terms.
        </p>
      </section>

      <section>
        <h3 className={headingClass}>10. Contact Information</h3>
        <p className={paragraphClass}>
          If you have any questions about these Terms of Service, please contact us at:
        </p>
        <ul className={listClass}>
          <li>Website: <a href="https://nanobananapro.site" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">nanobananapro.site</a></li>
          <li>WeChat: nanobana</li>
          <li>WeChat Official Account: 面壁者逻辑说</li>
        </ul>
      </section>
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
      <section>
        <h3 className={headingClass}>1. Introduction</h3>
        <p className={paragraphClass}>
          Banana Prompt ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains 
          how we collect, use, and safeguard your information when you use our Service.
        </p>
      </section>

      <section>
        <h3 className={headingClass}>2. Information We Collect</h3>
        <p className={paragraphClass}>
          We are designed with privacy in mind. Here's what you should know:
        </p>
        <ul className={listClass}>
          <li><strong>Local Storage Only:</strong> All your templates, settings, and customizations are stored 
          locally in your browser's IndexedDB and localStorage. This data never leaves your device.</li>
          <li><strong>No Account Required:</strong> You can use Banana Prompt without creating an account or 
          providing any personal information.</li>
          <li><strong>Analytics:</strong> We use Vercel Analytics to collect anonymous usage data such as page 
          views and basic device information to improve the Service. This data cannot identify individual users.</li>
        </ul>
      </section>

      <section>
        <h3 className={headingClass}>3. How We Use Information</h3>
        <p className={paragraphClass}>
          The anonymous analytics data we collect is used to:
        </p>
        <ul className={listClass}>
          <li>Understand how users interact with the Service</li>
          <li>Identify and fix bugs or performance issues</li>
          <li>Improve the user experience and develop new features</li>
          <li>Monitor the overall health of the Service</li>
        </ul>
      </section>

      <section>
        <h3 className={headingClass}>4. Data Sharing</h3>
        <p className={paragraphClass}>
          We do not sell, trade, or otherwise transfer your information to third parties. Since your data is stored 
          locally on your device, we do not have access to your templates, prompts, or customizations.
        </p>
        <p className={paragraphClass}>
          When you choose to share a template, the template data is temporarily processed to generate a shareable 
          link. This data is not stored permanently on our servers.
        </p>
      </section>

      <section>
        <h3 className={headingClass}>5. Third-Party Services</h3>
        <p className={paragraphClass}>
          Our Service integrates with third-party services:
        </p>
        <ul className={listClass}>
          <li><strong>Nano Banana:</strong> When you click "Copy and Generate", you are redirected to Nano Banana's 
          platform. Their privacy policy applies to your use of their service.</li>
          <li><strong>Vercel:</strong> We use Vercel for hosting and analytics. Vercel's privacy policy applies 
          to the anonymous analytics data collected.</li>
          <li><strong>GitHub:</strong> Our source code is hosted on GitHub. Their privacy policy applies if you 
          visit our repository.</li>
        </ul>
      </section>

      <section>
        <h3 className={headingClass}>6. Cookies and Local Storage</h3>
        <p className={paragraphClass}>
          We use browser storage technologies to:
        </p>
        <ul className={listClass}>
          <li><strong>IndexedDB:</strong> Store your templates, word banks, and large datasets locally</li>
          <li><strong>localStorage:</strong> Store your preferences, settings, and UI state</li>
        </ul>
        <p className={paragraphClass}>
          You can clear this data at any time through your browser settings or the "Clear Data" option in the 
          Service's settings.
        </p>
      </section>

      <section>
        <h3 className={headingClass}>7. Data Security</h3>
        <p className={paragraphClass}>
          Since your data is stored locally on your device, you are responsible for its security. We recommend:
        </p>
        <ul className={listClass}>
          <li>Keeping your browser and operating system updated</li>
          <li>Using the "Export All" feature to create backups of your templates</li>
          <li>Being cautious when sharing your device with others</li>
        </ul>
      </section>

      <section>
        <h3 className={headingClass}>8. Children's Privacy</h3>
        <p className={paragraphClass}>
          Our Service is not directed to children under 13. We do not knowingly collect personal information from 
          children under 13. If you are a parent or guardian and believe your child has provided us with personal 
          information, please contact us.
        </p>
      </section>

      <section>
        <h3 className={headingClass}>9. Your Rights</h3>
        <p className={paragraphClass}>
          Because your data is stored locally, you have full control over it:
        </p>
        <ul className={listClass}>
          <li><strong>Access:</strong> View all your data through the Service</li>
          <li><strong>Export:</strong> Download your templates as JSON files</li>
          <li><strong>Delete:</strong> Use "Clear All Data" to remove all stored data</li>
          <li><strong>Portability:</strong> Export and import your data freely</li>
        </ul>
      </section>

      <section>
        <h3 className={headingClass}>10. Changes to This Policy</h3>
        <p className={paragraphClass}>
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the 
          new Privacy Policy on this page and updating the "Last updated" date.
        </p>
      </section>

      <section>
        <h3 className={headingClass}>11. Contact Us</h3>
        <p className={paragraphClass}>
          If you have any questions about this Privacy Policy, please contact us at:
        </p>
        <ul className={listClass}>
          <li>Website: <a href="https://nanobananapro.site" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">nanobananapro.site</a></li>
          <li>WeChat: nanobana</li>
          <li>WeChat Official Account: 面壁者逻辑说</li>
        </ul>
      </section>
    </div>
  );
};

export default LegalModal;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Copy,
  Palette,
  Zap,
  MousePointerClick,
  ArrowRight,
  ChevronDown,
  Image as ImageIcon,
  Wand2,
  Rocket,
  Users,
  Layers,
  Globe,
  Shield
} from 'lucide-react';
import { getTranslation, ensureSEO } from '../constants/translations';

/**
 * SEOContent - Landing page SEO sections for Banana Prompt
 * Designed to appear after the hero/discovery view
 */
export const SEOContent = React.memo(({ isDarkMode, language = 'en', onExploreClick }) => {
  const [openFaq, setOpenFaq] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [, forceUpdate] = useState(0);

  // Load SEO translations on mount and language change
  useEffect(() => {
    let mounted = true;
    ensureSEO(language).then(() => {
      if (mounted) {
        setIsLoaded(true);
        forceUpdate(n => n + 1); // Force re-render after translations loaded
      }
    });
    return () => { mounted = false; };
  }, [language]);

  // Helper function to get translation
  const t = (key) => getTranslation(language, `seo_${key}`);

  const features = [
    {
      icon: Zap,
      title: t('feature1_title'),
      desc: t('feature1_desc'),
      gradient: 'from-orange-500 to-amber-500',
      shadowColor: 'shadow-orange-500/25',
      bgGlow: 'bg-orange-500/10',
    },
    {
      icon: Palette,
      title: t('feature2_title'),
      desc: t('feature2_desc'),
      gradient: 'from-pink-500 to-rose-500',
      shadowColor: 'shadow-pink-500/25',
      bgGlow: 'bg-pink-500/10',
    },
    {
      icon: Copy,
      title: t('feature3_title'),
      desc: t('feature3_desc'),
      gradient: 'from-blue-500 to-cyan-500',
      shadowColor: 'shadow-blue-500/25',
      bgGlow: 'bg-blue-500/10',
    },
    {
      icon: ImageIcon,
      title: t('feature4_title'),
      desc: t('feature4_desc'),
      gradient: 'from-purple-500 to-violet-500',
      shadowColor: 'shadow-purple-500/25',
      bgGlow: 'bg-purple-500/10',
    },
    {
      icon: Users,
      title: t('feature5_title'),
      desc: t('feature5_desc'),
      gradient: 'from-emerald-500 to-teal-500',
      shadowColor: 'shadow-emerald-500/25',
      bgGlow: 'bg-emerald-500/10',
    },
    {
      icon: Layers,
      title: t('feature6_title'),
      desc: t('feature6_desc'),
      gradient: 'from-indigo-500 to-blue-500',
      shadowColor: 'shadow-indigo-500/25',
      bgGlow: 'bg-indigo-500/10',
    },
  ];

  const steps = [
    {
      num: '01',
      icon: MousePointerClick,
      title: t('step1_title'),
      desc: t('step1_desc'),
    },
    {
      num: '02',
      icon: Wand2,
      title: t('step2_title'),
      desc: t('step2_desc'),
    },
    {
      num: '03',
      icon: Rocket,
      title: t('step3_title'),
      desc: t('step3_desc'),
    },
  ];

  const faqs = [
    { q: t('faq1_q'), a: t('faq1_a') },
    { q: t('faq2_q'), a: t('faq2_a') },
    { q: t('faq3_q'), a: t('faq3_a') },
    { q: t('faq4_q'), a: t('faq4_a') },
    { q: t('faq5_q'), a: t('faq5_a') },
    { q: t('faq6_q'), a: t('faq6_a') },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  // Don't render until translations are loaded
  if (!isLoaded) {
    return null;
  }

  return (
    <div className={`w-full overflow-hidden ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
      {/* Decorative gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className={`absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl ${isDarkMode ? 'bg-orange-500/5' : 'bg-orange-500/10'}`} />
        <div className={`absolute top-3/4 -right-32 w-96 h-96 rounded-full blur-3xl ${isDarkMode ? 'bg-amber-500/5' : 'bg-amber-500/10'}`} />
      </div>

      {/* Section 1: What is Banana Prompt */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="py-20 md:py-32 px-6 md:px-12 lg:px-20 relative"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div variants={itemVariants} className="flex items-center gap-4 mb-8">
            <div className={`relative p-3 rounded-2xl ${isDarkMode ? 'bg-gradient-to-br from-orange-500/20 to-amber-500/10' : 'bg-gradient-to-br from-orange-100 to-amber-50'}`}>
              <div className={`absolute inset-0 rounded-2xl ${isDarkMode ? 'bg-orange-500/20' : 'bg-orange-500/10'} blur-xl`} />
              <Sparkles className="relative w-7 h-7 text-orange-500" />
            </div>
            <h2 className={`text-3xl md:text-5xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('what_is_title')}
            </h2>
          </motion.div>
          <motion.div variants={itemVariants} className="space-y-6">
            <p className={`text-lg md:text-xl leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('what_is_p1')}
            </p>
            <p className={`text-lg md:text-xl leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('what_is_p2')}
            </p>
            <p className={`text-lg md:text-xl leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('what_is_p3')}
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Section 2: Features */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className={`py-20 md:py-32 px-6 md:px-12 lg:px-20 relative ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gradient-to-b from-orange-50/50 to-transparent'}`}
      >
        {/* Section background decoration */}
        <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-b from-orange-500/[0.02] to-transparent' : ''}`} />

        <div className="max-w-6xl mx-auto relative">
          <motion.h2
            variants={itemVariants}
            className={`text-3xl md:text-5xl font-black text-center mb-16 tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            {t('features_title')}
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -4 }}
                className={`group relative p-8 rounded-3xl border backdrop-blur-sm transition-all duration-500 ${
                  isDarkMode
                    ? 'bg-gradient-to-br from-white/[0.05] to-white/[0.02] border-white/10 hover:border-orange-500/40'
                    : 'bg-white/80 border-gray-200/80 hover:border-orange-300 hover:shadow-2xl hover:shadow-orange-500/10'
                }`}
              >
                {/* Hover glow effect */}
                <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${feature.bgGlow} blur-2xl -z-10`} />

                {/* Icon container with gradient */}
                <div className={`relative inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 shadow-lg ${feature.shadowColor}`}>
                  <feature.icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>

                <h3 className={`text-xl md:text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {feature.title}
                </h3>
                <p className={`text-base leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Section 3: How It Works */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="py-20 md:py-32 px-6 md:px-12 lg:px-20 relative overflow-hidden"
      >
        <div className="max-w-5xl mx-auto">
          <motion.h2
            variants={itemVariants}
            className={`text-3xl md:text-5xl font-black text-center mb-20 tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            {t('how_it_works_title')}
          </motion.h2>

          <div className="relative">
            {/* Connection line - desktop */}
            <div className={`hidden md:block absolute top-[60px] left-[20%] right-[20%] h-1 rounded-full ${
              isDarkMode
                ? 'bg-gradient-to-r from-transparent via-orange-500/50 to-transparent'
                : 'bg-gradient-to-r from-transparent via-orange-400/60 to-transparent'
            }`}>
              {/* Animated pulse on the line */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-400 to-transparent animate-pulse opacity-50" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
              {steps.map((step, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="relative flex flex-col items-center text-center"
                >
                  {/* Step circle with glow */}
                  <div className="relative mb-8">
                    {/* Outer glow ring */}
                    <div className={`absolute inset-0 rounded-full blur-xl ${
                      isDarkMode ? 'bg-orange-500/30' : 'bg-orange-400/40'
                    }`} style={{ transform: 'scale(1.5)' }} />

                    {/* Main circle */}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`relative z-10 w-[120px] h-[120px] rounded-full flex items-center justify-center ${
                        isDarkMode
                          ? 'bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 shadow-2xl shadow-orange-500/40'
                          : 'bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 shadow-2xl shadow-orange-500/30'
                      }`}
                      style={{
                        boxShadow: isDarkMode
                          ? '0 0 60px rgba(249, 115, 22, 0.3), inset 0 2px 20px rgba(255,255,255,0.2)'
                          : '0 0 60px rgba(249, 115, 22, 0.25), inset 0 2px 20px rgba(255,255,255,0.3)'
                      }}
                    >
                      <step.icon className="w-12 h-12 text-white" strokeWidth={1.5} />
                    </motion.div>

                    {/* Step number badge */}
                    <div className={`absolute -top-2 -right-2 z-20 px-3 py-1.5 rounded-full text-sm font-black tracking-wider ${
                      isDarkMode
                        ? 'bg-gray-900 text-orange-400 border border-orange-500/30'
                        : 'bg-white text-orange-600 shadow-lg border border-orange-200'
                    }`}>
                      {step.num}
                    </div>
                  </div>

                  <h3 className={`text-xl md:text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {step.title}
                  </h3>
                  <p className={`text-base leading-relaxed max-w-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {step.desc}
                  </p>

                  {/* Arrow for mobile */}
                  {idx < steps.length - 1 && (
                    <div className="md:hidden my-8">
                      <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className={`w-8 h-8 rotate-90 ${isDarkMode ? 'text-orange-500' : 'text-orange-400'}`} />
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Section 4: FAQ */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className={`py-20 md:py-32 px-6 md:px-12 lg:px-20 ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gradient-to-b from-gray-50/80 to-transparent'}`}
      >
        <div className="max-w-3xl mx-auto">
          <motion.h2
            variants={itemVariants}
            className={`text-3xl md:text-5xl font-black text-center mb-16 tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            {t('faq_title')}
          </motion.h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-white/[0.03] border-white/10 hover:border-white/20'
                    : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
                } ${openFaq === idx ? (isDarkMode ? 'border-orange-500/30' : 'border-orange-300') : ''}`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className={`w-full flex items-center justify-between p-6 text-left transition-colors ${
                    isDarkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50/50'
                  }`}
                >
                  <span className={`font-semibold text-lg pr-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {faq.q}
                  </span>
                  <motion.div
                    animate={{ rotate: openFaq === idx ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex-shrink-0 p-2 rounded-full ${
                      openFaq === idx
                        ? (isDarkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600')
                        : (isDarkMode ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-500')
                    }`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: openFaq === idx ? 'auto' : 0,
                    opacity: openFaq === idx ? 1 : 0
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p className={`px-6 pb-6 text-base leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {faq.a}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Section 5: CTA */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="py-20 md:py-32 px-6 md:px-12 lg:px-20 relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-t from-orange-500/[0.03] to-transparent' : 'bg-gradient-to-t from-orange-50/50 to-transparent'}`} />

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.h2
            variants={itemVariants}
            className={`text-3xl md:text-5xl font-black mb-8 tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            {t('cta_title')}
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className={`text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
          >
            {t('cta_desc')}
          </motion.p>
          <motion.button
            variants={itemVariants}
            onClick={onExploreClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className={`group relative inline-flex items-center gap-4 px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 ${
              isDarkMode
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
            }`}
            style={{
              boxShadow: isDarkMode
                ? '0 20px 60px rgba(249, 115, 22, 0.4), 0 0 40px rgba(249, 115, 22, 0.2)'
                : '0 20px 60px rgba(249, 115, 22, 0.3), 0 0 40px rgba(249, 115, 22, 0.15)'
            }}
          >
            {/* Button inner glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-white/0 to-white/20 pointer-events-none" />

            <span className="relative">{t('cta_button')}</span>
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight className="relative w-6 h-6" />
            </motion.div>
          </motion.button>
        </div>
      </motion.section>
    </div>
  );
});

SEOContent.displayName = 'SEOContent';

export default SEOContent;

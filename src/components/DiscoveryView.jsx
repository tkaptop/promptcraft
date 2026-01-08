import React, { useState, useEffect, useRef } from 'react';
import {
  ImageIcon, ArrowUpRight
} from 'lucide-react';
import { getTemplateName } from '../utils/i18n';
import { getTranslation } from '../constants/translations';
import { Sidebar } from './Sidebar';
import { FireworkEffect } from './FireworkEffect';
import { SEOContent } from './SEOContent';
import { Footer } from './Footer';
import { FEATURE_FLAGS } from '../constants/featureFlags';
import { TAG_LABELS } from '../constants/styles';

/**
 * DiscoveryView 组件 - 瀑布流展示所有模板
 */
export const DiscoveryView = React.memo(({ 
  filteredTemplates,
  setActiveTemplateId,
  setDiscoveryView,
  setZoomedImage,
  posterScrollRef,
  setIsPosterAutoScrollPaused,
  currentMasonryStyle,
  AnimatedSlogan,
  isSloganActive = true,
  t,
  TAG_STYLES,
  displayTag,
  // Tools props
  handleRefreshSystemData,
  language,
  setLanguage,
  setIsSettingsOpen,
  isDarkMode,
  isSortMenuOpen,
  setIsSortMenuOpen,
  sortOrder,
  setSortOrder,
    setRandomSeed,
    globalContainerStyle,
    masonryStyleKey,
    themeMode,
    setThemeMode,
    templates,
    selectedTags,
    setSelectedTags,
    selectedLibrary,
    setSelectedLibrary,
    TEMPLATE_TAGS
  }) => {
    const [columnCount, setColumnCount] = useState(1);
    const [columnGap, setColumnGap] = useState(20); // Default to gap-5 (20px)
    const fireworkRef = useRef(null);
  
    useEffect(() => {
      const getColumnInfo = () => {
        const width = window.innerWidth;
        if (masonryStyleKey === 'poster') {
          return { count: width >= 1280 ? 3 : (width >= 640 ? 2 : 1), gap: 12 };
        } else if (masonryStyleKey === 'classic' || masonryStyleKey === 'minimal') {
          const count = width >= 1280 ? 4 : (width >= 1024 ? 3 : (width >= 640 ? 2 : 1));
          return { count, gap: 16 };
        } else if (masonryStyleKey === 'compact') {
          const count = width >= 1280 ? 5 : (width >= 1024 ? 4 : (width >= 640 ? 3 : 2));
          return { count, gap: 8 };
        } else if (masonryStyleKey === 'list') {
          return { count: 1, gap: 12 };
        }
        return { count: 1, gap: 12 };
      };
  
      const handleResize = () => {
        const info = getColumnInfo();
        setColumnCount(info.count);
        setColumnGap(info.gap);
      };
  
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, [masonryStyleKey]);
  
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  if (isMobile) {
    // ... 保持移动端逻辑不变
    return (
      <main
        className={`fixed inset-0 z-10 flex flex-col overflow-y-auto pb-32 md:pb-20 ${isDarkMode ? 'dark-gradient-bg' : 'mesh-gradient-bg'}`}
      >
        <div className="flex flex-col w-full min-h-full px-2 py-8 gap-6 pt-safe">
          {/* 1. 顶部 SVG 标题区域 */}
          <div className="w-full flex flex-col items-center px-4 gap-2">
            <h1 className="sr-only">{getTranslation(language, 'app_sr_title')}</h1>
            <img 
              src={isDarkMode ? "/Title_Dark.svg" : "/Title.svg"} 
              alt={getTranslation(language, 'app_sr_title')} 
              className="w-full max-w-[220px] h-auto"
            />
            <p className={`text-[10px] opacity-70 text-center px-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {getTranslation(language, 'app_subtitle')}
            </p>
          </div>

          {/* 2. 动态文字区 */}
          <div className="w-full scale-90 origin-center">
            <AnimatedSlogan isActive={isSloganActive} language={language} isDarkMode={isDarkMode} />
          </div>

          {/* 3. 图像展示（两列瀑布流） */}
          <section className="columns-2 gap-1 mt-2">
            {filteredTemplates.map(t_item => (
              <article 
                key={t_item.id}
                onClick={() => {
                  if (t_item.imageUrl) {
                    setZoomedImage(t_item.imageUrl);
                  } else {
                    setActiveTemplateId(t_item.id);
                    setDiscoveryView(false);
                  }
                }}
                className={`break-inside-avoid mb-1 w-full rounded-lg overflow-hidden shadow-sm border active:scale-[0.98] transition-all ${isDarkMode ? 'bg-[#2A2726] border-white/5' : 'bg-white border-gray-100'}`}
              >
                <div className="relative w-full bg-gray-50/5">
                  {t_item.imageUrl ? (
                    <img
                      src={t_item.imageUrl}
                      alt={getTemplateName(t_item.id, t_item, language)} 
                      className="w-full h-auto block"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full aspect-[4/3] flex items-center justify-center text-gray-300">
                      <ImageIcon size={48} strokeWidth={1} />
                    </div>
                  )}
                  {/* Title Overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6 rounded-b-lg">
                    <h3 className="text-white font-bold text-[10px] truncate">{getTemplateName(t_item.id, t_item, language)}</h3>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </div>
      </main>
    );
  }

  // Scroll to top handler for CTA button
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main
      className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden"
    >
      {/* Hero Section - First Screen (100vh, independent scroll for waterfall) */}
      <div className="h-screen flex-shrink-0 flex items-stretch gap-4">
      {/* Middle Side: Categories Sidebar (Desktop Only) - 注释掉，之后版本启用 */}
      {/* {!isMobile && (
        <div 
          style={{
            width: '160px',
            height: '100%',
            borderRadius: '24px',
            border: '1px solid transparent',
            backgroundImage: isDarkMode 
              ? 'linear-gradient(180deg, #3B3B3B 0%, #242120 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%)'
              : 'linear-gradient(180deg, #FAF5F1 0%, #F6EBE6 100%), linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
          }}
                  className="hidden lg:flex flex-col flex-shrink-0 pt-12 pb-8 px-4 gap-8 overflow-y-auto categories-scrollbar"
        >
          <div className="flex flex-col gap-4">
            <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] px-4 opacity-50 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {(language === 'zh' || language === 'cn') ? '库源' : 'Library'}
            </h3>
            <div className="flex flex-col gap-1.5">
              {[
                { id: 'all', cn: '全部', en: 'All' },
                { id: 'official', cn: '官方库', en: 'Official' },
                { id: 'personal', cn: '个人库', en: 'Personal' }
              ].map(lib => (
                <button
                  key={lib.id}
                  onClick={() => setSelectedLibrary(lib.id)}
                  className={`w-full text-left px-4 py-3 rounded-2xl transition-all duration-300 group ${
                    selectedLibrary === lib.id 
                      ? (isDarkMode ? 'bg-[#F97316] text-white shadow-[0_8px_20px_rgba(249,115,22,0.25)]' : 'bg-[#EA580C] text-white shadow-[0_8px_20px_rgba(234,88,12,0.2)]')
                      : (isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50/50')
                  }`}
                >
                  <span className={`text-sm font-bold ${selectedLibrary === lib.id ? 'translate-x-1' : 'group-hover:translate-x-1'} transition-transform inline-block`}>
                    {(language === 'zh' || language === 'cn') ? lib.cn : lib.en}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] px-4 opacity-50 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {(language === 'zh' || language === 'cn') ? '分类' : 'Categories'}
            </h3>
            <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => setSelectedTags("")}
                        className={`w-full text-left px-4 py-3 rounded-2xl transition-all duration-300 group ${
                          selectedTags === "" 
                            ? (isDarkMode ? 'bg-[#F97316] text-white shadow-[0_8px_20px_rgba(249,115,22,0.25)]' : 'bg-[#EA580C] text-white shadow-[0_8px_20px_rgba(234,88,12,0.2)]')
                            : (isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50/50')
                        }`}
                      >
                        <span className={`text-sm font-bold ${selectedTags === "" ? 'translate-x-1' : 'group-hover:translate-x-1'} transition-transform inline-block`}>
                          {(language === 'zh' || language === 'cn') ? '全部' : 'All'}
                        </span>
                      </button>
                      
                      {TEMPLATE_TAGS.map(tag => (
                        <button
                          key={tag}
                          onClick={() => setSelectedTags(tag)}
                          className={`w-full text-left px-4 py-3 rounded-2xl transition-all duration-300 group ${
                            selectedTags === tag 
                              ? (isDarkMode ? 'bg-[#F97316] text-white shadow-[0_8px_20px_rgba(249,115,22,0.25)]' : 'bg-[#EA580C] text-white shadow-[0_8px_20px_rgba(234,88,12,0.2)]')
                              : (isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50/50')
                          }`}
                        >
                          <span className={`text-sm font-bold ${selectedTags === tag ? 'translate-x-1' : 'group-hover:translate-x-1'} transition-transform inline-block`}>
                            {(language === 'zh' || language === 'cn') ? (TAG_LABELS.cn[tag] || tag) : (TAG_LABELS.en[tag] || tag)}
                          </span>
                        </button>
                      ))}
            </div>
          </div>
        </div>
      )} */}

      {/* Poster Content Container */}
      <div 
        style={globalContainerStyle}
        className="flex-1 flex flex-col overflow-hidden relative z-10 p-4 md:p-5 lg:pt-12 lg:pb-7 lg:px-7"
      >
          <div className="flex-1 flex flex-col lg:flex-row gap-6 lg:gap-8 xl:gap-12 overflow-hidden pb-4 lg:pb-8 pt-0 px-2 lg:px-6">
              {/* Left Side: Logo & Slogan */}
              <header className="flex flex-col justify-center items-center lg:items-start lg:w-[280px] xl:w-[320px] flex-shrink-0 px-4 lg:pl-6 lg:pr-2 gap-6">
                  <div className="w-full max-w-[320px] scale-75 sm:scale-85 lg:scale-90 xl:scale-100 origin-center lg:origin-left flex flex-col gap-3">
                      <h1 className="sr-only">{getTranslation(language, 'app_sr_title')}</h1>
                      <img 
                          src={isDarkMode ? "/Title_Dark.svg" : "/Title.svg"} 
                          alt={getTranslation(language, 'app_sr_title')} 
                          className="w-full h-auto"
                      />
                      <p className={`text-xs lg:text-sm font-medium leading-relaxed opacity-80 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {getTranslation(language, 'app_description')}
                      </p>
                  </div>
                  <div className="w-full scale-90 lg:scale-95 xl:scale-100 origin-center lg:origin-left">
                    <AnimatedSlogan isActive={isSloganActive} language={language} isDarkMode={isDarkMode} />
                  </div>
              </header>

              {/* Right Side: Waterfall Grid */}
              <section 
                  ref={posterScrollRef}
                  className="flex-1 overflow-y-auto overflow-x-visible pr-2 lg:pr-4 scroll-smooth poster-scrollbar will-change-scroll"
                  onMouseEnter={() => setIsPosterAutoScrollPaused(true)}
                  onMouseLeave={() => setIsPosterAutoScrollPaused(false)}
              >
                  <div className="h-full w-full py-4 lg:py-6 px-2 lg:px-4">
                      <div className={`flex w-full ${masonryStyleKey === 'list' ? 'flex-col' : ''}`} style={{ gap: `${columnGap}px` }}>
                          {Array.from({ length: columnCount }).map((_, colIndex) => (
                              <div key={colIndex} className="flex-1 flex flex-col" style={{ gap: `${columnGap}px` }}>
                                  {filteredTemplates
                                      .filter((_, index) => index % columnCount === colIndex)
                                      .map(t_item => (
                                          <article 
                                              key={t_item.id}
                                              onClick={() => {
                                                  if (t_item.imageUrl) {
                                                      setZoomedImage(t_item.imageUrl);
                                                  } else {
                                                      setActiveTemplateId(t_item.id);
                                                      setDiscoveryView(false);
                                                  }
                                              }}
                                              className={`cursor-pointer group transition-shadow duration-300 relative overflow-hidden rounded-xl isolate border-2 hover:shadow-[0_0_15px_rgba(251,146,60,0.35)] will-change-transform ${isDarkMode ? 'border-white/10' : 'border-white'}`}
                                          >
                                              <div className={`relative w-full overflow-hidden rounded-lg ${isDarkMode ? 'bg-[#2A2726]' : 'bg-gray-100'}`} style={{ transform: 'translateZ(0)' }}>
                                                  {t_item.imageUrl ? (
                                                      <img
                                                          src={t_item.imageUrl}
                                                          alt={getTemplateName(t_item.id, t_item, language)} 
                                                          className="w-full h-auto object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                                                          referrerPolicy="no-referrer"
                                                          loading="lazy"
                                                      />
                                                  ) : (
                                                  <div className="w-full aspect-[3/4] bg-gray-100/5 flex items-center justify-center text-gray-300">
                                                      <ImageIcon size={32} />
                                                  </div>
                                              )}
                                              
                                              {/* Hover Overlay: Bottom Glass Mask */}
                                              <div className="absolute inset-x-0 bottom-0 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-[opacity,transform] duration-500 ease-out z-20 rounded-b-xl overflow-hidden">
                                                  <div className={`backdrop-blur-md border-t py-4 px-6 shadow-2xl rounded-b-xl ${isDarkMode ? 'bg-black/60 border-white/10' : 'bg-white/40 border-white/40'}`}>
                                                      <h3 className={`font-bold text-base leading-snug text-center ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                                                          {getTemplateName(t_item.id, t_item, language)}
                                                      </h3>
                                                  </div>
                                              </div>
                                          </div>
                                      </article>
                                  ))}
                              </div>
                          ))}
                      </div>
                  </div>
              </section>
          </div>

          {/* Bottom Bar: New Year Firework Trigger */}
          {FEATURE_FLAGS.ENABLE_NEW_YEAR_FIREWORKS && (
            <div className="mt-auto flex items-center justify-center px-8 py-6 relative z-20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fireworkRef.current?.start();
                }}
                className="transition-all duration-300 transform hover:scale-110 active:scale-95 outline-none"
                title="新年烟花秀"
              >
                <img src="/2026.png" alt="2026 烟花秀" className="h-10 md:h-12 w-auto" />
              </button>
            </div>
          )}
      </div>
      </div>
      {/* End of Hero Section */}

      {/* SEO Content Sections */}
      <SEOContent
        isDarkMode={isDarkMode}
        language={language}
        onExploreClick={scrollToTop}
      />

      {/* Footer */}
      <Footer
        isDarkMode={isDarkMode}
        language={language}
      />

      <FireworkEffect
        ref={fireworkRef}
        onStart={() => {
          // 播放烟花时自动切换到暗夜模式
          if (setThemeMode) setThemeMode('dark');
        }}
      />
    </main>
  );
});

DiscoveryView.displayName = 'DiscoveryView';

import React, { useState } from 'react';
import { GithubIcon } from './icons/GithubIcon';
import { HomeIcon } from './icons/HomeIcon';
import { ListIcon } from './icons/ListIcon';
import { OrderIcon } from './icons/OrderIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { TranslateIcon } from './icons/TranslateIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { SunDimIcon } from './icons/SunDimIcon';
import { SunMoonIcon } from './icons/SunMoonIcon';
import { MoonIcon } from './icons/MoonIcon';
import { GalleryIcon } from './icons/GalleryIcon';
import { SUPPORTED_LANGUAGES } from '../constants/translations';

/**
 * Sidebar 组件 - 通用侧边导航栏
 */
export const Sidebar = ({
  activeTab = 'home', // 'home' | 'details' | 'settings'
  onHome,
  onDetail,
  onSettings,
  onShowcase,
  // Sort props
  isSortMenuOpen,
  setIsSortMenuOpen,
  sortOrder,
  setSortOrder,
  setRandomSeed,
  // Actions
  onRefresh,
  // I18n
  language,
  setLanguage,
  // Theme
  isDarkMode,
  themeMode,
  setThemeMode,
  t
}) => {
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const supportedNanoLocales = new Set(["en", "zh", "ko", "ja", "es", "de", "fr", "ru", "ar", "pt", "it"]);
  // 统一的容器样式
  const containerStyle = isDarkMode ? {
    width: '62px',
    borderRadius: '16px',
    border: '1px solid transparent',
    backgroundImage: 'linear-gradient(180deg, #3B3B3B 0%, #242120 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%)',
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box',
  } : {
    width: '62px',
    borderRadius: '16px',
    // 使用渐变背景 + 渐变描边技巧 (解决 border-radius 与 border-image 冲突)
    border: '1px solid transparent',
    backgroundImage: 'linear-gradient(180deg, #FAF5F1 0%, #F6EBE6 100%), linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%)',
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box',
  };

  return (
    <aside 
      style={containerStyle}
      className="relative flex flex-col justify-between items-center py-8 mr-4 flex-shrink-0 h-[calc(100dvh-32px)] sticky top-4"
    >
      
      {/* 上部分：Logo + 导航按钮 */}
      <div className="flex flex-col items-center gap-8 w-full">
        {/* Logo */}
        <div className="mt-4 mb-2">
          <img src="/Logo_icon.svg" alt="Banana Prompt - AI Prompt Management Tool" className="w-9 h-9" />
        </div>

        {/* 导航按钮组 */}
        <div className="flex flex-col items-center gap-6">
          <button 
            onClick={onHome}
            className={`p-2 group transition-colors ${activeTab === 'home' ? (isDarkMode ? 'text-[#FB923C]' : 'text-[#EA580C]') : (isDarkMode ? 'text-[#8E9196]' : 'text-[#6B7280]')} hover:text-[#F97316]`}
            title="主页"
          >
            <HomeIcon size={24} />
          </button>
          
          <button 
            onClick={onDetail}
            className={`p-2 group transition-colors ${activeTab === 'details' ? (isDarkMode ? 'text-[#FB923C]' : 'text-[#EA580C]') : (isDarkMode ? 'text-[#8E9196]' : 'text-[#6B7280]')} hover:text-[#F97316]`}
            title="详情页"
          >
            <ListIcon size={24} />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
              className={`p-2 group transition-colors ${isSortMenuOpen ? (isDarkMode ? 'text-[#FB923C]' : 'text-[#EA580C]') : (isDarkMode ? 'text-[#8E9196]' : 'text-[#6B7280]')} hover:text-[#F97316]`}
              title={t('sort')}
            >
              <OrderIcon size={24} />
            </button>
            
            {isSortMenuOpen && (
              <div className={`absolute left-full ml-4 bottom-0 backdrop-blur-xl rounded-2xl shadow-2xl border py-2 min-w-[160px] z-[110] animate-in slide-in-from-left-2 duration-200 ${isDarkMode ? 'bg-black/80 border-white/10' : 'bg-white/95 border-white/60'}`}>
                {[
                  { value: 'newest', label: t('sort_newest') },
                  { value: 'oldest', label: t('sort_oldest') },
                  { value: 'a-z', label: t('sort_az') },
                  { value: 'z-a', label: t('sort_za') },
                  { value: 'random', label: t('sort_random') }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortOrder(option.value);
                      if (option.value === 'random') setRandomSeed(Date.now());
                      setIsSortMenuOpen(false);
                    }}
                    className={`w-full text-left px-5 py-2.5 text-sm transition-colors ${sortOrder === option.value ? 'text-orange-600 font-semibold' : (isDarkMode ? 'text-gray-400 hover:bg-white/10' : 'text-gray-700 hover:bg-orange-50')}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={onRefresh}
            className={`p-2 group transition-colors ${isDarkMode ? 'text-[#8E9196]' : 'text-[#6B7280]'} hover:text-[#F97316]`}
            title={t('refresh_desc')}
          >
            <RefreshIcon size={24} />
          </button>

          <button 
            onClick={() => {
              if (onShowcase) return onShowcase();
              const resolvedNanoLocale = ((language === "zh" || language === "cn") ? "zh" : language);
              const nanoLocale = supportedNanoLocales.has(resolvedNanoLocale) ? resolvedNanoLocale : "";
              const base = nanoLocale
                ? `https://www.nanobananapro.site/${nanoLocale}`
                : "https://www.nanobananapro.site";
              const targetUrl = `${base.replace(/\/+$/, '')}/prompts`;
              window.open(targetUrl, "_blank", "noopener,noreferrer");
            }}
            className={`
              relative p-2.5 rounded-xl transition-all duration-200
              hover:scale-[1.06] active:scale-[0.97]
              ${isDarkMode
                ? 'bg-gradient-to-b from-orange-500/95 to-red-500/80 text-white shadow-[0_10px_22px_rgba(249,115,22,0.22)] hover:shadow-[0_14px_30px_rgba(249,115,22,0.32)]'
                : 'bg-gradient-to-b from-orange-500 to-orange-600 text-white shadow-[0_10px_22px_rgba(234,88,12,0.25)] hover:shadow-[0_14px_30px_rgba(234,88,12,0.32)]'}
            `}
            title={(language === 'zh' || language === 'cn') ? 'Showcase大全' : 'Showcase'}
          >
            <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${isDarkMode ? 'bg-white' : 'bg-white'} shadow`} />
            <GalleryIcon size={26} />
          </button>
        </div>
      </div>

      {/* 下部分：设置组 */}
      <div className="flex flex-col items-center gap-6 w-full">
        <div className="relative">
          <button
            onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
            className={`p-2 group transition-colors ${isLanguageMenuOpen ? (isDarkMode ? 'text-[#FB923C]' : 'text-[#EA580C]') : (isDarkMode ? 'text-[#8E9196]' : 'text-[#6B7280]')} hover:text-[#F97316]`}
            title={t('language')}
          >
            <TranslateIcon size={24} />
          </button>

          {isLanguageMenuOpen && (
            <div className={`absolute left-full ml-4 bottom-0 backdrop-blur-xl rounded-2xl shadow-2xl border py-2 min-w-[140px] z-[110] animate-in slide-in-from-left-2 duration-200 ${isDarkMode ? 'bg-black/80 border-white/10' : 'bg-white/95 border-white/60'}`}>
              {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => (
                <button
                  key={code}
                  onClick={() => {
                    setLanguage(code);
                    setIsLanguageMenuOpen(false);
                  }}
                  className={`w-full text-left px-5 py-2.5 text-sm transition-colors ${language === code ? 'text-orange-600 font-semibold' : (isDarkMode ? 'text-gray-400 hover:bg-white/10' : 'text-gray-700 hover:bg-orange-50')}`}
                >
                  {lang.nativeName}
                </button>
              ))}
            </div>
          )}
        </div>

        <button 
          onClick={() => {
            if (themeMode === 'light') setThemeMode('dark');
            else if (themeMode === 'dark') setThemeMode('system');
            else setThemeMode('light');
          }}
          className={`p-2 group relative transition-colors ${isDarkMode ? 'text-[#8E9196]' : 'text-[#6B7280]'} hover:text-[#F97316]`}
          title={themeMode === 'system' ? 'Follow System' : (themeMode === 'dark' ? 'Dark Mode' : 'Light Mode')}
        >
          {themeMode === 'system' ? (
            <SunMoonIcon size={24} />
          ) : (themeMode === 'dark' ? <MoonIcon size={24} /> : <SunDimIcon size={24} />)}
          
          {themeMode === 'system' && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
          )}
        </button>
        
        <button 
          onClick={onSettings}
          className={`p-2 group transition-colors ${activeTab === 'settings' ? (isDarkMode ? 'text-[#FB923C]' : 'text-[#EA580C]') : (isDarkMode ? 'text-[#8E9196]' : 'text-[#6B7280]')} hover:text-[#F97316]`}
          title={t('settings')}
        >
          <SettingsIcon size={24} />
        </button>
        
        <a 
          href="https://github.com/tkaptop/promptcraft" 
          target="_blank" 
          rel="noopener noreferrer"
          className={`p-2 transition-colors ${isDarkMode ? 'text-[#8E9196]' : 'text-[#6B7280]'} hover:text-[#F97316]`}
          title="Github"
        >
          <GithubIcon size={24} />
        </a>
      </div>
    </aside>
  );
};

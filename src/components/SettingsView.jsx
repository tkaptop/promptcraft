import React, { useState } from 'react';
import {
  Globe, Database, Download, Upload,
  Trash2, Mail, MessageCircle, Github,
  ChevronRight, RefreshCw, FolderOpen, X, Heart, ChevronDown,
  Shield, FileText, ExternalLink
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../constants/translations';
import { LegalModal } from './LegalModal';

export const SettingsView = ({ 
  language, setLanguage, 
  storageMode, setStorageMode,
  directoryHandle,
  handleImportTemplate, handleExportAllTemplates,
  handleResetSystemData, handleClearAllData,
  handleSelectDirectory, handleSwitchToLocalStorage,
  SYSTEM_DATA_VERSION, t,
  globalContainerStyle,
  isDarkMode,
  themeMode,
  setThemeMode
}) => {
  const [showWechatQR, setShowWechatQR] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [storageStats, setStorageStats] = React.useState(null);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalType, setLegalType] = useState('terms');

  const openLegal = (type) => {
    setLegalType(type);
    setLegalModalOpen(true);
  };

  React.useEffect(() => {
    if (storageMode === 'browser' && navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(estimate => {
        setStorageStats({
          usage: estimate.usage,
          quota: estimate.quota,
          percent: Math.round((estimate.usage / estimate.quota) * 100) || 0
        });
      });
    }
  }, [storageMode]);
  
  const updateLogs = (language === 'zh' || language === 'cn') ? [
    { 
      version: 'V0.7.1', 
      date: '2026年1月7日', 
      time: '10:00 AM',
      title: '存储架构升级与系统维护',
      type: 'MAJOR',
      content: [
        '💾 存储架构升级：核心数据（模板、词库、分类）迁移至 IndexedDB，彻底解决 LocalStorage 5MB 限制。',
        '🛠️ 系统维护：暂时下线“智能词条”功能，优化内部存储稳定性。',
        '🆙 版本号更新：全站同步升级至 V0.7.1，包含元数据优化。'
      ]
    },
    { 
      version: 'V0.7.0', 
      date: '2026年1月3日', 
      time: '11:30 AM',
      title: '导出稳定性与统计功能增强',
      type: 'MAJOR',
      content: [
        '新增 Vercel Analytics 集成，实时掌握应用访问动态。',
        '导出功能重大升级：支持短链接动态二维码，长链接自动降级至官网二维码。',
        '移动端预览优化：图片预览全面支持暗色模式，视觉交互更沉浸。',
        '导出稳定性增强：引入图片 Base64 预缓存与 CORS 智能代理。',
        'UI 细节优化：重构导出按钮布局，美化操作文案与交互体验。'
      ]
    },
    { 
      version: 'V0.6.5', 
      date: '2025年12月31日', 
      time: '10:00 AM',
      title: '数据版本大更新与系统优化',
      type: 'MAJOR',
      content: [
        '新增模版链接分享：支持生成公开分享链接，实现模版跨用户快速流转。',
        '数据版本升级至 V0.7.6：全面更新预置提示词库，新增多项创意模版。',
        '系统架构微调：优化数据持久化逻辑，提升海量数据下的读取速度。',
        '多端同步增强：完善了移动端与桌面端的数据同步校验机制。',
        'UI 细节微调：修复了暗色模式下部分边框显示异常的问题。'
      ]
    },
    { 
      version: 'V0.6.1', 
      date: '2025年12月26日', 
      time: '11:00 AM',
      title: '联动组逻辑修复与版本升级',
      type: 'UPDATE',
      content: [
        '修复了联动组匹配过于宽松的 Bug，现在仅限相同组号联动。',
        '全站版本号同步升级至 V0.6.1，包含浏览器标题及各处 UI 标识。',
        '优化了暗色模式下的部分图标对比度及 UI 细节。'
      ]
    },
    { 
      version: 'V0.6.0', 
      date: '2025年12月24日', 
      time: '02:00 PM',
      title: '暗夜模式与视觉体验升级',
      type: 'NEW',
      content: [
        '新增暗夜模式（Dark Mode）：全局深度适配，支持一键切换沉浸式黑色主题。',
        'UI 细节优化：重构了标签、图标及按钮的视觉反馈，提升高对比度下的舒适度。',
        '性能增强：优化了长列表模版过滤逻辑，确保切换不同分类时的极致流畅。'
      ]
    },
    { 
      version: 'V0.5.1', 
      date: '2025年12月22日', 
      time: '10:30 AM',
      title: '移动端交互重构与视觉升级',
      type: 'NEW',
      content: [
        '全新移动端架构：引入侧滑抽屉（Drawer）交互，优化单手操作体验。',
        '沉浸式预览：针对手机端重新设计图片预览，支持 3D 陀螺仪视觉反馈与全屏手势操作。',
        '性能飞跃：首页引入高性能 Mesh Gradient 算法彻底解决背景闪烁，海报滚动升级至 60FPS。',
        '细节打磨：重写核心图标提升高分屏清晰度，优化数据迁移逻辑支持无损升级。'
      ]
    },
    { 
      version: 'V0.5.0', 
      date: '2025年12月20日', 
      time: '04:15 PM',
      title: '发现页瀑布流与架构重构',
      type: 'MAJOR',
      content: [
        '架构重构：完成巨型应用组件化解耦，大幅提升代码维护性与资源调度效率。',
        '新增发现页：基于 Masonry 布局的瀑布流门户，支持海量精美模版快速浏览。',
        '导出增强：宽度提升至 860px 适配复杂排版，优化长图拼接清晰度。',
        '版本感知：新增模版/应用双重版本校验，支持云端更新实时无损同步。'
      ]
    },
    { 
      version: 'V0.4.1', 
      date: '2025年12月12日', 
      time: '09:00 AM',
      title: '导出优化与交互细节提升',
      type: 'UPDATE',
      content: [
        '存储优化：导出格式改为 JPG（92% 质量），文件体积减小 60-70%。',
        '智能氛围：引入氛围色提取算法，自动根据模版图片生成高级背景。',
        '交互升级：移动端导入模版全面采用 Toast 通知替代 alert。',
        '导出稳定性：彻底解决了导出时正文内容可能遗漏的问题。'
      ]
    },
    { 
      version: 'V0.4.0', 
      date: '2025年12月10日', 
      time: '11:00 AM',
      title: '模版体验与持久化增强',
      type: 'UPDATE',
      content: [
        '模版系统：新增瀑布流展示与标签过滤，支持导入/导出（Beta）。',
        '数据安全：默认本地化保存模版与词库，支持刷新预设并保留用户数据。',
        '工程优化：支持上传本地图片或 URL 替换模版预览图。'
      ]
    },
    { 
      version: 'V0.3.0', 
      date: '2025年12月08日', 
      time: '02:00 PM',
      title: 'UI 规范化与功能说明完善',
      type: 'UPDATE',
      content: [
        'UI 升级：采用统一的 Premium Button 设计语言，增加悬停渐变动效。',
        '全屏预览：引入 Lightbox 全屏图片预览模式，支持查看海报细节。',
        '文档完善：重构分步骤使用指南，新增图像管理与使用技巧说明。'
      ]
    },
    { 
      version: 'V0.2.0', 
      date: '2025年12月05日', 
      time: '10:00 AM',
      title: '导出功能与响应式适配',
      type: 'UPDATE',
      content: [
        '功能新增：增加模版导出高清长图分享功能。',
        '高度自定义：开放自定义分类颜色配置，优化视觉清晰度。',
        '布局优化：全面优化桌面端与移动端的响应式布局适配。'
      ]
    },
    { 
      version: 'V0.1.0', 
      date: '2024年11月20日', 
      time: '09:00 AM',
      title: '初始版本发布',
      type: 'UPDATE',
      content: [
        '核心引擎：实现基于 {{variable}} 语法的结构化 Prompt 引擎。',
        '基础功能：支持模版创建、词库管理及变量填空交互系统。',
        '数据持久化：建立基于 LocalStorage 的本地存储方案。'
      ]
    }
  ] : [
    { 
      version: 'V0.7.1', 
      date: 'Jan 7, 2026', 
      time: '10:00 AM',
      title: 'Storage Upgrade & Maintenance',
      type: 'MAJOR',
      content: [
        '💾 Storage Upgrade: Migrated core data (templates, banks) to IndexedDB, overcoming the 5MB LocalStorage limit.',
        '🛠️ Maintenance: Temporarily disabled AI Terms feature and optimized internal storage stability.',
        '🆙 Version Bump: Synchronized to V0.7.1 with metadata optimizations.'
      ]
    },
    { 
      version: 'V0.7.0', 
      date: 'Jan 3, 2026', 
      time: '11:30 AM',
      title: 'Export Stability & Analytics',
      type: 'MAJOR',
      content: [
        'Integrated Vercel Analytics for real-time app usage insights.',
        'Major Export Upgrade: Support for dynamic short-link QR codes.',
        'Mobile Preview Upgrade: Full Dark Mode support for immersive experience.',
        'Export Stability: Added Base64 pre-caching and CORS proxy fallback.',
        'UI Refinement: Improved desktop action buttons and mobile interaction layout.'
      ]
    },
    { 
      version: 'V0.6.5', 
      date: 'Dec 31, 2025', 
      time: '10:00 AM',
      title: 'Data Milestone & System Optimization',
      type: 'MAJOR',
      content: [
        'Template Link Sharing: Support for generating public sharing links for quick template distribution.',
        'Data upgraded to V0.7.6: Comprehensive update to preset banks and new creative templates.',
        'Architecture refinement: Optimized persistence logic for faster data loading.',
        'Cross-device enhancement: Improved data sync validation between mobile and desktop.',
        'UI Fixes: Resolved minor border rendering issues in Dark Mode.'
      ]
    },
    { 
      version: 'V0.6.1', 
      date: 'Dec 26, 2025', 
      time: '11:00 AM',
      title: 'Linkage Group Fix & Version Bump',
      type: 'UPDATE',
      content: [
        'Fixed bug where linkage groups were too loose; now only same groupId syncs.',
        'Synchronized versioning to V0.6.1 across the entire app.',
        'Optimized icon contrast and minor UI details in Dark Mode.'
      ]
    },
    { 
      version: 'V0.6.0', 
      date: 'Dec 24, 2025', 
      time: '02:00 PM',
      title: 'Dark Mode & Visual Upgrade',
      type: 'NEW',
      content: [
        'Added Dark Mode support with system-wide adaptation.',
        'Refined UI components for better clarity and comfort in dark themes.',
        'Improved performance for template list filtering.'
      ]
    },
    { 
      version: 'V0.5.1', 
      date: 'Dec 22, 2025', 
      time: '10:30 AM',
      title: 'Mobile Interaction Refactor',
      type: 'NEW',
      content: [
        'New mobile architecture with drawer interactions.',
        'Immersive preview with gyroscope feedback and full-screen gestures.',
        'Mesh Gradient integration to fix background flickering on low-end devices.',
        'Redrawn core icons for better clarity on high-DPI screens.'
      ]
    },
    { 
      version: 'V0.5.0', 
      date: 'Dec 20, 2025', 
      time: '04:15 PM',
      title: 'Discovery View & Performance',
      type: 'MAJOR',
      content: [
        'Added Discovery View with Masonry layout for better template browsing.',
        'Enhanced export options with custom ratios and improved clarity.',
        'Refactored LocalStorage logic for real-time multi-tab synchronization.',
        'Improved English localizations and fixed UI alignment issues.'
      ]
    },
    { 
      version: 'V0.4.1', 
      date: 'Dec 12, 2025', 
      time: '09:00 AM',
      title: 'Export & UX Improvements',
      type: 'UPDATE',
      content: [
        'Exported JPG format (92% quality), reducing file size by 60-70%.',
        'Automatic atmosphere background extraction from template images.',
        'Mobile import now uses Toast notifications instead of alerts.',
        'Fixed stability issues during long image exports.'
      ]
    },
    { 
      version: 'V0.4.0', 
      date: 'Dec 10, 2025', 
      time: '11:00 AM',
      title: 'Templates & Persistence',
      type: 'UPDATE',
      content: [
        'New Discovery View with masonry layout and tag filtering.',
        'Improved data persistence with system preset merging.',
        'Support for local file and URL image uploads.'
      ]
    },
    { 
      version: 'V0.3.0', 
      date: 'Dec 08, 2025', 
      time: '02:00 PM',
      title: 'UI & Documentation',
      type: 'UPDATE',
      content: [
        'Premium Button design language with hover animations.',
        'Lightbox mode for full-screen image preview.',
        'Complete user guide refactor with step-by-step instructions.'
      ]
    },
    { 
      version: 'V0.2.0', 
      date: 'Dec 05, 2025', 
      time: '10:00 AM',
      title: 'Export & Responsive Design',
      type: 'UPDATE',
      content: [
        'Added high-definition long image export for sharing.',
        'Customizable category colors for better visual organization.',
        'Comprehensive responsive layout optimizations.'
      ]
    },
    { 
      version: 'V0.1.0', 
      date: 'Nov 20, 2024', 
      time: '09:00 AM',
      title: 'Initial Release',
      type: 'UPDATE',
      content: [
        'Structured Prompt engine with {{variable}} syntax.',
        'Template management and variable-based fill-in interaction.',
        'LocalStorage-based data persistence solution.'
      ]
    }
  ];

  const SettingSection = ({ title, children }) => (
    <div className="mb-8">
      <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 px-1 ${isDarkMode ? 'text-gray-600' : 'text-gray-500'}`}>
        {title}
      </h3>
      <div className="flex flex-col gap-1">
        {children}
      </div>
    </div>
  );

  const SettingItem = ({ icon: Icon, label, value, onClick, disabled = false, danger = false, active = false, description = null }) => (
    <button 
      disabled={disabled}
      onClick={onClick}
      className={`group flex items-center justify-between p-2.5 rounded-xl transition-all duration-200 ${disabled ? 'opacity-30 cursor-not-allowed' : active ? (isDarkMode ? 'bg-orange-500/20' : 'bg-orange-500/10') : (isDarkMode ? 'hover:bg-white/5 active:scale-[0.98]' : 'hover:bg-orange-500/5 active:scale-[0.98]')}`}
    >
      <div className="flex-1 flex items-center gap-3 min-w-0">
        <div className={`flex-shrink-0 transition-colors duration-200 ${danger ? 'text-red-500 group-hover:text-red-600' : active ? 'text-orange-600' : (isDarkMode ? 'text-gray-600 group-hover:text-orange-400' : 'text-gray-500 group-hover:text-orange-500')}`}>
          <Icon size={16} strokeWidth={2} />
        </div>
        <div className="flex flex-col items-start min-w-0">
          <div className={`text-[12px] font-bold tracking-tight truncate ${danger ? 'text-red-600' : active ? 'text-orange-600' : (isDarkMode ? 'text-gray-400 group-hover:text-gray-200' : 'text-gray-800')}`}>
            {label}
          </div>
          {description && (
            <div className={`text-[10px] mt-0.5 opacity-60 truncate max-w-[200px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {description}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {value && <span className={`text-[9px] font-black uppercase tracking-wider ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>{value}</span>}
        {!disabled && <ChevronRight size={12} className={`transition-colors ${active ? 'text-orange-300' : 'text-gray-300 group-hover:text-orange-300'}`} />}
      </div>
    </button>
  );

  return (
    <div style={globalContainerStyle} className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Header Area - Parallel Titles */}
      <div className="px-10 pt-12 pb-6 flex-shrink-0 flex items-end">
        <div className="w-[35%] pr-10">
          <h1 className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('settings')}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className={`text-[9px] font-black tracking-[0.1em] uppercase ${isDarkMode ? 'text-gray-600' : 'text-gray-500'}`}>
              System V0.7.1
            </span>
            <div className={`w-1 h-1 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
            <span className="text-[9px] font-black text-orange-500/80 tracking-[0.1em] uppercase">
              Data {SYSTEM_DATA_VERSION}
            </span>
          </div>
        </div>
        <div className="flex-1 ml-20">
          <h2 className={`text-3xl font-black tracking-tight flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
             {t('latest_updates')}
          </h2>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex-1 flex overflow-hidden px-10 pb-10">
        
        {/* Left: Settings Area (35%) */}
        <div className="w-[35%] overflow-y-auto custom-scrollbar pr-10 flex flex-col">
          <div className="flex-1">
            <SettingSection title={t('preferences')}>
              <div className="flex items-center gap-2 p-2.5">
                <div className={`flex-shrink-0 transition-colors duration-200 ${isDarkMode ? 'text-gray-600' : 'text-gray-500'}`}>
                  <Globe size={16} strokeWidth={2} />
                </div>
                <span className={`text-[12px] font-bold tracking-tight shrink-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>
                  {t('language')}
                </span>
                <div className="ml-auto relative">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className={`appearance-none text-[11px] font-bold px-3 py-1.5 pr-7 rounded-lg cursor-pointer transition-colors ${isDarkMode ? 'bg-white/10 text-gray-300 hover:bg-white/15' : 'bg-orange-50 text-gray-700 hover:bg-orange-100'}`}
                  >
                    {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => (
                      <option key={code} value={code}>{lang.nativeName}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
              </div>
              <div className="flex items-center gap-2 p-2.5">
                <span className={`text-[12px] font-bold tracking-tight shrink-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>
                  {t('appearance')}
                </span>
                <div className={`premium-toggle-container ${isDarkMode ? 'dark' : 'light'} ml-auto scale-[0.85] origin-right`}>
                  {[
                    { id: 'light', label: t('theme_light') },
                    { id: 'dark', label: t('theme_dark') },
                    { id: 'system', label: t('theme_auto') }
                  ].map(mode => (
                    <button
                      key={mode.id}
                      onClick={() => setThemeMode(mode.id)}
                      className={`premium-toggle-item ${isDarkMode ? 'dark' : 'light'} ${themeMode === mode.id ? 'is-active' : ''}`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>
            </SettingSection>

            <SettingSection title={t('storage')}>
              <div className="flex flex-col gap-1">
                <SettingItem
                  icon={Database}
                  label={t('browser_storage')}
                  description={t('indexeddb_mode')}
                  active={storageMode === 'browser'}
                  onClick={handleSwitchToLocalStorage}
                />
                {storageMode === 'browser' && storageStats && (
                  <div className="px-3 mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-[9px] font-bold ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                        {t('storage_used')}
                      </span>
                      <span className={`text-[9px] font-bold ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                        {(storageStats.usage / 1024 / 1024).toFixed(1)}MB / {(storageStats.quota / 1024 / 1024 / 1024).toFixed(1)}GB
                      </span>
                    </div>
                    <div className={`h-1 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                      <div 
                        className="h-full bg-orange-500/50 transition-all duration-500" 
                        style={{ width: `${Math.max(1, storageStats.percent)}%` }}
                      />
                    </div>
                  </div>
                )}
                
                <SettingItem
                  icon={FolderOpen}
                  label={t('local_folder')}
                  description={storageMode === 'folder' && directoryHandle ? `${t('local_folder')}: /${directoryHandle.name}` : t('auto_save_to_folder')}
                  active={storageMode === 'folder'}
                  onClick={handleSelectDirectory}
                />
              </div>
            </SettingSection>

            <SettingSection title={t('templates')}>
              <div className="relative group">
                <label className="cursor-pointer">
                  <input type="file" accept=".json" onChange={handleImportTemplate} className="hidden" />
                  <div className={`group flex items-center justify-between p-2.5 rounded-xl transition-all duration-200 ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-orange-500/5'}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <Download size={16} className={`transition-colors flex-shrink-0 ${isDarkMode ? 'text-gray-600 group-hover:text-orange-400' : 'text-gray-500 group-hover:text-orange-500'}`} />
                      <span className={`text-[12px] font-bold truncate ${isDarkMode ? 'text-gray-400 group-hover:text-gray-200' : 'text-gray-700'}`}>{t('import_json')}</span>
                    </div>
                    <ChevronRight size={12} className="text-gray-300 group-hover:text-orange-300 flex-shrink-0" />
                  </div>
                </label>
              </div>
              <SettingItem
                icon={Upload}
                label={t('export_all')}
                onClick={handleExportAllTemplates}
              />
              <SettingItem
                icon={RefreshCw}
                label={t('reset_system')}
                onClick={handleResetSystemData}
              />
              <SettingItem
                icon={Trash2}
                label={t('clear_all')}
                danger={true}
                onClick={handleClearAllData}
              />
            </SettingSection>

            <SettingSection title={t('about')}>
              <SettingItem
                icon={Heart}
                label={t('credits')}
                onClick={() => setShowCredits(true)}
              />
              <SettingItem
                icon={Mail}
                label={t('feedback_email')}
                onClick={() => window.location.href = 'mailto:tanshilong@gmail.com'}
              />
              <SettingItem
                icon={MessageCircle}
                label={t('wechat')}
                onClick={() => setShowWechatQR(true)}
              />
              <SettingItem
                icon={Github}
                label="GitHub Open Source"
                onClick={() => window.open('https://github.com/tkaptop/promptcraft', '_blank')}
              />
              <SettingItem
                icon={ExternalLink}
                label="Nano Banana"
                description="nanobananapro.site"
                onClick={() => window.open('https://nanobananapro.site', '_blank')}
              />
            </SettingSection>

            <SettingSection title={t('footer_legal')}>
              <SettingItem
                icon={FileText}
                label={t('footer_terms')}
                onClick={() => openLegal('terms')}
              />
              <SettingItem
                icon={Shield}
                label={t('footer_privacy')}
                onClick={() => openLegal('privacy')}
              />
            </SettingSection>
          </div>

          {/* Manifesto Text */}
          <div className="mt-8 px-1">
            <p className="text-[12px] font-black text-orange-600 leading-relaxed">
              {t('manifesto_text')}
            </p>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className={`w-[1.5px] my-8 ${isDarkMode ? 'bg-white/5' : 'bg-gray-200/80'}`} />

        {/* Right: Update Logs Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar ml-20 pr-4 space-y-12">
          {updateLogs.map((log, idx) => (
            <div key={idx} className="flex gap-8 group">
              {/* Timeline Left */}
              <div className="w-32 flex-shrink-0 pt-1 text-right">
                <div className={`text-[13px] font-black ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>{log.date}</div>
                <div className={`text-[10px] font-bold tabular-nums mb-1 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>{log.time}</div>
                <div className="text-[11px] font-black text-orange-500/80 tracking-widest">{log.version}</div>
              </div>

              {/* Timeline Center */}
              <div className="relative flex flex-col items-center">
                <div className={`w-[1.5px] h-full absolute top-4 group-last:hidden ${isDarkMode ? 'bg-white/5' : 'bg-gray-200'}`} />
                <div className={`w-2.5 h-2.5 rounded-full border-2 border-orange-500 z-10 shadow-[0_0_8px_rgba(249,115,22,0.2)] ${isDarkMode ? 'bg-[#242120]' : 'bg-white'}`} />
              </div>

              {/* Timeline Right */}
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className={`text-lg font-black tracking-tight ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{log.title}</h3>
                  {idx === 0 && (
                    <span className="px-1.5 py-0.5 text-[8px] font-black bg-orange-500 text-white rounded uppercase tracking-wider">
                      {t('latest')}
                    </span>
                  )}
                </div>
                
                <ul className="space-y-2">
                  {log.content.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                      <p className={`text-[13px] leading-relaxed font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                        {item}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WeChat QR Popover */}
      {showWechatQR && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setShowWechatQR(false)}
        >
          <div 
            className={`p-8 rounded-[32px] shadow-2xl border relative animate-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-[#242120] border-white/5 shadow-black/50' : 'bg-white border-white/60'}`}
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowWechatQR(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex flex-col items-center">
              <div className={`w-48 h-48 rounded-2xl overflow-hidden mb-4 border p-2 ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                <img 
                  src="/Wechat.jpg" 
                  alt="WeChat QR Code" 
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <p className={`text-sm font-black mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('wechat_scan_to_add')}</p>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>{t('wechat_connect')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Credits Popover */}
      {showCredits && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setShowCredits(false)}
        >
          <div 
            className={`p-10 rounded-[40px] shadow-2xl border relative animate-in zoom-in-95 duration-300 max-w-xl ${isDarkMode ? 'bg-[#242120] border-white/5 shadow-black/50' : 'bg-white border-white/60'}`}
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowCredits(false)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-orange-500 transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${isDarkMode ? 'bg-orange-500/10' : 'bg-orange-50'}`}>
                <Heart size={32} className="text-orange-500 fill-orange-500" />
              </div>
              
              <h3 className={`text-2xl font-black mb-6 tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {t('credits_title')}
              </h3>

              <div className={`space-y-6 text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <p className="font-bold text-orange-600">
                  {t('credits_based_on')}
                </p>

                <p>
                  {t('credits_thanks')}
                  <br />
                  <span className={`font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                    TanShilongMario (@tanshilong)
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legal Modal */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        type={legalType}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

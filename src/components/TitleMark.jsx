import React from 'react';
import { getTranslation } from '../constants/translations';

/**
 * TitleMark
 * - Replaces the static Title.svg/Title_Dark.svg so the headline can be i18n'd.
 * - Keeps a similar "bold brand + highlighted brace word" look, but is fully text-based.
 */
export const TitleMark = React.memo(({ language = 'en', isDarkMode = false, className = '' }) => {
  const t = (key) => getTranslation(language, key);

  return (
    <div className={className}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div
            className={`text-[38px] sm:text-[44px] lg:text-[48px] leading-[0.92] font-black tracking-tight ${
              isDarkMode ? 'text-gray-100' : 'text-gray-900'
            }`}
          >
            Banana
          </div>

          <div className="mt-2 flex flex-wrap items-end gap-x-2 gap-y-1">
            <span
              className={`text-[30px] sm:text-[32px] lg:text-[36px] leading-[1.05] font-black tracking-tight ${
                isDarkMode ? 'text-gray-100' : 'text-gray-900'
              }`}
            >
              {t('hero_headline_left')}
            </span>
            <span className="text-[30px] sm:text-[32px] lg:text-[36px] leading-[1.05] font-black tracking-tight text-orange-500">
              {t('hero_headline_highlight')}
            </span>
            <span
              className={`text-[30px] sm:text-[32px] lg:text-[36px] leading-[1.05] font-black tracking-tight ${
                isDarkMode ? 'text-gray-100' : 'text-gray-900'
              }`}
            >
              {t('hero_headline_right')}
            </span>
          </div>
        </div>

        {/* Decorative vertical word (replaces the old vertical slab in the SVG) */}
        <div
          className={`shrink-0 text-[36px] sm:text-[42px] lg:text-[48px] leading-none font-black tracking-tight ${
            isDarkMode ? 'text-orange-400' : 'text-orange-500'
          }`}
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          aria-hidden="true"
        >
          {t('hero_vertical')}
        </div>
      </div>
    </div>
  );
});

TitleMark.displayName = 'TitleMark';



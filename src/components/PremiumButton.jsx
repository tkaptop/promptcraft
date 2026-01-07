// PremiumButton 组件 - 带渐变效果的高级按钮
import React from 'react';

export const PremiumButton = ({ 
  onClick, 
  children, 
  className = "", 
  active = false, 
  disabled = false, 
  title, 
  icon: Icon, 
  iconSize = 16,
  isDarkMode = false,
  justify = "center"
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        premium-button-outer 
        m-0 p-1
        ${isDarkMode ? 'dark' : 'light'} 
        ${active ? 'is-active' : ''}
        ${className.includes('size-lg') ? 'size-lg' : ''}
        ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      title={title}
    >
      <div className={`
        premium-button-inner 
        ${isDarkMode ? 'dark' : 'light'} 
        ${active ? 'is-active' : ''}
        ${className.includes('size-lg') ? 'size-lg' : ''}
        ${justify === 'start' ? '!justify-start !px-6' : ''}
        ${className.includes('rounded-2xl') ? '!rounded-[12px]' : ''}
        ${className.includes('rounded-xl') ? '!rounded-[8px]' : ''}
      `}>
        {Icon && <Icon size={iconSize} className={active ? 'text-white' : (isDarkMode ? 'text-gray-400' : 'text-gray-600')} />}
        {children && <span className={active ? 'text-white' : (isDarkMode ? 'text-gray-400' : 'text-gray-600')}>{children}</span>}
      </div>
    </button>
  );
};

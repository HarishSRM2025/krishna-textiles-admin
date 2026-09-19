'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/app/ThemeContext';

export default function ThemeToggle({ variant = 'header', className = '' }) {
  const { theme, toggleTheme, mounted } = useTheme();
  const isDark = theme === 'dark';

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-xl bg-slate-100 dark:bg-dark-850 border border-slate-200 dark:border-dark-700 animate-pulse ${className}`}
      />
    );
  }

  if (variant === 'sidebar') {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
          isDark
            ? 'bg-dark-850 hover:bg-dark-800 text-slate-300 border-dark-700/70 hover:text-white'
            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 hover:text-slate-900 shadow-sm'
        } ${className}`}
      >
        <div className="flex items-center space-x-2.5">
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600 transition-transform hover:-rotate-12" />
          )}
          <span>{isDark ? 'Light Theme' : 'Dark Theme'}</span>
        </div>
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
            isDark
              ? 'bg-dark-800 text-amber-400/90 border border-amber-400/20'
              : 'bg-slate-100 text-indigo-700 border border-indigo-200'
          }`}
        >
          {isDark ? 'Dark' : 'Light'}
        </span>
      </button>
    );
  }

  // Default: Header icon button
  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`relative p-2 rounded-xl border transition-all duration-200 flex items-center justify-center ${
        isDark
          ? 'bg-dark-850 hover:bg-dark-800 text-amber-400 border-dark-700 hover:border-amber-400/30'
          : 'bg-slate-100 hover:bg-slate-200 text-indigo-600 border-slate-200 hover:border-indigo-400/30'
      } ${className}`}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform duration-300 hover:rotate-90 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-300 hover:-rotate-12 text-indigo-600" />
      )}
    </button>
  );
}

'use client';

import { RefreshCw, ExternalLink } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Header({ title, subtitle, onRefresh, isRefreshing = false }) {
  return (
    <header className="h-20 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-b border-slate-200 dark:border-dark-700/60 px-8 flex items-center justify-between sticky top-0 z-30 transition-colors duration-200">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-3">
        {/* Light / Dark Mode Toggle */}
        <ThemeToggle />

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`p-2 rounded-xl bg-slate-100 dark:bg-dark-850 border border-slate-200 dark:border-dark-700 hover:bg-slate-200 dark:hover:bg-dark-800 text-slate-600 dark:text-slate-300 transition-all ${
              isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-brand-600 dark:text-brand-400' : ''}`} />
          </button>
        )}

        {/* Customer Store Link */}
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noreferrer"
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 dark:bg-brand-600/15 dark:hover:bg-brand-600/25 border border-brand-200 dark:border-brand-500/30 text-xs font-semibold text-brand-700 dark:text-brand-300 transition-colors"
        >
          <span>Storefront</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </header>
  );
}

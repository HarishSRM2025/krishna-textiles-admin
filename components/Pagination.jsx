'use client';

import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from 'lucide-react';

export default function Pagination({
  page = 1,
  totalPages = 1,
  totalItems = 0,
  limit = 10,
  onPageChange,
  itemName = 'entries',
}) {
  if (totalItems === 0) return null;

  const validTotalPages = Math.max(1, totalPages || Math.ceil(totalItems / limit));
  const currentPage = Math.min(Math.max(1, page), validTotalPages);

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(totalItems, currentPage * limit);

  // Calculate sliding window with maximum 5 visible page numbers
  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(validTotalPages, startPage + maxButtons - 1);

  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="px-6 py-4 border-t border-slate-200 dark:border-dark-700 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/60 dark:bg-dark-950/40 select-none">
      {/* Page Count Information */}
      <div className="text-xs text-slate-500 dark:text-slate-400">
        Showing <span className="font-bold text-slate-900 dark:text-white">{startItem}</span> to{' '}
        <span className="font-bold text-slate-900 dark:text-white">{endItem}</span> of{' '}
        <span className="font-bold text-slate-900 dark:text-white">{totalItems}</span> {itemName}
        <span className="ml-2 text-[11px] text-slate-400">
          (Page {currentPage} of {validTotalPages})
        </span>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center space-x-1 sm:space-x-1.5">
        {/* Instant First Button */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          title="First Page"
          className="p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-850 text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors shadow-xs"
        >
          <ChevronsLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Previous Button */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          title="Previous Page"
          className="p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-850 text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors shadow-xs"
        >
          <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Maximum 5 Page Numbers */}
        <div className="flex items-center space-x-1">
          {pageNumbers.map((p) => {
            const isActive = p === currentPage;
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`min-w-[32px] sm:min-w-[36px] h-8 sm:h-9 px-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25 border border-brand-600 scale-105'
                    : 'bg-white dark:bg-dark-850 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-800 border border-slate-200 dark:border-dark-700'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(Math.min(validTotalPages, currentPage + 1))}
          disabled={currentPage >= validTotalPages}
          title="Next Page"
          className="p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-850 text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors shadow-xs"
        >
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Instant Last Button */}
        <button
          onClick={() => onPageChange(validTotalPages)}
          disabled={currentPage >= validTotalPages}
          title="Last Page"
          className="p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-850 text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors shadow-xs"
        >
          <ChevronsRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
}

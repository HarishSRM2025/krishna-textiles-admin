'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Trash2, 
  X 
} from 'lucide-react';

const ModalContext = createContext({
  confirm: async () => false,
  alert: async () => {},
});

export function ModalProvider({ children }) {
  const [modalState, setModalState] = useState(null);

  const confirm = useCallback(({
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger',
  }) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        isConfirm: true,
        title,
        message,
        confirmText,
        cancelText,
        type,
        onConfirm: () => {
          setModalState(null);
          resolve(true);
        },
        onCancel: () => {
          setModalState(null);
          resolve(false);
        },
      });
    });
  }, []);

  const alertModal = useCallback(({
    title = 'Notification',
    message = '',
    confirmText = 'Understood',
    type = 'info',
  }) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        isConfirm: false,
        title,
        message,
        confirmText,
        cancelText: null,
        type,
        onConfirm: () => {
          setModalState(null);
          resolve();
        },
        onCancel: () => {
          setModalState(null);
          resolve();
        },
      });
    });
  }, []);

  const getIcon = (type, isConfirm) => {
    switch (type) {
      case 'danger':
        return isConfirm ? (
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0 shadow-inner">
            <Trash2 className="w-6 h-6" />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0 shadow-inner">
            <AlertCircle className="w-6 h-6" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-inner">
            <AlertTriangle className="w-6 h-6" />
          </div>
        );
      case 'success':
        return (
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-inner">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        );
      case 'info':
      default:
        return (
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 flex items-center justify-center shrink-0 shadow-inner">
            <Info className="w-6 h-6" />
          </div>
        );
    }
  };

  const getConfirmButtonClasses = (type) => {
    switch (type) {
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/25 border border-rose-600';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/25 border border-amber-600';
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 border border-emerald-600';
      case 'info':
      default:
        return 'bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/25 border border-brand-600';
    }
  };

  return (
    <ModalContext.Provider value={{ confirm, alert: alertModal }}>
      {children}

      {/* Confirmation / Alert Modal Dialog */}
      {modalState?.isOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              modalState.onCancel();
            }
          }}
        >
          <div className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-dark-700 w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Body */}
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                {getIcon(modalState.type, modalState.isConfirm)}
                <button
                  onClick={modalState.onCancel}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {modalState.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {modalState.message}
              </p>
            </div>

            {/* Modal Action Buttons */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-dark-800/60 border-t border-slate-200 dark:border-dark-700/80 flex items-center justify-end space-x-3">
              {modalState.isConfirm && (
                <button
                  type="button"
                  onClick={modalState.onCancel}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-700 transition-colors cursor-pointer"
                >
                  {modalState.cancelText || 'Cancel'}
                </button>
              )}
              <button
                type="button"
                autoFocus
                onClick={modalState.onConfirm}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${getConfirmButtonClasses(modalState.type)}`}
              >
                {modalState.confirmText || 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}

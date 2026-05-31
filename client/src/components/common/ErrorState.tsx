import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-950/20 dark:text-rose-400 mb-4 border border-rose-100 dark:border-rose-900/50">
        <AlertCircle size={32} />
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Something went wrong</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
        {message || 'An unexpected error occurred while processing your request. Please try again.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-600/10 hover:bg-violet-700 active:scale-95 transition-all cursor-pointer"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;

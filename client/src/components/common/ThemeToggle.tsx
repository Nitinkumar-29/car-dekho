import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { toggleDarkMode } from '../../store/uiSlice';

export const ThemeToggle: React.FC = () => {
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((state) => state.ui.darkMode);

  return (
    <button
      onClick={() => dispatch(toggleDarkMode())}
      className="p-2 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all border border-slate-200 dark:border-slate-800 hover:scale-105 cursor-pointer shadow-sm flex items-center justify-center"
      aria-label="Toggle Theme"
    >
      {darkMode ? (
        <Sun size={18} className="text-amber-500 transition-all" />
      ) : (
        <Moon size={18} className="text-indigo-600 transition-all" />
      )}
    </button>
  );
};

export default ThemeToggle;

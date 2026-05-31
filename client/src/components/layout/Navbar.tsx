import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass, History, Trash2, X, Sparkles, CheckCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setHistoryItemActive, clearHistory } from '../../store/recommendationSlice';
import { setStep } from '../../store/uiSlice';
import ThemeToggle from '../common/ThemeToggle';
import Container from './Container';
import { AnimatePresence, motion } from 'framer-motion';

export const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const history = useAppSelector((state) => state.recommendation.history);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleHistoryItemClick = (item: any) => {
    dispatch(setHistoryItemActive(item));
    dispatch(setStep(0)); // Reset step indicator
    setIsDrawerOpen(false);
    navigate('/results');
  };

  const handleClearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to clear your search history?')) {
      dispatch(clearHistory());
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80 transition-colors">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md shadow-violet-600/20 group-hover:scale-105 transition-transform duration-300">
                <Compass size={22} className="animate-spin-slow" />
              </div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 via-indigo-600 to-emerald-500 bg-clip-text text-transparent dark:from-violet-400 dark:to-emerald-400">
                CarFinder AI
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors hover:text-violet-600 dark:hover:text-violet-400 ${
                  location.pathname === '/' ? 'text-violet-600 dark:text-violet-400' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Home
              </Link>
              <Link
                to="/find-car"
                className={`text-sm font-medium transition-colors hover:text-violet-600 dark:hover:text-violet-400 ${
                  location.pathname === '/find-car' ? 'text-violet-600 dark:text-violet-400' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Find My Car
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-all hover:scale-105 cursor-pointer shadow-sm"
                title="Search History"
              >
                <History size={18} />
                {history.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-950">
                    {history.length}
                  </span>
                )}
              </button>

              <ThemeToggle />

              <Link
                to="/find-car"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-violet-600/10 hover:bg-violet-700 hover:shadow-violet-600/20 active:scale-95 transition-all"
              >
                <Sparkles size={14} />
                <span>Get Started</span>
              </Link>
            </div>
          </div>
        </Container>
      </header>

      {/* History Drawer Slider */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-black"
            />

            {/* Content Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-50 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <History className="text-violet-600 dark:text-violet-400" size={20} />
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">Search History</h2>
                </div>
                <div className="flex items-center gap-2">
                  {history.length > 0 && (
                    <button
                      onClick={handleClearHistory}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-950 rounded-lg transition-colors cursor-pointer"
                      title="Clear History"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                {history.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 dark:bg-slate-900/50 dark:text-slate-600">
                      <History size={28} />
                    </div>
                    <h3 className="mt-4 font-bold text-slate-800 dark:text-slate-200">No history yet</h3>
                    <p className="mt-1 max-w-[240px] text-xs text-slate-500 dark:text-slate-400">
                      Complete a questionnaire to see your personalized recommendations saved here!
                    </p>
                    <Link
                      to="/find-car"
                      onClick={() => setIsDrawerOpen(false)}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-violet-700 transition-colors"
                    >
                      Find Your Car
                    </Link>
                  </div>
                ) : (
                  history.map((item) => {
                    const formattedDate = new Date(item.timestamp).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleHistoryItemClick(item)}
                        className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-violet-500 hover:shadow-violet-600/5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-500/80 cursor-pointer transition-all duration-300 hover:scale-[1.01]"
                      >
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                          <span className="font-semibold text-violet-600 dark:text-violet-400 flex items-center gap-1">
                            <Sparkles size={11} /> {item.recommendations.length} Recommendations
                          </span>
                          <span>{formattedDate}</span>
                        </div>

                        {/* Search criteria capsules */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                            Budget: {item.answers.budget}
                          </span>
                          <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                            Usage: {item.answers.usage}
                          </span>
                          <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                            Fuel: {item.answers.fuel}
                          </span>
                          <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                            Priority: {item.answers.priority}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                          <CheckCircle className="text-emerald-500 flex-shrink-0" size={13} />
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                            Top Match: {item.recommendations[0]?.name || 'N/A'}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;

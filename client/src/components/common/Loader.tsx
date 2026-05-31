import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Eye, ShieldAlert, Sparkles, Zap } from 'lucide-react';

const LOADING_STEPS = [
  { text: 'Accessing global car database index...', icon: <Cpu className="text-violet-500" size={16} /> },
  { text: 'Filtering budget constraints and family seat quotas...', icon: <Zap className="text-amber-500" size={16} /> },
  { text: 'Cross-referencing NCAP crash records for active safety...', icon: <ShieldAlert className="text-emerald-500" size={16} /> },
  { text: 'Simulating driving profiles against hybrid & EV efficiency curves...', icon: <Eye className="text-blue-500" size={16} /> },
  { text: 'Running neural scoring algorithm for matching scores...', icon: <Cpu className="text-purple-500" size={16} /> },
  { text: 'Synthesizing tailored AI summaries for top picks...', icon: <Sparkles className="text-pink-500" size={16} /> },
];

export const Loader: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress interval
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + 1;
      });
    }, 45); // Takes about 4.5 seconds to reach 100%

    // Step logger interval
    const stepTimer = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 800);

    return () => {
      clearInterval(progressTimer);
      clearInterval(stepTimer);
    };
  }, []);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center py-12 px-4">
      {/* Interactive scanning animation box */}
      <div className="relative mb-8 flex h-48 w-72 items-center justify-center rounded-3xl border border-slate-200/80 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900/50 overflow-hidden">
        {/* Animated Scan Line */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-80 shadow-[0_0_15px_#8b5cf6] animate-scan" />

        {/* Isometric Grid BG */}
        <div 
          className="absolute inset-0 opacity-[0.06] dark:opacity-[0.08]" 
          style={{
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
            color: '#8b5cf6'
          }}
        />

        {/* Simulated Car Skeleton Drawing */}
        <div className="relative z-10 flex flex-col items-center gap-3">
          <svg
            className="h-16 w-32 text-slate-300 dark:text-slate-700 animate-pulse"
            viewBox="0 0 100 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            {/* Outline of a sleek car */}
            <path d="M5 25 C5 25, 10 20, 20 15 C30 10, 50 10, 60 12 C70 14, 80 18, 90 22 C95 24, 95 28, 95 28 C95 28, 92 28, 90 28 M5 25 C5 25, 6 28, 10 28 M10 28 C10 28, 13 24, 18 24 C23 24, 26 28, 26 28 M26 28 L74 28 M74 28 C74 28, 77 24, 82 24 C87 24, 90 28, 90 28" />
            <circle cx="18" cy="28" r="4.5" className="stroke-violet-500 fill-violet-500/20" />
            <circle cx="82" cy="28" r="4.5" className="stroke-violet-500 fill-violet-500/20" />
          </svg>
          <div className="flex items-center gap-1.5 rounded-full bg-violet-50 dark:bg-violet-950/40 px-3 py-1 text-xs font-semibold text-violet-600 dark:text-violet-400">
            <Sparkles size={11} className="animate-spin-slow" />
            <span>AI Match Engine Running</span>
          </div>
        </div>
      </div>

      {/* Progress & Log Text */}
      <div className="w-full max-w-md text-center space-y-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Finding Your Ideal Cars...
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Scanning and analyzing active listings to find the perfect fit.
          </p>
        </div>

        {/* Progress Bar Container */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
            <span>Progress</span>
            <span className="text-violet-600 dark:text-violet-400">{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-emerald-500 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Log Messages Rotator */}
        <div className="h-10 flex items-center justify-center px-4 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-900/40 dark:border-slate-850">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStepIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300"
            >
              {LOADING_STEPS[currentStepIndex]?.icon}
              <span>{LOADING_STEPS[currentStepIndex]?.text}</span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Loader;

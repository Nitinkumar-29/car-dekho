import React from 'react';
import { Compass } from 'lucide-react';
import Container from './Container';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200 bg-white py-8 dark:border-slate-800 dark:bg-slate-950 transition-colors mt-auto">
      <Container>
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Compass size={18} className="text-violet-600 dark:text-violet-400" />
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">CarFinder AI</span>
          </div>
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} CarFinder AI. Designed for a premium car shopping journey.
          </p>
          <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-400">
            <a href="#" className="hover:text-violet-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-violet-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;

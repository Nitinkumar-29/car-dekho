import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Gauge, ShieldCheck, Star } from 'lucide-react';
import Container from '../components/layout/Container';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as any } }
  };

  const featureCards = [
    {
      icon: <Gauge className="text-violet-600 dark:text-violet-400" size={24} />,
      title: 'Precision Recommendations',
      description: 'Our proprietary scoring index assesses safety ratings, engine mileage, and spatial requirements for a perfect fit.'
    },
    {
      icon: <ShieldCheck className="text-emerald-500" size={24} />,
      title: 'Safety First Synthesis',
      description: 'Filter models strictly by safety priority to compile lists with 5-star ratings, active safety kits, and ADAS suites.'
    },
    {
      icon: <Star className="text-amber-500" size={24} />,
      title: 'AI Explanation Summary',
      description: 'Receive descriptive AI rationalizations detailing exactly why each car perfectly matches your driving lifestyle.'
    }
  ];

  return (
    <div className="relative min-h-[90vh] overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors py-12 md:py-20 flex flex-col justify-center">
      {/* Abstract Background Glows */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-violet-600/10 blur-3xl dark:bg-violet-600/5 animate-float" />
      <div className="absolute bottom-1/3 right-1/4 -z-10 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/5 animate-float" style={{ animationDelay: '2s' }} />

      <Container>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid items-center gap-12 lg:grid-cols-12"
        >
          {/* Left copy text */}
          <div className="space-y-8 lg:col-span-7 text-left">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 rounded-full bg-violet-50 dark:bg-violet-950/40 px-3.5 py-1.5 text-xs font-semibold text-violet-700 dark:text-violet-300 border border-violet-100 dark:border-violet-900/50">
              <Sparkles size={13} className="animate-pulse" />
              <span>Next-Gen Car Matchmaking</span>
            </motion.div>

            <div className="space-y-4">
              <motion.h1
                variants={itemVariants}
                className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl dark:text-slate-50 leading-[1.1]"
              >
                Find Your Perfect Car{' '}
                <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-emerald-500 bg-clip-text text-transparent dark:from-violet-400 dark:to-emerald-400">
                  in Under 60 Seconds
                </span>
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="max-w-2xl text-lg text-slate-600 md:text-xl dark:text-slate-400 leading-relaxed font-normal"
              >
                Tired of sifting through endless specs? Tell us your budget, driving usage, family requirements, and fuel priorities. Our smart AI engine matches you with top-rated vehicles instantly.
              </motion.p>
            </div>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/find-car')}
                className="group inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-7 py-4 text-base font-bold text-white shadow-xl shadow-violet-600/20 hover:bg-violet-700 hover:shadow-violet-600/30 active:scale-95 transition-all cursor-pointer"
              >
                <span>Get Started Now</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            {/* Quick trust metrics */}
            <motion.div variants={itemVariants} className="flex items-center gap-6 border-t border-slate-200 dark:border-slate-800 pt-8 mt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-slate-50 dark:border-slate-950 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500"
                  >
                    <Star size={10} className="fill-amber-400 stroke-amber-400" />
                  </div>
                ))}
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Loved by 10,000+ car shoppers this year.
              </p>
            </motion.div>
          </div>

          {/* Right animated abstract card layout */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-5 relative"
          >
            {/* Background frame decoration */}
            <div className="absolute -inset-1.5 rounded-[2.5rem] bg-gradient-to-tr from-violet-600 via-indigo-600 to-emerald-500 opacity-20 blur-xl dark:opacity-30" />

            {/* Core Card */}
            <div className="relative rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900/60 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Interactive Sandbox</span>
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </div>
              </div>

              {/* Decorative graphic mockup */}
              <div className="space-y-4 text-left">
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/40 p-4 border border-slate-100 dark:border-slate-850">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-400">Active Criteria</span>
                    <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">Optimal match</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[10px] font-semibold bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300 rounded px-2 py-0.5">Budget: 15-20L</span>
                    <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 rounded px-2 py-0.5">Fuel: Hybrid</span>
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 rounded px-2 py-0.5">Priority: Safety</span>
                  </div>
                </div>

                <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-md">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-50">Toyota Innova Hycross</h4>
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white font-extrabold text-[10px]">
                      98
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-500 border-b border-slate-100 dark:border-slate-850 pb-2 mb-2">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">18.5L+ LPG</p>
                      <p className="text-[9px]">Base Price</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">23.2 km/l</p>
                      <p className="text-[9px]">Hybrid Mileage</p>
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-500 font-bold">5-Star GNCAP</p>
                      <p className="text-[9px]">Active Rating</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                    "AI Summary: Matches hybrid fuel saving requirements while seating family comfortably with active ADAS safety packages."
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Feature pillars section */}
        <div className="grid gap-8 md:grid-cols-3 mt-24">
          {featureCards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900/40 text-left shadow-sm hover:border-violet-500 dark:hover:border-violet-400 hover:shadow-md transition-all duration-300"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-950/50 mb-4 border border-slate-100 dark:border-slate-850">
                {card.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-2">{card.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{card.description}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </div>
  );
};

export default Home;

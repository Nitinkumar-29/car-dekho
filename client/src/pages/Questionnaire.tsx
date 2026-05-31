import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ArrowRight, DollarSign, Map, Users, Fuel, Trophy, 
  Sparkles, ShieldCheck, Heart, Car, Zap, Check 
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { setAnswer } from '../store/recommendationSlice';
import { setStep, nextStep, prevStep } from '../store/uiSlice';
import Container from '../components/layout/Container';

interface QuestionOption {
  value: any;
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface Question {
  key: 'budget' | 'usage' | 'familySize' | 'fuel' | 'location' | 'priority';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  options: QuestionOption[];
}

export const Questionnaire: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const answers = useAppSelector((state) => state.recommendation.answers);
  const currentStep = useAppSelector((state) => state.ui.currentStep);

  const QUESTIONS: Question[] = [
    {
      key: 'budget',
      title: 'Define your budget',
      subtitle: 'What price threshold best fits your car shopping boundaries?',
      icon: <DollarSign size={20} className="text-violet-600 dark:text-violet-400" />,
      options: [
        { value: 'Under 10L', label: 'Under 10 Lakhs', description: 'Affordable entry-level hatchbacks & compact sedans', icon: <Car size={18} /> },
        { value: '10-15L', label: '10 - 15 Lakhs', description: 'Smart mid-range crossovers & premium hatchbacks', icon: <Car size={18} /> },
        { value: '15-20L', label: '15 - 20 Lakhs', description: 'Executive sedans & full hybrid feature-rich SUVs', icon: <Car size={18} /> },
        { value: '20L+', label: 'Above 20 Lakhs', description: 'Premium luxury cruisers, long-range EVs & 4x4 SUVs', icon: <Car size={18} /> },
      ],
    },
    {
      key: 'usage',
      title: 'Primary driving usage',
      subtitle: 'Where will your vehicle spend most of its active operating hours?',
      icon: <Map size={20} className="text-violet-600 dark:text-violet-400" />,
      options: [
        { value: 'City', label: 'Urban Commute', description: 'Office commutes, bumper-to-bumper crawls & tight parking', icon: <Zap size={18} /> },
        { value: 'Highway', label: 'Highway Cruising', description: 'Long intercity commutes, speedways & weekend roadtrips', icon: <Trophy size={18} /> },
        { value: 'Mixed', label: 'Mixed Cycle', description: 'A balance between heavy city jams and open highway corridors', icon: <Sparkles size={18} /> },
      ],
    },
    {
      key: 'familySize',
      title: 'Family size & seating',
      subtitle: 'How many passengers need to comfortably fit inside regular drives?',
      icon: <Users size={20} className="text-violet-600 dark:text-violet-400" />,
      options: [
        { value: 2, label: '1 - 2 Passengers', description: 'Perfect for solo commutes, couples & compact styling', icon: <Users size={18} /> },
        { value: 4, label: '3 - 4 Passengers', description: 'Standard family sizes, child seats & luggage utilities', icon: <Users size={18} /> },
        { value: 5, label: '5+ Passengers', description: 'Large multi-gen families, tour travels & maximum seats (MPV/SUV)', icon: <Users size={18} /> },
      ],
    },
    {
      key: 'fuel',
      title: 'Fuel preference',
      subtitle: 'Which powertrain propulsion matches your environment & economy views?',
      icon: <Fuel size={20} className="text-violet-600 dark:text-violet-400" />,
      options: [
        { value: 'Petrol', label: 'Refined Petrol', description: 'Silent drives, lower initial purchase prices & fast refuels', icon: <Fuel size={18} /> },
        { value: 'Diesel', label: 'Torque Diesel', description: 'High tractive power, heavy passenger loads & highway economy', icon: <Fuel size={18} /> },
        { value: 'Hybrid', label: 'Eco Hybrid', description: 'Self-charging battery assist, maximum city range & smart brakes', icon: <Zap size={18} /> },
        { value: 'EV', label: 'Full Electric (EV)', description: 'Zero emissions, fast silent accelerations & convenient home charging', icon: <Sparkles size={18} /> },
        { value: 'No Preference', label: 'No Preference', description: 'Open to any fuel type that delivers maximum value', icon: <Check size={18} /> },
      ],
    },
    {
      key: 'priority',
      title: 'Select key priority',
      subtitle: 'What single performance metric must this vehicle absolutely master?',
      icon: <Trophy size={20} className="text-violet-600 dark:text-violet-400" />,
      options: [
        { value: 'Safety', label: 'Active Safety', description: '5-star NCAP safety shells, multiple airbags & ADAS systems', icon: <ShieldCheck size={18} /> },
        { value: 'Mileage', label: 'High Mileage', description: 'Optimal engine combustion & thermal economy (lowest fuel bills)', icon: <Zap size={18} /> },
        { value: 'Comfort', label: 'Premium Comfort', description: 'Plush cabin insulation, soft suspension kits & executive seats', icon: <Heart size={18} /> },
        { value: 'Performance', label: 'Sports Performance', description: 'Turbocharged horsepowers, active gear shifters & agile chassis', icon: <Trophy size={18} /> },
      ],
    },
    {
      key: 'location',
      title: 'Your primary city',
      subtitle: 'We use this to estimate on-road pricing and running costs.',
      icon: <Map size={20} className="text-violet-600 dark:text-violet-400" />,
      options: [
        { value: 'Bengaluru', label: 'Bengaluru', description: 'High traffic, premium metro pricing', icon: <Map size={18} /> },
        { value: 'Mumbai', label: 'Mumbai', description: 'Higher on-road and insurance premiums', icon: <Map size={18} /> },
        { value: 'Delhi', label: 'Delhi NCR', description: 'Mixed city-highway use and broad inventory', icon: <Map size={18} /> },
        { value: 'Pune', label: 'Pune', description: 'Balanced city costs and growing EV adoption', icon: <Map size={18} /> },
        { value: 'Hyderabad', label: 'Hyderabad', description: 'Strong mixed-usage commuting patterns', icon: <Map size={18} /> },
      ],
    },
  ];

  const currentQuestion = QUESTIONS[currentStep];

  const handleSelectOption = (value: any) => {
    dispatch(setAnswer({ key: currentQuestion.key, value }));
    
    // Auto-advance with small delay for a smooth responsive feel
    if (currentStep < QUESTIONS.length - 1) {
      setTimeout(() => {
        dispatch(nextStep());
      }, 300);
    }
  };

  const handleFinish = () => {
    navigate('/results');
  };

  return (
    <div className="relative min-h-[85vh] bg-slate-50 dark:bg-slate-950 transition-colors py-12">
      <Container className="max-w-3xl">
        {/* ProgressBar Navigation */}
        <div className="mb-10 space-y-4">
          <div className="flex justify-between text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
            <span>Step {currentStep + 1} of {QUESTIONS.length}</span>
            <span className="text-violet-600 dark:text-violet-400 font-semibold capitalize">
              Configuring: {currentQuestion.key === 'familySize' ? 'Family Seating' : currentQuestion.key}
            </span>
          </div>

          {/* Stepped progress bubbles */}
          <div className="flex items-center gap-2">
            {QUESTIONS.map((_, idx) => {
              const isCompleted = idx < currentStep;
              const isActive = idx === currentStep;
              
              return (
                <button
                  key={idx}
                  onClick={() => dispatch(setStep(idx))}
                  className={`h-2 flex-1 rounded-full transition-all duration-300 border-none cursor-pointer ${
                    isCompleted 
                      ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' 
                      : isActive 
                        ? 'bg-violet-600 shadow-[0_0_12px_#8b5cf6]' 
                        : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                  aria-label={`Jump to step ${idx + 1}`}
                />
              );
            })}
          </div>
        </div>

        {/* Multi-step animations */}
        <div className="relative overflow-hidden min-h-[480px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="space-y-8"
            >
              {/* Question Header card */}
              <div className="text-left space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900/40">
                    {currentQuestion.icon}
                  </div>
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight sm:text-3xl">
                    {currentQuestion.title}
                  </h1>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 pl-13">
                  {currentQuestion.subtitle}
                </p>
              </div>

              {/* Grid Options selector */}
              <div className="grid gap-4 sm:grid-cols-2">
                {currentQuestion.options.map((opt) => {
                  const isSelected = answers[currentQuestion.key] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleSelectOption(opt.value)}
                      className={`group relative flex items-start gap-4 rounded-2xl border p-5 text-left transition-all duration-300 hover:scale-[1.01] cursor-pointer ${
                        isSelected
                          ? 'border-violet-600 bg-violet-50/40 dark:border-violet-500 dark:bg-violet-950/20 shadow-md shadow-violet-600/5'
                          : 'border-slate-200 bg-white hover:border-slate-350 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 shadow-sm'
                      }`}
                    >
                      {/* Check badge overlay */}
                      {isSelected && (
                        <div className="absolute top-4 right-4 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-white animate-scale">
                          <Check size={11} strokeWidth={3} />
                        </div>
                      )}

                      {/* Icon */}
                      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all ${
                        isSelected 
                          ? 'bg-violet-600 text-white' 
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                      }`}>
                        {opt.icon}
                      </div>

                      {/* Content details */}
                      <div className="space-y-1 pr-4">
                        <h3 className={`font-bold text-sm tracking-tight ${
                          isSelected ? 'text-violet-700 dark:text-violet-300' : 'text-slate-800 dark:text-slate-200'
                        }`}>
                          {opt.label}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal font-normal">
                          {opt.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Wizard Controls Footer */}
        <div className="mt-12 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-6">
          <button
            onClick={() => dispatch(prevStep())}
            disabled={currentStep === 0}
            className={`inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 active:scale-95 disabled:pointer-events-none disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer`}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          {currentStep === QUESTIONS.length - 1 ? (
            <button
              onClick={handleFinish}
              className="group inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/15 hover:from-violet-750 hover:to-indigo-750 active:scale-95 transition-all cursor-pointer glow-primary"
            >
              <Sparkles size={16} />
              <span>Find Recommendations</span>
            </button>
          ) : (
            <button
              onClick={() => dispatch(nextStep())}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-slate-850 active:scale-95 transition-all dark:bg-slate-50 dark:text-slate-950 dark:hover:bg-slate-200 cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </Container>
    </div>
  );
};

export default Questionnaire;

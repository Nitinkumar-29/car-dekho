import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, ShieldCheck, Fuel, Check, X, Scale, 
  ChevronDown, ChevronUp, AlertCircle, ArrowLeft, RefreshCw, Car
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { fetchRecommendationsStart, fetchRecommendationsSuccess, fetchRecommendationsFailure } from '../store/recommendationSlice';
import { toggleCompareCar, clearComparison } from '../store/uiSlice';
import { fetchCarRecommendations } from '../services/api';
import Loader from '../components/common/Loader';
import ErrorState from '../components/common/ErrorState';
import Container from '../components/layout/Container';
import { motion, AnimatePresence } from 'framer-motion';

export const Results: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const answers = useAppSelector((state) => state.recommendation.answers);
  const recommendations = useAppSelector((state) => state.recommendation.recommendations);
  const loading = useAppSelector((state) => state.recommendation.loading);
  const error = useAppSelector((state) => state.recommendation.error);
  
  const comparedCarIds = useAppSelector((state) => state.ui.comparedCarIds);
  const [expandedCarId, setExpandedCarId] = useState<string | null>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Trigger recommendation generation on mount if not loaded
  useEffect(() => {
    const loadRecommendations = async () => {
      dispatch(fetchRecommendationsStart());
      try {
        const results = await fetchCarRecommendations(answers);
        dispatch(fetchRecommendationsSuccess(results));
      } catch (err: any) {
        dispatch(fetchRecommendationsFailure(err.message || 'Failed to fetch recommendations'));
      }
    };

    if (recommendations.length === 0) {
      loadRecommendations();
    }
  }, [answers, dispatch]);

  const handleRetry = async () => {
    dispatch(fetchRecommendationsStart());
    try {
      const results = await fetchCarRecommendations(answers);
      dispatch(fetchRecommendationsSuccess(results));
    } catch (err: any) {
      dispatch(fetchRecommendationsFailure(err.message || 'Failed to fetch recommendations'));
    }
  };

  const toggleExplanation = (carId: string) => {
    setExpandedCarId(expandedCarId === carId ? null : carId);
  };

  const selectedCarsForComparison = recommendations.filter(car => 
    comparedCarIds.includes(car.id)
  );

  const sanitizePros = (pros: string[] | undefined): string[] => {
    if (!Array.isArray(pros) || pros.length === 0) {
      return ['Strong overall fit for your selected preferences'];
    }
    return pros;
  };

  const sanitizeCons = (cons: string[] | undefined): string[] => {
    const blockedPhrase = 'detailed pros/cons not available from server dataset';
    const cleaned = (Array.isArray(cons) ? cons : []).filter(
      (item) => item && item.toLowerCase() !== blockedPhrase
    );
    if (cleaned.length > 0) return cleaned;
    return ['Variant-wise trade-offs may vary by city and dealership availability'];
  };

  if (loading) {
    return <Loader />;
  }

  if (error && recommendations.length === 0) {
    return <ErrorState message={error} onRetry={handleRetry} />;
  }

  if (recommendations.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 dark:bg-slate-900/50 dark:text-slate-600 mb-4">
          <Car size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">No Recommendations Yet</h3>
        <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          You haven't customized your driving preferences. Let's run the assistant questionnaire!
        </p>
        <Link
          to="/find-car"
          className="mt-6 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-violet-700 transition-colors cursor-pointer"
        >
          Start Questionnaire
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-[90vh] bg-slate-50 dark:bg-slate-950 transition-colors py-12">
      <Container>
        {/* Page Top Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-left">
          <div>
            <Link to="/find-car" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 uppercase tracking-widest mb-3 transition-colors">
              <ArrowLeft size={12} />
              <span>Modify preferences</span>
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
              Your Top AI Matches
            </h1>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              Based on your custom requirements, here are the absolute best matches.
            </p>
          </div>

          {/* Quick preference display capsules */}
          <div className="flex flex-wrap gap-2 max-w-xl md:justify-end">
            {Object.entries(answers).map(([key, val]) => (
              <div 
                key={key} 
                className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 shadow-sm"
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase">{key}:</span>
                <span className="text-violet-600 dark:text-violet-400">{val}</span>
              </div>
            ))}
            <button 
              onClick={() => {
                dispatch(clearComparison());
                navigate('/find-car');
              }}
              className="flex items-center gap-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-600 px-3.5 py-1.5 text-xs font-bold transition-all border border-violet-100/50 cursor-pointer dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-900/40"
            >
              <RefreshCw size={12} />
              <span>Retake Quiz</span>
            </button>
          </div>
        </div>

        {/* Grid List of Recommendations */}
        <div className="grid gap-8 lg:grid-cols-3 md:grid-cols-2">
          {recommendations.map((car, idx) => {
            const isTopMatch = idx === 0;
            const isCompared = comparedCarIds.includes(car.id);
            const isExpanded = expandedCarId === car.id;
            
            return (
              <motion.div
                key={car.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className={`relative flex flex-col rounded-3xl border bg-white shadow-lg transition-all duration-300 dark:bg-slate-900 overflow-hidden ${
                  isTopMatch 
                    ? 'border-violet-600 dark:border-violet-500/80 ring-1 ring-violet-600/30' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Top Match Sparkle Banner */}
                {isTopMatch && (
                  <div className="absolute top-0 right-0 left-0 bg-gradient-to-r from-violet-600 to-indigo-600 text-center py-1.5 px-4 text-[10px] font-extrabold uppercase tracking-widest text-white flex items-center justify-center gap-1.5 shadow-sm">
                    <Sparkles size={11} className="animate-pulse" />
                    <span>Absolute Best Match</span>
                  </div>
                )}

                {/* Card Main Body */}
                <div className={`p-6 flex-1 text-left flex flex-col ${isTopMatch ? 'pt-10' : ''}`}>
                  {/* Name and Match Score Gauge */}
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-snug">
                        {car.name}
                      </h2>
                      <span className="text-base font-bold text-violet-600 dark:text-violet-400 mt-1 block">
                        {car.price}
                      </span>
                    </div>

                    {/* Circular Match Gauge */}
                    <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-950/60 shadow-inner border border-slate-100 dark:border-slate-850">
                      <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-slate-100 dark:text-slate-800"
                          strokeWidth="2.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-violet-600 dark:text-violet-400"
                          strokeDasharray={`${car.matchScore}, 100`}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="text-center">
                        <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                          {car.matchScore}
                        </span>
                        <span className="text-[7px] font-bold text-slate-400 dark:text-slate-500 block -mt-1">%</span>
                      </div>
                    </div>
                  </div>

                  {/* Mileage & Safety Quick Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-50/70 border border-slate-100 dark:bg-slate-950/30 dark:border-slate-850 rounded-2xl p-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/35 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/20">
                        <Fuel size={15} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Mileage</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{car.mileage}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-950/35 dark:text-violet-400 border border-violet-100/50 dark:border-violet-900/20">
                        <ShieldCheck size={15} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Safety shell</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{car.safetyRating.split(' ')[0]}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-5 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-3.5 dark:border-indigo-900/30 dark:bg-indigo-950/20">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-300">
                      Local Market Insight
                    </p>
                    <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-700 dark:text-slate-250">
                      <p><span className="font-semibold">City:</span> {car.location || 'N/A'}</p>
                      <p><span className="font-semibold">On-road estimate:</span> {car.estimatedOnRoadPrice || 'N/A'}</p>
                      <p><span className="font-semibold">Monthly running:</span> {car.estimatedMonthlyRunningCost || 'N/A'}</p>
                      <p><span className="font-semibold">Typical waiting:</span> {car.estimatedWaitingPeriod || 'N/A'}</p>
                      <p><span className="font-semibold">Price data date:</span> {car.pricingLastUpdated || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Collapsible Pros & Cons */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Key Pros</h4>
                      <ul className="space-y-1.5">
                        {sanitizePros(car.pros).slice(0, 2).map((pro, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs font-medium text-slate-600 dark:text-slate-350">
                            <Check className="text-emerald-500 mt-0.5 flex-shrink-0" size={13} />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Key Cons</h4>
                      <ul className="space-y-1.5">
                        {sanitizeCons(car.cons).slice(0, 2).map((con, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                            <X className="text-slate-350 mt-0.5 flex-shrink-0 dark:text-slate-650" size={13} />
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* AI Explanation Card */}
                  <div className="border-t border-slate-100 dark:border-slate-850 pt-4 mt-auto">
                    <button
                      onClick={() => toggleExplanation(car.id)}
                      className="flex w-full items-center justify-between text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <Sparkles size={13} className="animate-pulse" />
                        <span>AI Match Diagnostics</span>
                      </span>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 rounded-2xl bg-violet-50/50 p-4 border border-violet-100/50 dark:bg-violet-950/20 dark:border-violet-900/30 text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                            {car.explanation}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Compare Checkbox Bottom Bar */}
                <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between dark:border-slate-800 dark:bg-slate-900/50">
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                    Compare features side-by-side
                  </span>
                  <button
                    onClick={() => dispatch(toggleCompareCar(car.id))}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold transition-all hover:scale-102 cursor-pointer ${
                      isCompared 
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10 hover:bg-emerald-600' 
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-850'
                    }`}
                  >
                    {isCompared ? (
                      <>
                        <Check size={12} strokeWidth={3} />
                        <span>Selected</span>
                      </>
                    ) : (
                      <>
                        <Scale size={12} />
                        <span>Compare</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Floating Side-by-Side Comparison Dock */}
        <AnimatePresence>
          {comparedCarIds.length > 0 && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              className="fixed bottom-6 inset-x-4 z-40 mx-auto max-w-xl"
            >
              <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-2xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md shadow-violet-600/10">
                    <Scale size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-extrabold text-slate-900 dark:text-slate-50">Compare Vehicles</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {comparedCarIds.length} of 3 selected
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => dispatch(clearComparison())}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-850 transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setIsCompareModalOpen(true)}
                    className="inline-flex items-center gap-1 rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-violet-750 active:scale-95 transition-all cursor-pointer glow-primary"
                  >
                    <span>View Matrix</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Side-by-Side Comparison Dialog Modal */}
        <AnimatePresence>
          {isCompareModalOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsCompareModalOpen(false)}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
              />

              {/* Table Container Modal */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="fixed inset-4 sm:inset-10 z-50 flex flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950 overflow-hidden"
              >
                {/* Modal Title bar */}
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Scale className="text-violet-600 dark:text-violet-400" size={20} />
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-50">Technical Comparison Matrix</h2>
                  </div>
                  <button
                    onClick={() => setIsCompareModalOpen(false)}
                    className="p-2 text-slate-450 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Table contents */}
                <div className="flex-1 overflow-auto p-6">
                  {selectedCarsForComparison.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <AlertCircle className="text-slate-300 dark:text-slate-700" size={48} />
                      <h3 className="mt-4 font-bold text-slate-900 dark:text-slate-100">No cars selected</h3>
                      <p className="mt-1 text-xs text-slate-500">Close this modal and check vehicles to compare them side-by-side.</p>
                    </div>
                  ) : (
                    <div className="min-w-[600px]">
                      <table className="w-full border-collapse text-left text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-800">
                            <th className="py-4 pr-4 font-bold text-slate-400 uppercase tracking-widest text-[10px] w-1/4">Specs Index</th>
                            {selectedCarsForComparison.map((car) => (
                              <th key={car.id} className="py-4 px-4 w-1/4 font-extrabold text-slate-800 dark:text-slate-100 text-sm">
                                <div>
                                  <p>{car.name}</p>
                                  <span className="text-xs text-violet-600 font-bold dark:text-violet-400">{car.price}</span>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                          {/* Match Score */}
                          <tr>
                            <td className="py-3.5 pr-4 font-semibold text-slate-500 dark:text-slate-400">Match score</td>
                            {selectedCarsForComparison.map((car) => (
                              <td key={car.id} className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100">
                                <span className="inline-flex items-center rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 font-extrabold text-xs">
                                  {car.matchScore}% Optimal
                                </span>
                              </td>
                            ))}
                          </tr>
                          {/* Engine details */}
                          <tr>
                            <td className="py-3.5 pr-4 font-semibold text-slate-500 dark:text-slate-400">Engine displacement</td>
                            {selectedCarsForComparison.map((car) => (
                              <td key={car.id} className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                                {car.specs?.engine || 'N/A'}
                              </td>
                            ))}
                          </tr>
                          {/* Transmission */}
                          <tr>
                            <td className="py-3.5 pr-4 font-semibold text-slate-500 dark:text-slate-400">Transmission</td>
                            {selectedCarsForComparison.map((car) => (
                              <td key={car.id} className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                                {car.specs?.transmission || 'N/A'}
                              </td>
                            ))}
                          </tr>
                          {/* Fuel Type */}
                          <tr>
                            <td className="py-3.5 pr-4 font-semibold text-slate-500 dark:text-slate-400">Fuel propulsion</td>
                            {selectedCarsForComparison.map((car) => (
                              <td key={car.id} className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                                {car.specs?.fuelType || 'N/A'}
                              </td>
                            ))}
                          </tr>
                          {/* Seating */}
                          <tr>
                            <td className="py-3.5 pr-4 font-semibold text-slate-500 dark:text-slate-400">Passenger seats</td>
                            {selectedCarsForComparison.map((car) => (
                              <td key={car.id} className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                                {car.specs?.seats ? `${car.specs.seats} Seater` : 'N/A'}
                              </td>
                            ))}
                          </tr>
                          {/* Mileage */}
                          <tr>
                            <td className="py-3.5 pr-4 font-semibold text-slate-500 dark:text-slate-400">Fuel economy</td>
                            {selectedCarsForComparison.map((car) => (
                              <td key={car.id} className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-bold">
                                {car.mileage}
                              </td>
                            ))}
                          </tr>
                          {/* Safety Shell */}
                          <tr>
                            <td className="py-3.5 pr-4 font-semibold text-slate-500 dark:text-slate-400">NCAP crash safety</td>
                            {selectedCarsForComparison.map((car) => (
                              <td key={car.id} className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1">
                                <ShieldCheck className="text-violet-600 dark:text-violet-400" size={14} />
                                <span>{car.safetyRating}</span>
                              </td>
                            ))}
                          </tr>
                          {/* Boot Space */}
                          <tr>
                            <td className="py-3.5 pr-4 font-semibold text-slate-500 dark:text-slate-400">Boot capacity</td>
                            {selectedCarsForComparison.map((car) => (
                              <td key={car.id} className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                                {car.specs?.bootSpace || 'N/A'}
                              </td>
                            ))}
                          </tr>
                          {/* Pros */}
                          <tr>
                            <td className="py-4 pr-4 font-semibold text-slate-500 dark:text-slate-400 align-top">Major Pros</td>
                            {selectedCarsForComparison.map((car) => (
                              <td key={car.id} className="py-4 px-4 align-top">
                                <ul className="space-y-1">
                                  {sanitizePros(car.pros).map((pro, i) => (
                                    <li key={i} className="flex items-start gap-1.5 text-xs text-slate-650 dark:text-slate-350 font-medium">
                                      <Check className="text-emerald-500 mt-0.5 flex-shrink-0" size={11} />
                                      <span>{pro}</span>
                                    </li>
                                  ))}
                                </ul>
                              </td>
                            ))}
                          </tr>
                          {/* Cons */}
                          <tr>
                            <td className="py-4 pr-4 font-semibold text-slate-500 dark:text-slate-400 align-top">Major Cons</td>
                            {selectedCarsForComparison.map((car) => (
                              <td key={car.id} className="py-4 px-4 align-top">
                                <ul className="space-y-1">
                                  {sanitizeCons(car.cons).map((con, i) => (
                                    <li key={i} className="flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-450 font-medium">
                                      <X className="text-slate-400 dark:text-slate-600 mt-0.5 flex-shrink-0" size={11} />
                                      <span>{con}</span>
                                    </li>
                                  ))}
                                </ul>
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Modal footer controls */}
                <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 flex justify-between items-center dark:border-slate-800 dark:bg-slate-900/50">
                  <span className="text-xs text-slate-400">
                    Use this table to weigh active features, cargo room & running costs side-by-side.
                  </span>
                  <button
                    onClick={() => setIsCompareModalOpen(false)}
                    className="rounded-xl bg-slate-950 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-850 dark:bg-slate-50 dark:text-slate-950 dark:hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </Container>
    </div>
  );
};

export default Results;

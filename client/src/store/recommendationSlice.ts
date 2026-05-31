import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { QuestionnaireAnswers, CarRecommendation, RecommendationHistoryItem } from '../types';

interface RecommendationState {
  answers: QuestionnaireAnswers;
  recommendations: CarRecommendation[];
  history: RecommendationHistoryItem[];
  loading: boolean;
  error: string | null;
}

const initialAnswers: QuestionnaireAnswers = {
  budget: '10-15L',
  usage: 'City',
  familySize: 4,
  fuel: 'Petrol',
  priority: 'Safety',
  location: 'Bengaluru',
};

// Load history from local storage if available
const loadHistory = (): RecommendationHistoryItem[] => {
  try {
    const saved = localStorage.getItem('carfinder_history');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Failed to load history', e);
    return [];
  }
};

const initialState: RecommendationState = {
  answers: initialAnswers,
  recommendations: [],
  history: loadHistory(),
  loading: false,
  error: null,
};

const recommendationSlice = createSlice({
  name: 'recommendation',
  initialState,
  reducers: {
    setAnswer: (
      state,
      action: PayloadAction<{ key: keyof QuestionnaireAnswers; value: any }>
    ) => {
      (state.answers as any)[action.payload.key] = action.payload.value;
    },
    resetQuestionnaire: (state) => {
      state.answers = initialAnswers;
    },
    fetchRecommendationsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchRecommendationsSuccess: (
      state,
      action: PayloadAction<CarRecommendation[]>
    ) => {
      state.loading = false;
      state.recommendations = action.payload;
      
      // Save to history
      const historyItem: RecommendationHistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        answers: { ...state.answers },
        recommendations: action.payload,
      };
      
      state.history = [historyItem, ...state.history].slice(0, 10); // Keep last 10 entries
      try {
        localStorage.setItem('carfinder_history', JSON.stringify(state.history));
      } catch (e) {
        console.error('Failed to save history', e);
      }
    },
    fetchRecommendationsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearHistory: (state) => {
      state.history = [];
      try {
        localStorage.removeItem('carfinder_history');
      } catch (e) {
        console.error('Failed to clear history', e);
      }
    },
    setHistoryItemActive: (state, action: PayloadAction<RecommendationHistoryItem>) => {
      state.answers = action.payload.answers;
      state.recommendations = action.payload.recommendations;
    }
  },
});

export const {
  setAnswer,
  resetQuestionnaire,
  fetchRecommendationsStart,
  fetchRecommendationsSuccess,
  fetchRecommendationsFailure,
  clearHistory,
  setHistoryItemActive
} = recommendationSlice.actions;

export default recommendationSlice.reducer;

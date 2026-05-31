import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  darkMode: boolean;
  currentStep: number;
  comparedCarIds: string[];
}

const QUESTION_STEPS_TOTAL = 6;
const LAST_QUESTION_STEP_INDEX = QUESTION_STEPS_TOTAL - 1;

// Check local storage or system preference for dark mode
const checkDarkMode = (): boolean => {
  try {
    const saved = localStorage.getItem('carfinder_darkmode');
    if (saved !== null) {
      return saved === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch (e) {
    return false;
  }
};

const initialState: UIState = {
  darkMode: checkDarkMode(),
  currentStep: 0,
  comparedCarIds: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      try {
        localStorage.setItem('carfinder_darkmode', String(state.darkMode));
        // Add/remove class in documentElement for tailwind styling
        if (state.darkMode) {
          document.documentElement.classList.add('dark');
          document.documentElement.style.colorScheme = 'dark';
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.style.colorScheme = 'light';
        }
      } catch (e) {
        console.error('Failed to write dark mode', e);
      }
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
      try {
        localStorage.setItem('carfinder_darkmode', String(state.darkMode));
        if (state.darkMode) {
          document.documentElement.classList.add('dark');
          document.documentElement.style.colorScheme = 'dark';
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.style.colorScheme = 'light';
        }
      } catch (e) {
        console.error(e);
      }
    },
    setStep: (state, action: PayloadAction<number>) => {
      state.currentStep = Math.max(0, Math.min(action.payload, LAST_QUESTION_STEP_INDEX));
    },
    nextStep: (state) => {
      if (state.currentStep < LAST_QUESTION_STEP_INDEX) {
        state.currentStep += 1;
      }
    },
    prevStep: (state) => {
      if (state.currentStep > 0) {
        state.currentStep -= 1;
      }
    },
    toggleCompareCar: (state, action: PayloadAction<string>) => {
      const carId = action.payload;
      if (state.comparedCarIds.includes(carId)) {
        state.comparedCarIds = state.comparedCarIds.filter(id => id !== carId);
      } else {
        if (state.comparedCarIds.length < 3) {
          state.comparedCarIds.push(carId);
        }
      }
    },
    clearComparison: (state) => {
      state.comparedCarIds = [];
    },
  },
});

export const {
  toggleDarkMode,
  setDarkMode,
  setStep,
  nextStep,
  prevStep,
  toggleCompareCar,
  clearComparison,
} = uiSlice.actions;

export default uiSlice.reducer;

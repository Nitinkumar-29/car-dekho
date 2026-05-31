export interface QuestionnaireAnswers {
  budget: string;
  usage: string;
  familySize: number;
  fuel: string;
  priority: string;
  location: string;
}

export interface CarRecommendation {
  id: string;
  name: string;
  matchScore: number;
  price: string;
  estimatedOnRoadPrice?: string;
  estimatedMonthlyRunningCost?: string;
  estimatedWaitingPeriod?: string;
  location?: string;
  pricingLastUpdated?: string;
  mileage: string;
  safetyRating: string;
  pros: string[];
  cons: string[];
  explanation: string;
  specs: {
    engine: string;
    transmission: string;
    fuelType: string;
    seats: number;
    bootSpace: string;
  };
}

export interface RecommendationResponse {
  recommendations: CarRecommendation[];
}

export interface RecommendationHistoryItem {
  id: string;
  timestamp: string;
  answers: QuestionnaireAnswers;
  recommendations: CarRecommendation[];
}

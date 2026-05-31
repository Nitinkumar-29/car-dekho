import { RecommendationPreferencesDto } from '../dto/recommendation-preferences.dto';

export const RECOMMENDATION_LOG_REPOSITORY = Symbol('RECOMMENDATION_LOG_REPOSITORY');

export interface RecommendationLogRepository {
  saveLog(payload: {
    userPreferences: RecommendationPreferencesDto;
    recommendedCars: string[];
  }): Promise<void>;
}

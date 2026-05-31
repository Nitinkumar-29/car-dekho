import { Injectable } from '@nestjs/common';
import { Car } from '../../cars/schemas/car.schema';
import { RecommendationPreferencesDto } from '../dto/recommendation-preferences.dto';

@Injectable()
export class ScoringEngineService {
  calculateScore(car: Car, preferences: RecommendationPreferencesDto): number {
    let score = 0;

    if (this.isBudgetMatch(car.price, preferences.budget)) {
      score += 30;
    }

    const normalizedFuel = preferences.fuel === 'EV' ? 'Electric' : preferences.fuel;
    if (
      normalizedFuel === 'No Preference' ||
      car.fuelType.toLowerCase() === normalizedFuel.toLowerCase()
    ) {
      score += 20;
    }

    if (preferences.familySize >= 4 && car.familyFriendly) {
      score += 15;
    }

    score += car.safetyRating * 5;
    score += car.mileage * 2;

    if (preferences.priority === 'Safety') {
      score += car.safetyRating * 10;
    }

    if (preferences.priority === 'Mileage') {
      score += car.mileage * 5;
    }

    if (preferences.priority === 'Budget') {
      score += this.budgetBonus(car.price, preferences.budget);
    }

    if (preferences.priority === 'Comfort') {
      score += car.familyFriendly ? 20 : 5;
      score += ['Automatic', 'CVT', 'DCT', 'eCVT', 'AMT'].includes(car.transmission)
        ? 10
        : 0;
    }

    if (preferences.priority === 'Performance') {
      score += ['Diesel', 'Hybrid', 'Electric'].includes(car.fuelType) ? 12 : 6;
      score += ['Automatic', 'DCT', 'CVT'].includes(car.transmission) ? 8 : 4;
    }

    return Math.round(score * 100) / 100;
  }

  isValidMatch(car: Car, preferences: RecommendationPreferencesDto): boolean {
    return this.isBudgetMatch(car.price, preferences.budget);
  }

  private isBudgetMatch(price: number, budget: RecommendationPreferencesDto['budget']): boolean {
    if (budget === '0-10L' || budget === 'Under 10L') return price <= 1_000_000;
    if (budget === '10-15L') return price > 1_000_000 && price <= 1_500_000;
    if (budget === '15-20L') return price > 1_500_000 && price <= 2_000_000;
    return price > 2_000_000;
  }

  private budgetBonus(price: number, budget: RecommendationPreferencesDto['budget']): number {
    if (budget === '20L+') {
      return 10;
    }

    const midpoint =
      budget === '0-10L' || budget === 'Under 10L'
        ? 500_000
        : budget === '10-15L'
          ? 1_250_000
          : 1_750_000;
    const distance = Math.abs(price - midpoint);
    return Math.max(0, 20 - distance / 100_000);
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { AiExplanationService } from '../../ai/services/ai-explanation.service';
import { CAR_REPOSITORY, CarRepository } from '../../cars/repositories/car.repository.interface';
import { RecommendationPreferencesDto } from '../dto/recommendation-preferences.dto';
import {
  RECOMMENDATION_LOG_REPOSITORY,
  RecommendationLogRepository,
} from '../repositories/recommendation-log.repository.interface';
import { ScoringEngineService } from './scoring-engine.service';

@Injectable()
export class RecommendationsService {
  private readonly pricingLastUpdated = '2026-05-31';
  private readonly cityPriceMultipliers: Record<string, number> = {
    bengaluru: 1.14,
    mumbai: 1.16,
    delhi: 1.12,
    pune: 1.13,
    hyderabad: 1.12,
    chennai: 1.13,
    kolkata: 1.11,
    ahmedabad: 1.1,
  };

  private readonly fuelCostPerKm: Record<string, number> = {
    petrol: 7.2,
    diesel: 5.9,
    cng: 3.4,
    electric: 1.4,
    ev: 1.4,
    hybrid: 4.5,
  };

  constructor(
    @Inject(CAR_REPOSITORY)
    private readonly carRepository: CarRepository,
    @Inject(RECOMMENDATION_LOG_REPOSITORY)
    private readonly recommendationLogRepository: RecommendationLogRepository,
    private readonly scoringEngineService: ScoringEngineService,
    private readonly aiExplanationService: AiExplanationService,
  ) {}

  async recommend(preferences: RecommendationPreferencesDto) {
    const cars = await this.carRepository.findAll();
    const validCars = cars.filter((car) =>
      this.scoringEngineService.isValidMatch(car, preferences),
    );

    const topRecommendations = validCars
      .map((car) => ({
        car,
        score: this.scoringEngineService.calculateScore(car, preferences),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const location = preferences.location?.trim() || 'India Average';

    const withExplanations = await Promise.all(
      topRecommendations.map(async (item) => ({
        ...item,
        explanation: await this.aiExplanationService.generateExplanation(
          item.car,
          preferences,
        ),
        ...this.estimateLocalOwnership(item.car, preferences, location),
        ...this.deriveRecommendationAttributes(item.car),
      })),
    );

    await this.recommendationLogRepository.saveLog({
      userPreferences: preferences,
      recommendedCars: withExplanations.map((item) => item.car.name),
    });

    return { recommendations: withExplanations };
  }

  private estimateLocalOwnership(
    car: { price: number; fuelType: string },
    preferences: RecommendationPreferencesDto,
    location: string,
  ) {
    const cityMultiplier =
      this.cityPriceMultipliers[location.toLowerCase()] ??
      this.cityPriceMultipliers[location.toLowerCase().replace(/\s+/g, '')] ??
      1.12;
    const fuelKey = car.fuelType.toLowerCase();
    const kmPerMonth = preferences.usage === 'Highway' ? 1600 : preferences.usage === 'Mixed' ? 1200 : 900;
    const fuelPerKm = this.fuelCostPerKm[fuelKey] ?? 6.2;
    const maintenancePerMonth = Math.max(1200, Math.round(car.price * 0.0015));
    const monthlyRunningCost = Math.round(kmPerMonth * fuelPerKm + maintenancePerMonth);
    const waitingPeriodWeeks = this.estimateWaitingPeriodWeeks(car.price, preferences.priority, fuelKey);
    const estimatedOnRoadPrice = Math.round(car.price * cityMultiplier);

    return {
      estimatedOnRoadPrice,
      estimatedMonthlyRunningCost: monthlyRunningCost,
      estimatedWaitingPeriodWeeks: waitingPeriodWeeks,
      location,
      pricingLastUpdated: this.pricingLastUpdated,
    };
  }

  private estimateWaitingPeriodWeeks(
    price: number,
    priority: RecommendationPreferencesDto['priority'],
    fuelType: string,
  ): number {
    let base = price > 2_000_000 ? 7 : price > 1_200_000 ? 5 : 3;
    if (fuelType === 'hybrid' || fuelType === 'ev' || fuelType === 'electric') {
      base += 2;
    }
    if (priority === 'Performance' || priority === 'Comfort') {
      base += 1;
    }
    return base;
  }

  private deriveRecommendationAttributes(car: {
    fuelType: string;
    transmission: string;
    safetyRating: number;
    mileage: number;
  }) {
    const fuelKey = car.fuelType.toLowerCase();
    const transmissionKey = car.transmission.toLowerCase();
    const engine = this.deriveEngineSpec(fuelKey, transmissionKey);
    const pros = this.derivePros(
      fuelKey,
      car.mileage,
      car.safetyRating,
      transmissionKey,
    );
    const cons = this.deriveCons(
      fuelKey,
      car.mileage,
      car.safetyRating,
      transmissionKey,
    );

    return {
      pros,
      cons,
      specs: {
        engine,
        transmission: car.transmission,
        fuelType: car.fuelType,
        seats: this.deriveSeats(car.fuelType),
        bootSpace: this.deriveBootSpace(car.fuelType),
      },
    };
  }

  private deriveEngineSpec(fuelType: string, transmission: string): string {
    if (fuelType === 'electric' || fuelType === 'ev') return 'Electric motor';
    if (fuelType === 'hybrid') return 'Hybrid petrol-electric powertrain';
    if (fuelType === 'diesel') {
      return transmission.includes('auto')
        ? 'Turbo diesel engine (automatic)'
        : 'Turbo diesel engine';
    }
    if (fuelType === 'cng') return 'Bi-fuel CNG engine';
    return transmission.includes('auto')
      ? 'Petrol engine (automatic)'
      : 'Petrol engine';
  }

  private derivePros(
    fuelType: string,
    mileage: number,
    safetyRating: number,
    transmission: string,
  ): string[] {
    const pros: string[] = [];

    if (safetyRating >= 5) pros.push('Top-tier crash safety rating');
    else if (safetyRating >= 4)
      pros.push('Strong safety credentials for family usage');
    else pros.push('Practical daily-use safety package');

    if (fuelType === 'electric' || fuelType === 'ev')
      pros.push('Very low running cost in city commutes');
    else if (fuelType === 'hybrid')
      pros.push('Efficient hybrid system for mixed driving');
    else if (fuelType === 'diesel')
      pros.push('High torque output suited for highway cruising');
    else if (fuelType === 'cng') pros.push('Economical fuel bills with CNG setup');
    else pros.push('Easy ownership and broad fuel availability');

    if (mileage >= 22) pros.push('Excellent fuel efficiency in its segment');
    else if (mileage >= 17) pros.push('Balanced efficiency for city and highway usage');
    else pros.push('Performance-focused setup with decent efficiency');

    if (
      transmission.includes('auto') ||
      transmission.includes('amt') ||
      transmission.includes('cvt') ||
      transmission.includes('dct')
    ) {
      pros.push('Convenient automatic-style driving in traffic');
    } else {
      pros.push('Driver-engaging manual control');
    }

    return pros.slice(0, 3);
  }

  private deriveCons(
    fuelType: string,
    mileage: number,
    safetyRating: number,
    transmission: string,
  ): string[] {
    const cons: string[] = [];

    if (safetyRating <= 3)
      cons.push('Safety rating is lower than top-segment alternatives');
    else cons.push('Higher-rated variants may cost more on-road');

    if (fuelType === 'electric' || fuelType === 'ev')
      cons.push('Charging planning is needed for longer trips');
    else if (fuelType === 'diesel')
      cons.push('Diesel ownership can involve stricter compliance in some cities');
    else if (fuelType === 'cng')
      cons.push('CNG boot-space tradeoff can affect luggage capacity');
    else cons.push('Fuel prices can impact monthly ownership costs');

    if (mileage < 16) cons.push('Running cost may rise for high monthly driving distances');
    else cons.push('Real-world mileage varies with traffic and driving style');

    if (transmission.includes('manual'))
      cons.push('Manual operation can feel tiring in heavy city traffic');
    else cons.push('Automatic variants usually carry a higher purchase premium');

    return cons.slice(0, 3);
  }

  private deriveSeats(fuelType: string): number {
    return fuelType.toLowerCase() === 'diesel' ? 7 : 5;
  }

  private deriveBootSpace(fuelType: string): string {
    return fuelType.toLowerCase() === 'diesel' ? '420 Litres' : '380 Litres';
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { Car } from '../../cars/schemas/car.schema';
import { RecommendationPreferencesDto } from '../../recommendations/dto/recommendation-preferences.dto';

@Injectable()
export class AiExplanationService {
  private readonly logger = new Logger(AiExplanationService.name);
  private readonly client?: OpenAI;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.model = this.configService.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini';
    if (apiKey) {
      this.client = new OpenAI({ apiKey });
    }
  }

  async generateExplanation(
    car: Car,
    preferences: RecommendationPreferencesDto,
  ): Promise<string> {
    if (!this.client) {
      return `Good fit for ${preferences.usage} use with ${car.fuelType} fuel, safety ${car.safetyRating}/5, mileage ${car.mileage} kmpl, and price around INR ${car.price.toLocaleString('en-IN')}.`;
    }

    try {
      const prompt = [
        `User Preferences: ${JSON.stringify(preferences)}`,
        `Car: ${JSON.stringify(car)}`,
        'Explain why this car fits, include 2 pros and 1 tradeoff in under 90 words.',
      ].join('\n');

      const response = await this.client.responses.create({
        model: this.model,
        input: prompt,
      });

      return response.output_text || 'Explanation unavailable';
    } catch (error) {
      this.logger.error('Failed to generate AI explanation', error);
      return 'This recommendation aligns well with your key preferences across budget, usage, and priority.';
    }
  }
}

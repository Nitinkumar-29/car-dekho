import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RecommendationPreferencesDto } from '../dto/recommendation-preferences.dto';
import {
  RecommendationLog,
  RecommendationLogDocument,
} from '../schemas/recommendation-log.schema';
import { RecommendationLogRepository } from './recommendation-log.repository.interface';

@Injectable()
export class MongooseRecommendationLogRepository
  implements RecommendationLogRepository
{
  constructor(
    @InjectModel(RecommendationLog.name)
    private readonly recommendationLogModel: Model<RecommendationLogDocument>,
  ) {}

  async saveLog(payload: {
    userPreferences: RecommendationPreferencesDto;
    recommendedCars: string[];
  }): Promise<void> {
    await this.recommendationLogModel.create(payload);
  }
}

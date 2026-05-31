import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { CarsModule } from '../cars/cars.module';
import { RecommendationsController } from './controllers/recommendations.controller';
import { FileRecommendationLogRepository } from './repositories/file-recommendation-log.repository';
import { MongooseRecommendationLogRepository } from './repositories/mongoose-recommendation-log.repository';
import { RECOMMENDATION_LOG_REPOSITORY } from './repositories/recommendation-log.repository.interface';
import { RecommendationsService } from './services/recommendations.service';
import { ScoringEngineService } from './services/scoring-engine.service';

const useJson = (process.env.DATA_SOURCE ?? 'json') === 'json';
const logProviders = useJson
  ? [
      FileRecommendationLogRepository,
      {
        provide: RECOMMENDATION_LOG_REPOSITORY,
        useExisting: FileRecommendationLogRepository,
      },
    ]
  : [
      MongooseRecommendationLogRepository,
      {
        provide: RECOMMENDATION_LOG_REPOSITORY,
        useExisting: MongooseRecommendationLogRepository,
      },
    ];

@Module({
  imports: [CarsModule, AiModule],
  controllers: [RecommendationsController],
  providers: [RecommendationsService, ScoringEngineService, ...logProviders],
})
export class RecommendationsModule {}

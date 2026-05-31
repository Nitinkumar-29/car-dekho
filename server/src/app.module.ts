import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AiModule } from './ai/ai.module';
import { CarsModule } from './cars/cars.module';
import { RecommendationsModule } from './recommendations/recommendations.module';

const useJson = (process.env.DATA_SOURCE ?? 'json') === 'json';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ...(!useJson
      ? [
          MongooseModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
              uri:
                configService.get<string>('MONGODB_URI') ??
                'mongodb://localhost:27017/car-recommendation',
            }),
          }),
        ]
      : []),
    CarsModule,
    RecommendationsModule,
    AiModule,
  ],
})
export class AppModule {}

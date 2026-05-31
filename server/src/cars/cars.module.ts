import { Module } from '@nestjs/common';
import { CarsController } from './controllers/cars.controller';
import { CAR_REPOSITORY } from './repositories/car.repository.interface';
import { JsonCarRepository } from './repositories/json-car.repository';
import { MongooseCarRepository } from './repositories/mongoose-car.repository';
import { CarsService } from './services/cars.service';

const useJson = (process.env.DATA_SOURCE ?? 'json') === 'json';
const repositoryProviders = useJson
  ? [JsonCarRepository, { provide: CAR_REPOSITORY, useExisting: JsonCarRepository }]
  : [MongooseCarRepository, { provide: CAR_REPOSITORY, useExisting: MongooseCarRepository }];

@Module({
  controllers: [CarsController],
  providers: [
    CarsService,
    ...repositoryProviders,
  ],
  exports: [CarsService, CAR_REPOSITORY],
})
export class CarsModule {}

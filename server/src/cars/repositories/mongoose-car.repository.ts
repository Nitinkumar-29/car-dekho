import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Car, CarDocument } from '../schemas/car.schema';
import { CarRepository } from './car.repository.interface';

@Injectable()
export class MongooseCarRepository implements CarRepository {
  constructor(
    @InjectModel(Car.name)
    private readonly carModel: Model<CarDocument>,
  ) {}

  findAll(): Promise<Car[]> {
    return this.carModel.find().lean().exec();
  }

  findById(id: string): Promise<Car | null> {
    return this.carModel.findById(id).lean().exec();
  }

  async replaceAll(cars: Partial<Car>[]): Promise<number> {
    await this.carModel.deleteMany({});
    const inserted = await this.carModel.insertMany(cars);
    return inserted.length;
  }
}

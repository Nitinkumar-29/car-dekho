import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { Car } from '../schemas/car.schema';
import { CarRepository } from './car.repository.interface';

@Injectable()
export class JsonCarRepository implements CarRepository {
  private readonly filePath = join(process.cwd(), 'src', 'database', 'data', 'cars.json');

  async findAll(): Promise<Car[]> {
    const cars = await this.readCars();
    return cars.map((car) => car as unknown as Car);
  }

  async findById(id: string): Promise<Car | null> {
    const cars = await this.readCars();
    const car = cars.find((item) => item._id === id);
    return car ? (car as unknown as Car) : null;
  }

  async replaceAll(cars: Partial<Car>[]): Promise<number> {
    const withIds = cars.map((car, index) => ({
      _id: `car_${index + 1}`,
      ...car,
    }));
    await fs.writeFile(this.filePath, JSON.stringify(withIds, null, 2), 'utf-8');
    return withIds.length;
  }

  private async readCars(): Promise<Array<Record<string, unknown>>> {
    const raw = await fs.readFile(this.filePath, 'utf-8');
    return JSON.parse(raw) as Array<Record<string, unknown>>;
  }
}

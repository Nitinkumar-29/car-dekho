import { Car } from '../schemas/car.schema';

export const CAR_REPOSITORY = Symbol('CAR_REPOSITORY');

export interface CarRepository {
  findAll(): Promise<Car[]>;
  findById(id: string): Promise<Car | null>;
  replaceAll(cars: Partial<Car>[]): Promise<number>;
}

import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CAR_REPOSITORY, CarRepository } from '../repositories/car.repository.interface';
import { Car } from '../schemas/car.schema';

@Injectable()
export class CarsService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(CAR_REPOSITORY)
    private readonly carRepository: CarRepository,
  ) {}

  findAll(): Promise<Car[]> {
    return this.carRepository.findAll();
  }

  async findById(id: string): Promise<Car> {
    const car = await this.carRepository.findById(id);
    if (!car) {
      throw new NotFoundException(`Car with id ${id} not found`);
    }
    return car;
  }

  async syncFromRapidApi(): Promise<{ inserted: number }> {
    const url = this.configService.get<string>('RAPIDAPI_URL');
    const key = this.configService.get<string>('RAPIDAPI_KEY');
    const host = this.configService.get<string>('RAPIDAPI_HOST');

    if (!url || !key || !host) {
      throw new InternalServerErrorException(
        'RapidAPI config missing. Set RAPIDAPI_URL, RAPIDAPI_KEY, RAPIDAPI_HOST.',
      );
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': key,
        'x-rapidapi-host': host,
      },
    });

    if (!response.ok) {
      throw new InternalServerErrorException(
        `RapidAPI request failed with status ${response.status}`,
      );
    }

    const payload = (await response.json()) as unknown;
    const rows = this.extractRows(payload);
    const normalized = rows.map((row) => this.toCar(row)).filter(Boolean) as Partial<Car>[];

    if (!normalized.length) {
      throw new InternalServerErrorException(
        'RapidAPI returned no compatible car rows to import.',
      );
    }

    const inserted = await this.carRepository.replaceAll(normalized);
    return { inserted };
  }

  private extractRows(payload: unknown): Record<string, unknown>[] {
    if (Array.isArray(payload)) return payload as Record<string, unknown>[];
    if (payload && typeof payload === 'object') {
      const obj = payload as Record<string, unknown>;
      if (Array.isArray(obj.data)) return obj.data as Record<string, unknown>[];
      if (Array.isArray(obj.results)) return obj.results as Record<string, unknown>[];
      if (Array.isArray(obj.cars)) return obj.cars as Record<string, unknown>[];
    }
    return [];
  }

  private toCar(row: Record<string, unknown>): Partial<Car> | null {
    const name = this.pickString(row, ['name', 'model', 'car_name']);
    const brand = this.pickString(row, ['brand', 'make', 'company']);
    if (!name || !brand) return null;

    const price = this.pickNumber(row, ['price', 'exShowroomPrice', 'cost']) ?? 1000000;
    const mileage = this.pickNumber(row, ['mileage', 'kmpl']) ?? 16;
    const safetyRating = this.pickNumber(row, ['safetyRating', 'safety']) ?? 3;
    const fuelType =
      this.pickString(row, ['fuelType', 'fuel'])?.replace('EV', 'Electric') ?? 'Petrol';
    const transmission = this.pickString(row, ['transmission', 'gearbox']) ?? 'Manual';

    return {
      name,
      brand,
      price,
      mileage,
      safetyRating: Math.max(0, Math.min(5, safetyRating)),
      fuelType,
      transmission,
      familyFriendly: true,
    };
  }

  private pickString(
    row: Record<string, unknown>,
    keys: string[],
  ): string | undefined {
    for (const key of keys) {
      const value = row[key];
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }
    return undefined;
  }

  private pickNumber(
    row: Record<string, unknown>,
    keys: string[],
  ): number | undefined {
    for (const key of keys) {
      const value = row[key];
      if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
      }
      if (typeof value === 'string') {
        const cleaned = value.replace(/[^0-9.]/g, '');
        const parsed = Number(cleaned);
        if (Number.isFinite(parsed)) {
          return parsed;
        }
      }
    }
    return undefined;
  }
}

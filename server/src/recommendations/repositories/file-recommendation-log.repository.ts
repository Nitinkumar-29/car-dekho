import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { RecommendationPreferencesDto } from '../dto/recommendation-preferences.dto';
import { RecommendationLogRepository } from './recommendation-log.repository.interface';

@Injectable()
export class FileRecommendationLogRepository implements RecommendationLogRepository {
  private readonly filePath = join(
    process.cwd(),
    'src',
    'database',
    'data',
    'recommendation-logs.json',
  );

  async saveLog(payload: {
    userPreferences: RecommendationPreferencesDto;
    recommendedCars: string[];
  }): Promise<void> {
    const current = await this.readLogs();
    current.push({ ...payload, createdAt: new Date().toISOString() });
    await fs.writeFile(this.filePath, JSON.stringify(current, null, 2), 'utf-8');
  }

  private async readLogs(): Promise<Array<Record<string, unknown>>> {
    try {
      const raw = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(raw) as Array<Record<string, unknown>>;
    } catch {
      return [];
    }
  }
}

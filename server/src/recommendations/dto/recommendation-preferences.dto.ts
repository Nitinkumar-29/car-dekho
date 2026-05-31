import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class RecommendationPreferencesDto {
  @ApiProperty({ example: '10-15L' })
  @IsIn(['Under 10L', '0-10L', '10-15L', '15-20L', '20L+'])
  budget!: 'Under 10L' | '0-10L' | '10-15L' | '15-20L' | '20L+';

  @ApiProperty({ example: 'City' })
  @IsIn(['City', 'Highway', 'Mixed'])
  usage!: 'City' | 'Highway' | 'Mixed';

  @ApiProperty({ example: 4 })
  @IsInt()
  @Min(1)
  @Max(10)
  familySize!: number;

  @ApiProperty({ example: 'Petrol' })
  @IsIn(['Petrol', 'Diesel', 'CNG', 'Electric', 'EV', 'Hybrid', 'No Preference'])
  fuel!: 'Petrol' | 'Diesel' | 'CNG' | 'Electric' | 'EV' | 'Hybrid' | 'No Preference';

  @ApiProperty({ example: 'Safety' })
  @IsIn(['Safety', 'Mileage', 'Comfort', 'Performance', 'Budget'])
  priority!: 'Safety' | 'Mileage' | 'Comfort' | 'Performance' | 'Budget';

  @ApiProperty({ example: 'Bengaluru', required: false })
  @IsOptional()
  @IsString()
  location?: string;
}

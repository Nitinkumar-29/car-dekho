import { ApiProperty } from '@nestjs/swagger';
import { CarResponseDto } from '../../cars/dto/car-response.dto';

export class RecommendationItemDto {
  @ApiProperty({ type: CarResponseDto })
  car!: CarResponseDto;

  @ApiProperty()
  score!: number;

  @ApiProperty()
  explanation!: string;

  @ApiProperty()
  estimatedOnRoadPrice!: number;

  @ApiProperty()
  estimatedMonthlyRunningCost!: number;

  @ApiProperty()
  estimatedWaitingPeriodWeeks!: number;

  @ApiProperty()
  location!: string;

  @ApiProperty()
  pricingLastUpdated!: string;

  @ApiProperty({ type: [String] })
  pros!: string[];

  @ApiProperty({ type: [String] })
  cons!: string[];

  @ApiProperty({
    type: Object,
    example: {
      engine: 'Turbo diesel engine',
      transmission: 'Automatic',
      fuelType: 'Diesel',
      seats: 5,
      bootSpace: '400 Litres',
    },
  })
  specs!: {
    engine: string;
    transmission: string;
    fuelType: string;
    seats: number;
    bootSpace: string;
  };
}

export class RecommendationResponseDto {
  @ApiProperty({ type: RecommendationItemDto, isArray: true })
  recommendations!: RecommendationItemDto[];
}

import { ApiProperty } from '@nestjs/swagger';

export class CarResponseDto {
  @ApiProperty()
  _id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  brand!: string;

  @ApiProperty()
  price!: number;

  @ApiProperty()
  fuelType!: string;

  @ApiProperty()
  mileage!: number;

  @ApiProperty()
  safetyRating!: number;

  @ApiProperty()
  transmission!: string;

  @ApiProperty()
  familyFriendly!: boolean;
}

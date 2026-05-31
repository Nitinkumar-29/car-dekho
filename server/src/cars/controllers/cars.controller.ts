import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CarResponseDto } from '../dto/car-response.dto';
import { CarsService } from '../services/cars.service';

@ApiTags('cars')
@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Get()
  @ApiOkResponse({ type: CarResponseDto, isArray: true })
  findAll() {
    return this.carsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: CarResponseDto })
  findById(@Param('id') id: string) {
    return this.carsService.findById(id);
  }

  @Post('sync/rapidapi')
  syncFromRapidApi() {
    return this.carsService.syncFromRapidApi();
  }
}

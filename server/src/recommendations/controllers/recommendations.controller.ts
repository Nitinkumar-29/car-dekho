import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { RecommendationPreferencesDto } from '../dto/recommendation-preferences.dto';
import { RecommendationResponseDto } from '../dto/recommendation-result.dto';
import { RecommendationsService } from '../services/recommendations.service';

@ApiTags('recommendations')
@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Post()
  @ApiOkResponse({ type: RecommendationResponseDto })
  recommend(@Body() preferences: RecommendationPreferencesDto) {
    return this.recommendationsService.recommend(preferences);
  }
}

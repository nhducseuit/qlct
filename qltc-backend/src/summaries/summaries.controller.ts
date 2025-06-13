import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SummariesService } from './summaries.service';
import { GetTotalsSummaryQueryDto } from './dto/get-totals-summary.dto';
import { PeriodSummaryDto, TotalsSummaryResponseDto } from './dto/totals-summary-response.dto';

@ApiTags('Summaries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('summaries')
export class SummariesController {
  constructor(private readonly summariesService: SummariesService) {}

  @Get('totals')
  @ApiOperation({ summary: 'Get total income/expense summaries by period' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved totals summaries.',
    type: [PeriodSummaryDto], // Swagger type for array of PeriodSummaryDto
  })
  @ApiResponse({ status: 400, description: 'Bad Request. Invalid query parameters.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getTotalsSummary(
    @Req() req: any, // Standard Express Request object where user is attached by JwtAuthGuard
    @Query() query: GetTotalsSummaryQueryDto,
  ): Promise<TotalsSummaryResponseDto> {
    const userId = req.user.id; // Extracted from JWT payload by JwtAuthGuard
    return this.summariesService.getTotalsSummary(userId, query);
  }
}
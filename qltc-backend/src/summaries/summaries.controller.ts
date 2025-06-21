import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SummariesService } from './summaries.service';
import { GetTotalsSummaryQueryDto } from './dto/get-totals-summary.dto';
import { GetCategoryBreakdownQueryDto } from './dto/get-category-breakdown.dto';
import { CategoryBreakdownItemDto, CategoryBreakdownResponseDto } from './dto/category-breakdown-response.dto';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { GetMemberBreakdownQueryDto } from './dto/get-member-breakdown.dto';
import { MemberBreakdownItemDto, MemberBreakdownResponseDto } from './dto/member-breakdown-response.dto';
import { GetAverageExpensesQueryDto } from './dto/get-average-expenses.dto';
import { AverageExpensesResponseDto } from './dto/average-expenses-response.dto';
import { GetBudgetComparisonQueryDto } from './dto/get-budget-comparison.dto';
import { BudgetComparisonItemDto, BudgetComparisonResponseDto } from './dto/budget-comparison-response.dto';
import { GetBudgetTrendQueryDto } from './dto/get-budget-trend.dto';
import { BudgetTrendItemDto, BudgetTrendResponseDto } from './dto/budget-trend-response.dto'; // Import AuthenticatedRequest
import { PeriodSummaryDto, TotalsSummaryResponseDto } from './dto/totals-summary-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
    @Req() req: AuthenticatedRequest,
    @Query() query: GetTotalsSummaryQueryDto,
  ): Promise<TotalsSummaryResponseDto> {
    const userId = req.user.id;
    return this.summariesService.getTotalsSummary(userId, query);
  }

  @Get('category-breakdown')
  @ApiOperation({ summary: 'Get income/expense breakdown by category for a period' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved category breakdown.',
    type: [CategoryBreakdownItemDto], // Swagger type for array of CategoryBreakdownItemDto
  })
  @ApiResponse({ status: 400, description: 'Bad Request. Invalid query parameters.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getCategoryBreakdown(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetCategoryBreakdownQueryDto,
  ): Promise<CategoryBreakdownResponseDto> {
    const userId = req.user.id;
    return this.summariesService.getCategoryBreakdown(userId, query);
  }

  @Get('member-breakdown')
  @ApiOperation({ summary: 'Get income/expense breakdown by household member for a period' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved member breakdown.',
    type: [MemberBreakdownItemDto],
  })
  @ApiResponse({ status: 400, description: 'Bad Request. Invalid query parameters.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getMemberBreakdown(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetMemberBreakdownQueryDto,
  ): Promise<MemberBreakdownResponseDto> {
    const userId = req.user.id;
    return this.summariesService.getMemberBreakdown(userId, query);
  }

  @Get('average-expenses')
  @ApiOperation({ summary: 'Get average daily and monthly expenses for a period' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved average expenses.',
    type: AverageExpensesResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request. Invalid query parameters.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getAverageExpenses(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetAverageExpensesQueryDto,
  ): Promise<AverageExpensesResponseDto> {
    const userId = req.user.id;
    return this.summariesService.getAverageExpenses(userId, query);
  }

  @Get('budget-comparison')
  @ApiOperation({ summary: 'Get comparison of actual spending against category budget limits' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved budget comparison.',
    type: [BudgetComparisonItemDto], // Swagger type for array of BudgetComparisonItemDto
  })
  @ApiResponse({ status: 400, description: 'Bad Request. Invalid query parameters.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getBudgetComparison(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetBudgetComparisonQueryDto,
  ): Promise<BudgetComparisonResponseDto> {
    const userId = req.user.id;
    return this.summariesService.getBudgetComparison(userId, query);
  }

  @Get('budget-trend')
  @ApiOperation({ summary: 'Get trend of actual expenses vs. budget limits over periods' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved budget trend data.',
    type: [BudgetTrendItemDto],
  })
  @ApiResponse({ status: 400, description: 'Bad Request. Invalid query parameters.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getBudgetTrend(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetBudgetTrendQueryDto,
  ): Promise<BudgetTrendResponseDto> {
    const userId = req.user.id;
    return this.summariesService.getBudgetTrend(userId, query);
  }
}
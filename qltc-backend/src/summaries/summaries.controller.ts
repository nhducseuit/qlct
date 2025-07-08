import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SummariesService } from './summaries.service';
import { GetTotalsSummaryQueryDto } from './dto/get-totals-summary.dto';
import { GetCategoryBreakdownQueryDto } from './dto/get-category-breakdown.dto';

import { CategoryBreakdownItemDto, CategoryBreakdownResponseDto } from './dto/category-breakdown-response.dto';
import { GetPersonBreakdownQueryDto } from './dto/get-person-breakdown-query.dto';
import { PersonBreakdownItemDto } from './dto/person-breakdown-item.dto';


import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { GetMemberBreakdownQueryDto } from './dto/get-member-breakdown.dto';
import { MemberBreakdownItemDto, MemberBreakdownResponseDto } from './dto/member-breakdown-response.dto';
import { GetAverageExpensesQueryDto } from './dto/get-average-expenses.dto';
import { AverageExpensesResponseDto } from './dto/average-expenses-response.dto';
import { GetBudgetComparisonQueryDto } from './dto/get-budget-comparison.dto';
import { BudgetComparisonItemDto, BudgetComparisonResponseDto } from './dto/budget-comparison-response.dto';
import { GetBudgetTrendQueryDto } from './dto/get-budget-trend.dto';
import { BudgetTrendItemDto, BudgetTrendResponseDto } from './dto/budget-trend-response.dto';
import { PeriodSummaryDto, TotalsSummaryResponseDto } from './dto/totals-summary-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PersonCategoryBudgetCompareItemDto } from './dto/person-category-budget-compare-item.dto';


@ApiTags('Summaries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('summaries')
export class SummariesController {
  constructor(private readonly summariesService: SummariesService) {}

  @Get('person-breakdown')
  @ApiOperation({ summary: "Get expense breakdown by person for user's own family" })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved person breakdown.',
    type: [PersonBreakdownItemDto],
  })
  @ApiResponse({ status: 400, description: 'Bad Request. Invalid query parameters.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getPersonBreakdown(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetPersonBreakdownQueryDto,
  ): Promise<PersonBreakdownItemDto[]> {
    // Only allow for user's own family (enforced here)
    const { user } = req;
    if (!user.familyId) {
      throw new Error('No family context');
    }
    return this.summariesService.getPersonBreakdown(user.id, user.familyId, query);
  }

  @Get('totals')
  @ApiOperation({ summary: 'Get total income/expense summaries by period' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved totals summaries.',
    type: [PeriodSummaryDto],
  })
  @ApiResponse({ status: 400, description: 'Bad Request. Invalid query parameters.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getTotalsSummary(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetTotalsSummaryQueryDto,
  ): Promise<TotalsSummaryResponseDto> {
    const { familyId } = req.user;
    return this.summariesService.getTotalsSummary(familyId, query);
  }

  @Get('category-breakdown')
  @ApiOperation({ summary: 'Get income/expense breakdown by category for a period' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved category breakdown.',
    type: [CategoryBreakdownItemDto],
  })
  @ApiResponse({ status: 400, description: 'Bad Request. Invalid query parameters.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getCategoryBreakdown(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetCategoryBreakdownQueryDto,
  ): Promise<CategoryBreakdownResponseDto> {
    const { familyId } = req.user;
    return this.summariesService.getCategoryBreakdown(familyId, query);
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
    const { familyId } = req.user;
    return this.summariesService.getMemberBreakdown(familyId, query);
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
    const { familyId } = req.user;
    return this.summariesService.getAverageExpenses(familyId, query);
  }

  @Get('budget-comparison')
  @ApiOperation({ summary: 'Get comparison of actual spending against category budget limits' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved budget comparison.',
    type: [BudgetComparisonItemDto],
  })
  @ApiResponse({ status: 400, description: 'Bad Request. Invalid query parameters.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getBudgetComparison(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetBudgetComparisonQueryDto,
  ): Promise<BudgetComparisonResponseDto> {
    const { familyId } = req.user;
    return this.summariesService.getBudgetComparison(familyId, query);
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
    const { familyId } = req.user;
    return this.summariesService.getBudgetTrend(familyId, query);
  }

  @Get('person-category-budget-compare')
  @ApiOperation({ summary: "Get aggregated category expense vs. budget for user's own family (categories grouped by name)" })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved category budget comparison.',
    type: [PersonCategoryBudgetCompareItemDto],
  })
  @ApiResponse({ status: 400, description: 'Bad Request. Invalid query parameters.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getPersonCategoryBudgetCompare(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetPersonBreakdownQueryDto,
  ): Promise<PersonCategoryBudgetCompareItemDto[]> {
    const { user } = req;
    if (!user.familyId) {
      throw new Error('No family context');
    }
    return this.summariesService.getPersonCategoryBudgetCompare(user.id, user.familyId, query);
  }
}

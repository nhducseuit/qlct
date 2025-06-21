import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PeriodType, GetTotalsSummaryQueryDto } from './dto/get-totals-summary.dto';
import { PeriodSummaryDto } from './dto/totals-summary-response.dto';
import { GetCategoryBreakdownQueryDto } from './dto/get-category-breakdown.dto';
import { CategoryBreakdownItemDto, CategoryBreakdownResponseDto } from './dto/category-breakdown-response.dto';
import { GetMemberBreakdownQueryDto } from './dto/get-member-breakdown.dto';
import { MemberBreakdownItemDto, MemberBreakdownResponseDto } from './dto/member-breakdown-response.dto';
import { GetAverageExpensesQueryDto } from './dto/get-average-expenses.dto';
import { AverageExpensesResponseDto } from './dto/average-expenses-response.dto';
import { GetBudgetComparisonQueryDto } from './dto/get-budget-comparison.dto';
import { BudgetComparisonItemDto, BudgetComparisonResponseDto, BudgetStatus } from './dto/budget-comparison-response.dto';
import { GetBudgetTrendQueryDto } from './dto/get-budget-trend.dto';
import { BudgetTrendItemDto, BudgetTrendResponseDto } from './dto/budget-trend-response.dto';
import { Prisma } from '@generated/prisma'; // Import Prisma
import type { Transaction } from '@generated/prisma';
import dayjs from '../utils/dayjs'; // Import the configured dayjs instance

@Injectable()
export class SummariesService {
  constructor(private readonly prisma: PrismaService) {}
  /**
   * Define the expected structure of the splitRatio JSON stored in the database.
   */
  private parseSplitRatio(splitRatioJson: Prisma.JsonValue | null): Array<{ memberId: string; percentage: number }> | null {
    if (splitRatioJson === null || splitRatioJson === undefined) {
      return null;
    }
    try {
      const parsed = typeof splitRatioJson === 'string' ? JSON.parse(splitRatioJson) : splitRatioJson;
      if (Array.isArray(parsed) && parsed.every(item =>
        typeof item === 'object' && item !== null &&
        typeof item.memberId === 'string' &&
        typeof item.percentage === 'number'
      )) {
        return parsed as Array<{ memberId: string; percentage: number }>;
      }
      console.warn('Invalid splitRatio format:', parsed);
      return null;
    } catch (e) {
      console.error('Failed to parse splitRatio JSON:', splitRatioJson, e);
      return null;
    }
  }

  /**
   * Applies strict mode filtering and amount adjustment to a list of transactions.
   * In strict mode, only shared expense transactions where ALL selected members
   * are in the splitRatio are included. The amount is adjusted to be the sum
   * of the shares of the selected members based on their original percentages.
   * Non-shared expenses and incomes are excluded.
   */
  private applyStrictMode(
    transactions: Transaction[], // Prisma's Transaction type
    selectedMemberIds: string[], // Must be provided if isStrictMode is true
  ): Transaction[] {
    const filteredAndAdjusted: Transaction[] = [];
    for (const transaction of transactions) {
      if (transaction.type === 'expense' && transaction.isShared) {
        const splitRatioArray = this.parseSplitRatio(transaction.splitRatio);
        if (splitRatioArray && splitRatioArray.length > 0) {
          const allSelectedMembersPresent = selectedMemberIds.every(smId =>
            splitRatioArray.some(srItem => srItem.memberId === smId)
          );
          if (allSelectedMembersPresent) {
            const selectedMembersTotalPercentage = splitRatioArray
              .filter(srItem => selectedMemberIds.includes(srItem.memberId))
              .reduce((sum, srItem) => sum + (srItem.percentage || 0), 0);

            // Only include the transaction if the selected members' total percentage is > 0
            if (selectedMembersTotalPercentage > 0) {
                 const adjustedAmount = transaction.amount * (selectedMembersTotalPercentage / 100);
                 filteredAndAdjusted.push({ ...transaction, amount: adjustedAmount });
            } else {
                 // If all selected members are present but their total share is 0%, exclude the transaction
                 console.log(`[DEBUG] StrictMode - Transaction ${transaction.id} excluded: selected members present but total share is 0%.`);
            }
          }
        }
      }
      // Non-shared expenses and incomes are excluded in strict mode.
    }
    return filteredAndAdjusted;
  }

  private applyNonStrictModeMemberFilter(
    transactions: Transaction[], // Prisma's Transaction type
    selectedMemberIds: string[],
  ): Transaction[] {
    return transactions.filter(transaction => {
      if (transaction.isShared) {
        const splitRatioArray = this.parseSplitRatio(transaction.splitRatio);
        return splitRatioArray?.some(srItem => selectedMemberIds.includes(srItem.memberId)) || false;
      } else { // Non-shared transaction
        return transaction.payer ? selectedMemberIds.includes(transaction.payer) : false;
      }
    });
  }


  async getTotalsSummary(
    userId: string,
    query: GetTotalsSummaryQueryDto,
  ): Promise<PeriodSummaryDto[]> {
    const year = query.year || dayjs().year(); // Default to current year if not provided

    if ((query.periodType === PeriodType.Monthly || query.periodType === PeriodType.Quarterly) && !query.year) {
      // For monthly and quarterly, if year is not explicitly provided, we default to current year.
      // If the requirement was to error, this is where you'd throw:
      // throw new BadRequestException('Year is required for monthly or quarterly period types.');
    }

    const startDate = dayjs().year(year).startOf('year').toDate();
    const endDate = dayjs().year(year).endOf('year').toDate();

    const whereClause: Prisma.TransactionWhereInput = { // Per user request, data is not siloed by user
      // userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (query.transactionType === 'expense') {
      whereClause.type = 'expense';
    }

    const transactions = await this.prisma.transaction.findMany({
      where: whereClause,
      select: {
        amount: true,
        type: true,
        date: true,
      },
    });

    const summaries: Record<string, { income: number; expense: number }> = {};

    for (const t of transactions) {
      let periodKey: string;
      const transactionDate = dayjs(t.date);

      switch (query.periodType) {
        case PeriodType.Monthly:
          periodKey = transactionDate.format('YYYY-MM');
          break;
        case PeriodType.Quarterly:
          periodKey = `${transactionDate.year()}-Q${transactionDate.quarter()}`;
          break;
        case PeriodType.Yearly:
          periodKey = transactionDate.format('YYYY');
          break;
        default:
          throw new BadRequestException('Invalid period type');
      }

      if (!summaries[periodKey]) {
        summaries[periodKey] = { income: 0, expense: 0 };
      }

      if (t.type === 'income') {
        summaries[periodKey].income += t.amount;
      } else if (t.type === 'expense') {
        summaries[periodKey].expense += t.amount;
      }
    }

    const result: PeriodSummaryDto[] = [];

    if (query.periodType === PeriodType.Monthly) {
      for (let i = 0; i < 12; i++) {
        const monthKey = dayjs().year(year).month(i).format('YYYY-MM');
        result.push({
          period: monthKey,
          totalIncome: summaries[monthKey]?.income || 0,
          totalExpense: summaries[monthKey]?.expense || 0,
          netChange: (summaries[monthKey]?.income || 0) - (summaries[monthKey]?.expense || 0),
        });
      }
    } else if (query.periodType === PeriodType.Quarterly) {
      for (let i = 1; i <= 4; i++) {
        const quarterKey = `${year}-Q${i}`;
        result.push({
          period: quarterKey,
          totalIncome: summaries[quarterKey]?.income || 0,
          totalExpense: summaries[quarterKey]?.expense || 0,
          netChange: (summaries[quarterKey]?.income || 0) - (summaries[quarterKey]?.expense || 0),
        });
      }
    } else if (query.periodType === PeriodType.Yearly) {
      // For yearly, if query.year is specified, we only care about that year.
      // If query.year is not specified, it defaults to current year.
      // The current logic fetches transactions only for 'year', so summaries will only contain keys for that 'year'.
      const yearKey = String(year);
       result.push({
          period: yearKey,
          totalIncome: summaries[yearKey]?.income || 0,
          totalExpense: summaries[yearKey]?.expense || 0,
          netChange: (summaries[yearKey]?.income || 0) - (summaries[yearKey]?.expense || 0),
        });
    }

    // Sort might be desired, e.g., by period ascending
    result.sort((a, b) => a.period.localeCompare(b.period));

    return result;
  }

  async getCategoryBreakdown(
    userId: string,
    query: GetCategoryBreakdownQueryDto,
  ): Promise<CategoryBreakdownResponseDto> {
    console.log(`[DEBUG] getCategoryBreakdown - Received Query: ${JSON.stringify(query)}`);
    const { memberIds } = query; // Extract member and strict mode filters
    const isStrictModeEnabled = query.isStrictMode === 'true'; // Convert string to boolean
    console.log(`[DEBUG] getCategoryBreakdown - Received isStrictMode string: '${query.isStrictMode}', Parsed to boolean: ${isStrictModeEnabled}`);
    const year = query.year || dayjs().year();
    let startDate: Date;
    let endDate: Date;

    switch (query.periodType) {
      case PeriodType.Monthly:
        // If specific month is needed, query DTO would need a month property.
        // For now, let's assume year-long monthly breakdown or adjust if specific month is intended.
        // This example will take all transactions for the year and then could be filtered/grouped by month if needed.
        // For simplicity, let's assume the periodType implies the granularity of the breakdown for the whole year.
        // If a specific month is needed, the query DTO and date range logic would need adjustment.
        // For now, we'll use the whole year for transaction fetching, and the frontend can decide how to display.
        // A more precise interpretation: if periodType is monthly, it means "for each month in the year".
        // However, category breakdown is usually for *a* specific period (e.g., breakdown for Jan 2023, or Q1 2023, or Year 2023).
        // Let's assume the query means "category breakdown for the entirety of the selected year, grouped by category".
        // The PeriodType here might be better named e.g. "ReportPeriod" if it's for a single period report.
        // Re-interpreting: the periodType, year, and optional month/quarter define THE period for which we want ONE category breakdown.
        const monthNumber = query.month ? query.month - 1 : dayjs().month(); // query.month is 1-12, dayjs().month() is 0-11
        startDate = dayjs().year(year).month(monthNumber).startOf('month').toDate();
        endDate = dayjs().year(year).month(monthNumber).endOf('month').toDate();
        // The following lines were part of a previous interpretation and are incorrect here.
        // if (query.periodType === PeriodType.Quarterly) { ... }
        // else if (query.periodType === PeriodType.Yearly) { ... }
        break;
      case PeriodType.Quarterly:
        const quarter = query.quarter || dayjs().quarter();
        startDate = dayjs().year(year).quarter(quarter).startOf('quarter').toDate();
        endDate = dayjs().year(year).quarter(quarter).endOf('quarter').toDate();
        break;
      case PeriodType.Yearly:
        if (query.month || query.quarter) {
          throw new BadRequestException('Month or quarter cannot be specified for yearly period type.');
        }
        startDate = dayjs().year(year).startOf('year').toDate();
        endDate = dayjs().year(year).endOf('year').toDate();
        break;
      default:
        throw new BadRequestException('Invalid period type for category breakdown.');
    }

    const transactionWhereInput: Prisma.TransactionWhereInput = { // Per user request, data is not siloed by user
      // userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
      // type: 'expense', // Removed hardcoded filter
    };

    if (query.transactionType === 'expense') {
      transactionWhereInput.type = 'expense';
    }
    if (query.categoryIds && query.categoryIds.length > 0) { // Filter by global category selection
      transactionWhereInput.categoryId = { in: query.categoryIds };
    }

    // Fetch initial set of transactions based on date and category filters
    let periodTransactions = await this.prisma.transaction.findMany({
      where: transactionWhereInput,
      // Ensure all fields required by the Transaction type are selected
      select: {
        id: true,
        amount: true,
        date: true,
        note: true,
        type: true,
        payer: true,
        isShared: true,
        createdAt: true,
        updatedAt: true,
        splitRatio: true,
        userId: true,
        categoryId: true,
      },
    });

    console.log(`[DEBUG] getCategoryBreakdown - Period Transactions Count: ${periodTransactions.length}, For period: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    // console.log(`[DEBUG] getCategoryBreakdown - Period Transactions Content: ${JSON.stringify(periodTransactions)}`); // Uncomment for deep inspection if needed
    console.log(`[DEBUG] getCategoryBreakdown - Values before filtering: memberIds=${JSON.stringify(memberIds)}, isStrictModeEnabled=${isStrictModeEnabled}`);
    // Apply memberIds filter (if not strict mode) and strict mode filtering/adjustment
    let filteredAndAdjustedTransactions = periodTransactions;

    if (memberIds && memberIds.length > 0) {
        console.log(`[DEBUG] getCategoryBreakdown - Filtering by memberIds. isStrictModeEnabled: ${isStrictModeEnabled}`);
        if (isStrictModeEnabled) {
            filteredAndAdjustedTransactions = this.applyStrictMode(periodTransactions, memberIds);
        } else {
            filteredAndAdjustedTransactions = this.applyNonStrictModeMemberFilter(periodTransactions, memberIds);
        }
    } else if (isStrictModeEnabled) { 
        // Strict mode ON but no members selected.
        console.log('[DEBUG] Strict mode is ON, but no memberIds are selected. Filtering to empty list.');
        filteredAndAdjustedTransactions = []; 
    } else {
        console.log('[DEBUG] getCategoryBreakdown - No memberId filter AND strict mode is OFF. Using all periodTransactions.');
    }
    console.log(`[DEBUG] getCategoryBreakdown - Filtered/Adjusted Transactions Count: ${filteredAndAdjustedTransactions.length}`);

    const categoryTotals: Record<string, { income: number; expense: number }> = {};

    for (const t of filteredAndAdjustedTransactions) { // Use the filtered and adjusted transactions
      // console.log(`[DEBUG] getCategoryBreakdown - Processing transaction: ${t.id}, Amount: ${t.amount}, Type: ${t.type}, Category: ${t.categoryId}, isShared: ${t.isShared}, Payer: ${t.payer}`);
      if (!categoryTotals[t.categoryId]) {
        categoryTotals[t.categoryId] = { income: 0, expense: 0 };
      }

      let amountToConsider = t.amount;

      // If member filters are active AND it's NOT strict mode, recalculate amountToConsider for shared expenses
      if (memberIds && memberIds.length > 0 && !isStrictModeEnabled) {
        if (t.isShared) {
          const splitRatioArray = this.parseSplitRatio(t.splitRatio);
          if (splitRatioArray) {
            amountToConsider = splitRatioArray
              .filter(srItem => memberIds.includes(srItem.memberId)) // Sum shares of selected members
              .reduce((sum, srItem) => sum + (srItem.percentage || 0), 0) * (t.amount / 100);
          } else {
            amountToConsider = 0; // Invalid split ratio for shared transaction
          }
        } else {
          // For non-shared transactions in non-strict mode with member filter,
          // applyNonStrictModeMemberFilter already ensured payer is selected.
          // So, t.amount is correct. amountToConsider is already t.amount.
        }
      }
      // If no member filters, or if it IS strict mode, t.amount is already correct (original or strict-adjusted by applyStrictMode).

      if (t.type === 'income' && amountToConsider > 0) {
        categoryTotals[t.categoryId].income += amountToConsider;
      } else if (t.type === 'expense' && amountToConsider > 0) {
        categoryTotals[t.categoryId].expense += amountToConsider;
      }
    }
    console.log('[DEBUG] getCategoryBreakdown - Calculated Category Totals:', JSON.stringify(categoryTotals));

    // Determine the set of category IDs we need to fetch details for.
    // This will be either the globally filtered category IDs, or all categories that had transactions.
    let idsForCategoryFetch: string[];
    if (query.categoryIds && query.categoryIds.length > 0) {
      idsForCategoryFetch = query.categoryIds;
    } else {
      idsForCategoryFetch = Object.keys(categoryTotals);
    }

    if (idsForCategoryFetch.length === 0) {
      console.log('[DEBUG] getCategoryBreakdown - No categories to display (idsForCategoryFetch is empty).');
      // No categories to display based on filters or transaction activity for the period.
      return [];
    }

    const categoryQueryWhere: Prisma.CategoryWhereInput = { // Per user request, data is not siloed by user
      // userId,
      id: { in: idsForCategoryFetch },
      // isHidden: false, // Optional: consider if hidden categories should be excluded by default
    };

    const categories = await this.prisma.category.findMany({
      where: categoryQueryWhere,
      select: {
        id: true,
        name: true,
        icon: true,
        color: true,
        budgetLimit: true, // Fetch budgetLimit
        parentId: true, // Needed for potential hierarchical structuring later
      },
    });

    // Apply parentId filter ONLY if parentCategoryId is explicitly provided for drill-down
    let categoriesToDisplay = categories;
    if (query.parentCategoryId !== undefined) { // Note: check for undefined, not just truthiness
      categoriesToDisplay = categories.filter(c => c.parentId === query.parentCategoryId);
    }
    // If query.parentCategoryId is undefined, we show all categories fetched (which are already filtered by global categoryIds or transaction activity)

    const result: CategoryBreakdownItemDto[] = categoriesToDisplay
      .map(category => ({
        categoryId: category.id,
        categoryName: category.name,
        totalIncome: categoryTotals[category.id]?.income || 0,
        totalExpense: categoryTotals[category.id]?.expense || 0,
        netChange: (categoryTotals[category.id]?.income || 0) - (categoryTotals[category.id]?.expense || 0),
        budgetLimit: category.budgetLimit, // Add budgetLimit here (it's monthly)
        icon: category.icon,
        color: category.color,
      // subCategories logic would require recursive fetching or more complex query
    }));

    return result.sort((a,b) => a.categoryName.localeCompare(b.categoryName));
  }
  
  async getMemberBreakdown(
    userId: string,
    query: GetMemberBreakdownQueryDto,
  ): Promise<MemberBreakdownResponseDto> {
    console.log(`[DEBUG] getMemberBreakdown - Received Query: ${JSON.stringify(query)}`);
    const { memberIds, transactionType } = query;
    const isStrictModeEnabled = query.isStrictMode === 'true'; // Convert string to boolean
    const year = query.year || dayjs().year();
    let startDate: Date;
    let endDate: Date;

    switch (query.periodType) {
      case PeriodType.Monthly:
        const monthNumber = query.month ? query.month - 1 : dayjs().month(); // query.month is 1-12
        startDate = dayjs().year(year).month(monthNumber).startOf('month').toDate();
        endDate = dayjs().year(year).month(monthNumber).endOf('month').toDate();
        break;
      case PeriodType.Quarterly:
        const quarter = query.quarter || dayjs().quarter(); // query.quarter is 1-4
        startDate = dayjs().year(year).quarter(quarter).startOf('quarter').toDate();
        endDate = dayjs().year(year).quarter(quarter).endOf('quarter').toDate();
        break;
      case PeriodType.Yearly:
        if (query.month || query.quarter) {
          throw new BadRequestException('Month or quarter cannot be specified for yearly period type.');
        }
        startDate = dayjs().year(year).startOf('year').toDate();
        endDate = dayjs().year(year).endOf('year').toDate();
        break;
      default:
        throw new BadRequestException('Invalid period type for member breakdown.');
    }

    const transactionWhereInput: Prisma.TransactionWhereInput = { // Per user request, data is not siloed by user
      // userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
      // Fetch broadly, filter by type, shared, splitRatio, payer in code
    };

    // Apply transactionType filter from query if present
    if (transactionType === 'expense') {
      transactionWhereInput.type = 'expense';
    }
    const transactions = await this.prisma.transaction.findMany({
      where: transactionWhereInput,
      // Ensure all fields required by the Transaction type are selected
      select: {
        id: true,
        amount: true,
        date: true,
        note: true,
        type: true,
        payer: true,
        isShared: true,
        createdAt: true,
        updatedAt: true,
        splitRatio: true,
        userId: true,
        categoryId: true,
      },
    });

    console.log(`[DEBUG] getMemberBreakdown - Initial Transactions Count: ${transactions.length}, For period: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    // console.log(`[DEBUG] getMemberBreakdown - Initial Transactions Content: ${JSON.stringify(transactions)}`); // Uncomment for deep inspection if needed
    console.log(`[DEBUG] getMemberBreakdown - Values before filtering: memberIds=${JSON.stringify(memberIds)}, isStrictModeEnabled=${isStrictModeEnabled}`);
    const allUserMembers = await this.prisma.householdMember.findMany({
      where: { isActive: true }, // Per user request, data is not siloed by user
      select: { id: true, name: true },
    });

    const membersToReportOn = (memberIds && memberIds.length > 0)
      ? allUserMembers.filter(m => memberIds.includes(m.id))
      : allUserMembers; // If no specific members selected, report on all active members

    const memberTotals: Record<string, { income: number; expense: number }> = {};
    membersToReportOn.forEach(m => {
      memberTotals[m.id] = { income: 0, expense: 0 };
    });

    let filteredAndAdjustedTransactions = transactions;
    if (memberIds && memberIds.length > 0) {
      console.log(`[DEBUG] getMemberBreakdown - Filtering by memberIds. isStrictModeEnabled: ${isStrictModeEnabled}`);
      if (isStrictModeEnabled) {
        filteredAndAdjustedTransactions = this.applyStrictMode(transactions, memberIds);
      } else {
        filteredAndAdjustedTransactions = this.applyNonStrictModeMemberFilter(transactions, memberIds);
      }
    } else if (isStrictModeEnabled) { 
        console.log('[DEBUG] Strict mode is ON, but no memberIds are selected for MemberBreakdown. Filtering to empty list.');
        filteredAndAdjustedTransactions = [];
    } else {
        console.log('[DEBUG] getMemberBreakdown - No memberId filter AND strict mode is OFF. Using all transactions.');
    }
    console.log(`[DEBUG] getMemberBreakdown - Filtered/Adjusted Transactions Count: ${filteredAndAdjustedTransactions.length}`);

    for (const t of filteredAndAdjustedTransactions) {
      // console.log(`[DEBUG] getMemberBreakdown - Processing transaction: ${t.id}, Amount: ${t.amount}, Type: ${t.type}, Payer: ${t.payer}, isShared: ${t.isShared}`);
      if (t.type === 'income') {
        // Attribute income to the payer if the payer is in membersToReportOn
        if (t.payer && memberTotals[t.payer]) {
          memberTotals[t.payer].income += t.amount;
        }
      } else if (t.type === 'expense') {
        if (t.isShared) {
          const splitRatioArray = this.parseSplitRatio(t.splitRatio);
          if (splitRatioArray) {
            if (isStrictModeEnabled && memberIds && memberIds.length > 0) {
              // In strict mode, t.amount is the sum of selected members' shares.
              // Distribute this adjusted amount proportionally among the selected members.
              const selectedMembersInSplit = splitRatioArray.filter(item => memberIds.includes(item.memberId));
              const totalPercentageOfSelected = selectedMembersInSplit.reduce((sum, item) => sum + item.percentage, 0);

              if (totalPercentageOfSelected > 0) {
                selectedMembersInSplit.forEach(item => {
                  if (memberTotals[item.memberId]) { // Ensure member is in the report
                    memberTotals[item.memberId].expense += t.amount * (item.percentage / totalPercentageOfSelected);
                  }
                });
              }
            } else { // Non-strict mode or strict mode OFF
              // Distribute original transaction amount based on splitRatio to members in the report
              splitRatioArray.forEach(item => {
                if (memberTotals[item.memberId]) {
                  memberTotals[item.memberId].expense += t.amount * (item.percentage / 100);
                }
              });
            }
          }
        } else { // Non-shared expense
          // Attribute to payer if payer is in membersToReportOn (only if not strict mode)
          if (t.payer && memberTotals[t.payer] && !isStrictModeEnabled) {
            memberTotals[t.payer].expense += t.amount;
          }
        }
      }
    }
    console.log('[DEBUG] getMemberBreakdown - Calculated Member Totals:', JSON.stringify(memberTotals));
    const result: MemberBreakdownItemDto[] = membersToReportOn.map(member => ({
      memberId: member.id,
      memberName: member.name,
      totalIncome: memberTotals[member.id]?.income || 0,
      totalExpense: memberTotals[member.id]?.expense || 0,
      netChange: (memberTotals[member.id]?.income || 0) - (memberTotals[member.id]?.expense || 0),
    }));

    return result.sort((a,b) => a.memberName.localeCompare(b.memberName));
  }

  async getAverageExpenses(
    userId: string,
    query: GetAverageExpensesQueryDto,
  ): Promise<AverageExpensesResponseDto> {
    const year = query.year || dayjs().year();
    let startDate: dayjs.Dayjs;
    let endDate: dayjs.Dayjs;
    let periodLabel: string;
    let numberOfMonthsInPeriod = 1; // For calculating average monthly expense

    switch (query.periodType) {
      case PeriodType.Monthly:
        const month = query.month ? query.month - 1 : dayjs().month(); // query.month is 1-12
        startDate = dayjs().year(year).month(month).startOf('month');
        endDate = dayjs().year(year).month(month).endOf('month');
        periodLabel = startDate.format('YYYY-MM');
        numberOfMonthsInPeriod = 1;
        break;
      case PeriodType.Quarterly:
        const quarter = query.quarter || dayjs().quarter(); // query.quarter is 1-4
        startDate = dayjs().year(year).quarter(quarter).startOf('quarter');
        endDate = dayjs().year(year).quarter(quarter).endOf('quarter');
        periodLabel = `${year}-Q${quarter}`;
        numberOfMonthsInPeriod = 3;
        break;
      case PeriodType.Yearly:
        if (query.month || query.quarter) {
          throw new BadRequestException('Month or quarter cannot be specified for yearly period type.');
        }
        startDate = dayjs().year(year).startOf('year');
        endDate = dayjs().year(year).endOf('year');
        periodLabel = String(year);
        numberOfMonthsInPeriod = 12;
        break;
      default:
        throw new BadRequestException('Invalid period type for average expenses.');
    }

    const whereClause: Prisma.TransactionWhereInput = { // Per user request, data is not siloed by user
      // userId,
      type: 'expense',
      date: {
        gte: startDate.toDate(),
        lte: endDate.toDate(),
      },
    };

    // For average expenses, transactionType filter is not directly applied here
    // as it's inherently about 'expense'. If 'all' was an option, it would change the meaning.
    // The `type: 'expense'` is hardcoded as this report is specifically "Average Expenses".

    if (query.categoryIds && query.categoryIds.length > 0) {
      whereClause.categoryId = { in: query.categoryIds };
    }

    const transactions = await this.prisma.transaction.findMany({
      where: whereClause,
      select: {
        amount: true,
      },
    });

    const totalExpense = transactions.reduce((sum, t) => sum + t.amount, 0);
    const numberOfDays = endDate.diff(startDate, 'day') + 1; // +1 to include both start and end day

    const averageMonthlyExpense = numberOfMonthsInPeriod > 0 ? totalExpense / numberOfMonthsInPeriod : 0;

    return {
      period: periodLabel,
      totalExpense,
      numberOfDays,
      averageMonthlyExpense: parseFloat(averageMonthlyExpense.toFixed(2)),
      categoryIdsUsed: query.categoryIds?.length ? query.categoryIds : undefined,
    };
  }

  async getBudgetComparison(
    userId: string,
    query: GetBudgetComparisonQueryDto,
  ): Promise<BudgetComparisonResponseDto> {
    const year = query.year || dayjs().year();
    let startDate: dayjs.Dayjs;
    let endDate: dayjs.Dayjs;
    let monthsInPeriod = 1; // For adjusting monthly budget to period budget

    switch (query.periodType) {
      case PeriodType.Monthly:
        const month = query.month ? query.month - 1 : dayjs().month();
        startDate = dayjs().year(year).month(month).startOf('month');
        endDate = dayjs().year(year).month(month).endOf('month');
        monthsInPeriod = 1;
        break;
      case PeriodType.Quarterly:
        const quarter = query.quarter || dayjs().quarter();
        startDate = dayjs().year(year).quarter(quarter).startOf('quarter');
        endDate = dayjs().year(year).quarter(quarter).endOf('quarter');
        monthsInPeriod = 3;
        break;
      case PeriodType.Yearly:
        if (query.month || query.quarter) {
          throw new BadRequestException('Month or quarter cannot be specified for yearly period type.');
        }
        startDate = dayjs().year(year).startOf('year');
        endDate = dayjs().year(year).endOf('year');
        monthsInPeriod = 12;
        break;
      default:
        throw new BadRequestException('Invalid period type for budget comparison.');
    }

    // Fetch categories that have a budget limit set by the user
    const categoriesWithBudget = await this.prisma.category.findMany({
      where: { // Per user request, data is not siloed by user
        // userId,
        budgetLimit: { not: null }, // Only categories with a budget
        isHidden: false, // Optionally, only consider visible categories
      },
      select: {
        id: true,
        name: true,
        budgetLimit: true,
        icon: true,
        color: true,
      },
    });

    if (categoriesWithBudget.length === 0) {
      return [];
    }

    const categoryIdsWithBudget = categoriesWithBudget.map(c => c.id);

    // Fetch all expenses for these categories within the period
    const expenses = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { // Per user request, data is not siloed by user
        // userId,
        type: 'expense',
        categoryId: { in: categoryIdsWithBudget },
        date: {
          gte: startDate.toDate(),
          lte: endDate.toDate(),
        },
      },
      _sum: {
        amount: true,
      },
    });

    // For budget comparison, transactionType filter is not directly applied here
    // as it's inherently about comparing 'expense' against budget.
    // The `type: 'expense'` is hardcoded.

    const actualExpensesMap: Record<string, number> = {};
    expenses.forEach(exp => {
      actualExpensesMap[exp.categoryId] = exp._sum.amount || 0;
    });

    const result: BudgetComparisonItemDto[] = categoriesWithBudget.map(category => {
      const actualExpenses = actualExpensesMap[category.id] || 0;
      const monthlyBudgetLimit = category.budgetLimit || 0;
      const periodBudgetLimit = monthlyBudgetLimit * monthsInPeriod;

      let percentageSpent: number | null = null;
      let status = BudgetStatus.NotApplicable;

      if (periodBudgetLimit > 0) {
        percentageSpent = parseFloat(((actualExpenses / periodBudgetLimit) * 100).toFixed(2));
        if (actualExpenses > periodBudgetLimit) status = BudgetStatus.OverBudget;
        else if (actualExpenses >= periodBudgetLimit * 0.8) status = BudgetStatus.NearBudget;
        else status = BudgetStatus.UnderBudget;
      }

      return {
        categoryId: category.id,
        categoryName: category.name,
        budgetLimit: periodBudgetLimit > 0 ? periodBudgetLimit : null,
        actualExpenses,
        remainingBudget: periodBudgetLimit > 0 ? periodBudgetLimit - actualExpenses : null,
        percentageSpent,
        status,
        icon: category.icon,
        color: category.color,
      };
    });

    return result.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
  }

  async getBudgetTrend(
    userId: string,
    query: GetBudgetTrendQueryDto,
  ): Promise<BudgetTrendResponseDto> {
    console.log(`[DEBUG] getBudgetTrend - Received Query: ${JSON.stringify(query)}`);
    const { memberIds } = query; // Extract member and strict mode filters
    const isStrictModeEnabled = query.isStrictMode === 'true'; // Convert string to boolean
    const trendItems: BudgetTrendItemDto[] = [];
    const year = query.year; // year is mandatory in GetBudgetTrendQueryDto

    // Determine categories to consider
    let categoryIdsToConsider: string[] | undefined = undefined;

    if (query.categoryIds && query.categoryIds.length > 0) {
      // If specific category IDs are provided, fetch these regardless of budgetLimit initially.
      categoryIdsToConsider = query.categoryIds;
    } else {
      // If no specific categories are requested, consider ALL non-hidden categories of the user.
      // We are not filtering by budgetLimit here anymore for selecting categories for expense sum.
      const allUserCategories = await this.prisma.category.findMany({
        where: { // Per user request, data is not siloed by user
          // userId,
          isHidden: false, // Consider only visible categories
        },
        select: { id: true },
      });
      if (allUserCategories.length > 0) {
        categoryIdsToConsider = allUserCategories.map(c => c.id);
      }
    }

    // Fetch details (id and budgetLimit) for the categories we are considering
    const relevantCategories = await this.prisma.category.findMany({
      where: {
        id: { in: categoryIdsToConsider || [] }, // Use empty array if categoryIdsToConsider is undefined
        // userId, // Per user request, data is not siloed by user
      },
      select: { id: true, budgetLimit: true },
    });

    // Fetch all transactions for the relevant categories for the entire year first
    // We will then filter them per month and per member in the loop
    const yearTransactionsWhere: Prisma.TransactionWhereInput = { // Per user request, data is not siloed by user
      // userId,
      // type: 'expense', // Removed hardcoded filter for actuals
      categoryId: { in: relevantCategories.map(c => c.id) },
      date: { gte: dayjs().year(year).startOf('year').toDate(), lte: dayjs().year(year).endOf('year').toDate() },
    };

    if (query.transactionType === 'expense') {
      yearTransactionsWhere.type = 'expense'; // Apply if specified, for actuals
    }
    console.log(`[DEBUG] getBudgetTrend - Year Transactions Query Where:`, JSON.stringify(yearTransactionsWhere));
    const yearTransactions = relevantCategories.length > 0 ? await this.prisma.transaction.findMany({
      where: yearTransactionsWhere,
      // Ensure all fields required by the Transaction type are selected
      select: {
        id: true,
        amount: true,
        date: true,
        note: true,
        type: true,
        payer: true,
        isShared: true,
        createdAt: true,
        updatedAt: true,
        splitRatio: true,
        userId: true,
        categoryId: true },
    }) : [];

    console.log(`[DEBUG] getBudgetTrend - Initial Year Transactions Count: ${yearTransactions.length}`);
    // console.log(`[DEBUG] getBudgetTrend - Initial Year Transactions Content: ${JSON.stringify(yearTransactions)}`); // Uncomment for deep inspection if needed
    console.log(`[DEBUG] getBudgetTrend - Values before filtering: memberIds=${JSON.stringify(memberIds)}, isStrictModeEnabled=${isStrictModeEnabled}`);
    // Apply memberIds filter (if not strict mode) and strict mode filtering/adjustment to YEARLY transactions
    let filteredAndAdjustedYearTransactions = yearTransactions;

    if (memberIds && memberIds.length > 0) {
        console.log(`[DEBUG] getBudgetTrend - Filtering by memberIds. isStrictModeEnabled: ${isStrictModeEnabled}`);
        if (isStrictModeEnabled) {
            filteredAndAdjustedYearTransactions = this.applyStrictMode(yearTransactions, memberIds);
        } else {
            filteredAndAdjustedYearTransactions = this.applyNonStrictModeMemberFilter(yearTransactions, memberIds);
        }
    } else if (isStrictModeEnabled) { 
        console.log('[DEBUG] Strict mode is ON, but no memberIds are selected for BudgetTrend. Filtering to empty list.');
        filteredAndAdjustedYearTransactions = [];
    } else {
        console.log('[DEBUG] getBudgetTrend - No memberId filter AND strict mode is OFF. Using all yearTransactions.');
    }
    console.log(`[DEBUG] getBudgetTrend - Filtered/Adjusted Year Transactions Count: ${filteredAndAdjustedYearTransactions.length}`);

    if (query.periodType === PeriodType.Monthly) {
      for (let i = 0; i < 12; i++) { // Iterate through 12 months
        const currentMonthDate = dayjs.utc().year(year).month(i); // Use UTC for consistency
        const periodLabel = currentMonthDate.format('YYYY-MM');
        let totalBudgetLimitForPeriod = 0;
        relevantCategories.forEach(cat => {
          totalBudgetLimitForPeriod += cat.budgetLimit || 0; // Assumes budgetLimit is monthly
        });

        let totalActualExpensesForPeriod = 0;
        // Filter the already filtered/adjusted yearly transactions by month
        const monthTransactions = filteredAndAdjustedYearTransactions.filter(tx => dayjs.utc(tx.date).isSame(currentMonthDate, 'month'));

        monthTransactions.forEach(tx => {
          if (tx.type === 'expense') {
            let amountToConsiderForTrend = tx.amount;
            // If member filters are active AND it's NOT strict mode, recalculate amountToConsider for shared expenses
            if (memberIds && memberIds.length > 0 && !isStrictModeEnabled) {
              if (tx.isShared) {
                const splitRatioArray = this.parseSplitRatio(tx.splitRatio);
                if (splitRatioArray) {
                  amountToConsiderForTrend = splitRatioArray
                    .filter(srItem => memberIds.includes(srItem.memberId)) // Sum shares of selected members
                    .reduce((sum, srItem) => sum + (srItem.percentage || 0), 0) * (tx.amount / 100);
                } else {
                  amountToConsiderForTrend = 0; // Invalid split ratio for shared transaction
                }
              } else {
                // For non-shared transactions in non-strict mode with member filter,
                // applyNonStrictModeMemberFilter already ensured payer is selected.
                // So, tx.amount is correct. amountToConsiderForTrend is already tx.amount.
              }
            }
            // If no member filters, or if it IS strict mode, tx.amount is already correct (original or strict-adjusted by applyStrictMode).
            totalActualExpensesForPeriod += amountToConsiderForTrend;
          }
        });

        trendItems.push({
          period: periodLabel,
          totalBudgetLimit: totalBudgetLimitForPeriod,
          totalActualExpenses: totalActualExpensesForPeriod,
        });
      }
    } else if (query.periodType === PeriodType.Yearly) {
      // For yearly trend, the DTO currently only supports a single year.
      // A true multi-year trend would need startYear/endYear in DTO.
      let totalBudgetLimitForYear = 0;
      relevantCategories.forEach(cat => {
        totalBudgetLimitForYear += (cat.budgetLimit || 0) * 12; // Annualize monthly budget
      });
      let totalActualExpensesForYear = 0;
      filteredAndAdjustedYearTransactions.forEach(tx => {
        if (tx.type === 'expense') {
          let amountToConsiderForTrend = tx.amount;
          if (memberIds && memberIds.length > 0 && !isStrictModeEnabled) {
            if (tx.isShared) {
              const splitRatioArray = this.parseSplitRatio(tx.splitRatio);
              if (splitRatioArray) {
                amountToConsiderForTrend = splitRatioArray
                  .filter(srItem => memberIds.includes(srItem.memberId))
                  .reduce((sum, srItem) => sum + (srItem.percentage || 0), 0) * (tx.amount / 100);
              } else {
                amountToConsiderForTrend = 0;
              }
            }
          }
          totalActualExpensesForYear += amountToConsiderForTrend;
        }
      });

      trendItems.push({ period: String(year), totalBudgetLimit: totalBudgetLimitForYear, totalActualExpenses: totalActualExpensesForYear });
    } else {
      throw new BadRequestException(`PeriodType '${query.periodType}' is not supported for budget trend. Use 'monthly' or 'yearly'.`);
    }

    return trendItems.sort((a,b) => a.period.localeCompare(b.period));
  }
}
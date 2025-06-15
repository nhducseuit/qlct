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
import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import isBetween from 'dayjs/plugin/isBetween'; // Import isBetween plugin

dayjs.extend(quarterOfYear);
dayjs.extend(isBetween); // Extend dayjs with isBetween plugin

@Injectable()
export class SummariesService {
  constructor(private readonly prisma: PrismaService) {}

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

    const whereClause: Prisma.TransactionWhereInput = {
      userId,
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

    const transactionWhereInput: Prisma.TransactionWhereInput = {
      userId,
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
      select: {
        amount: true,
        type: true,
        categoryId: true,
        isShared: true, // Needed for member filtering
        payer: true,    // Needed for member filtering
        splitRatio: true, // Needed for member filtering
      },
    });

    // Further filter transactions by selected members if memberIds are provided
    if (query.memberIds && query.memberIds.length > 0) {
      periodTransactions = periodTransactions.filter(tx => {
        if (!tx.isShared) {
          return tx.payer ? query.memberIds!.includes(tx.payer) : false;
        } else {
          const split = tx.splitRatio as unknown as Array<{ memberId: string; percentage: number }>;
          return split && split.some(s => query.memberIds!.includes(s.memberId));
        }
      });
    };

    const categoryTotals: Record<string, { income: number; expense: number }> = {};

    for (const t of periodTransactions) { // Use the filtered periodTransactions
      if (!categoryTotals[t.categoryId]) {
        categoryTotals[t.categoryId] = { income: 0, expense: 0 };
      }
      // If member filter is applied, we need to consider the portion for shared expenses
      let amountToConsider = t.amount;
      if (query.memberIds && query.memberIds.length > 0 && t.isShared) {
        const split = t.splitRatio as unknown as Array<{ memberId: string; percentage: number }>;
        amountToConsider = 0;
        if (split) {
          split.forEach(s => {
            if (query.memberIds!.includes(s.memberId)) {
              amountToConsider += t.amount * (s.percentage / 100);
            }
          });
        }
      }

      // If query.transactionType is 'expense', periodTransactions only contains expenses.
      // If query.transactionType is 'all' (or undefined), periodTransactions contains all types.
      // This report focuses on expense breakdown, so we only sum expenses.
      // If income were to be part of this report's display, categoryTotals and DTOs would need 'income' fields. - THIS IS NOW THE CASE
      if (t.type === 'income') {
        categoryTotals[t.categoryId].income += amountToConsider;
      } else if (t.type === 'expense') {
        categoryTotals[t.categoryId].expense += amountToConsider;
      }
    }

    // Determine the set of category IDs we need to fetch details for.
    // This will be either the globally filtered category IDs, or all categories that had transactions.
    let idsForCategoryFetch: string[];
    if (query.categoryIds && query.categoryIds.length > 0) {
      idsForCategoryFetch = query.categoryIds;
    } else {
      idsForCategoryFetch = Object.keys(categoryTotals);
    }

    if (idsForCategoryFetch.length === 0) {
      // No categories to display based on filters or transaction activity for the period.
      return [];
    }

    const categoryQueryWhere: Prisma.CategoryWhereInput = {
      userId,
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

    const transactionWhereInput: Prisma.TransactionWhereInput = {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
      // type: 'expense', // Removed hardcoded filter
      isShared: true,
      splitRatio: { not: Prisma.DbNull },
    };

    if (query.transactionType === 'expense') {
      transactionWhereInput.type = 'expense';
    }
    const transactions = await this.prisma.transaction.findMany({
      where: transactionWhereInput,
      select: {
        amount: true,
        type: true,
        splitRatio: true, // Prisma.JsonValue
        // No need to select payer here as member breakdown is based on splitRatio of shared expenses
      },
    });

    const memberTotals: Record<string, { income: number; expense: number }> = {};

    for (const t of transactions) {
      const splitRatio = t.splitRatio as unknown as Array<{ memberId: string; percentage: number }>;
      if (!splitRatio || !Array.isArray(splitRatio)) continue;

      for (const split of splitRatio) {
        if (!memberTotals[split.memberId]) {
          memberTotals[split.memberId] = { income: 0, expense: 0 };
        }
        const memberPortion = t.amount * (split.percentage / 100);
        // This report focuses on expense breakdown for members.
        // If query.transactionType is 'expense', all 't' are expenses.
        if (t.type === 'income') {
          memberTotals[split.memberId].income += memberPortion;
        } else if (t.type === 'expense') {
          memberTotals[split.memberId].expense += memberPortion;
        }
      }
    }

    const memberIds = Object.keys(memberTotals);
    const memberWhere: Prisma.HouseholdMemberWhereInput = {
      id: { in: memberIds },
      userId,
      isActive: true,
    };
    if (query.memberIds && query.memberIds.length > 0) { // Filter output by selected members
      memberWhere.id = { in: query.memberIds.filter(id => memberIds.includes(id)) };
    }

    const householdMembers = await this.prisma.householdMember.findMany({
      where: memberWhere,
      select: { id: true, name: true },
    });

    const result: MemberBreakdownItemDto[] = householdMembers.map(member => ({
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

    const whereClause: Prisma.TransactionWhereInput = {
      userId,
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
      where: {
        userId,
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
      where: {
        userId,
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
        where: {
          userId,
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
        userId, // Ensure categories belong to the user
      },
      select: { id: true, budgetLimit: true },
    });

    // Fetch all transactions for the relevant categories for the entire year first
    // We will then filter them per month and per member in the loop
    const yearTransactionsWhere: Prisma.TransactionWhereInput = {
      userId,
      // type: 'expense', // Removed hardcoded filter for actuals
      categoryId: { in: relevantCategories.map(c => c.id) },
      date: { gte: dayjs().year(year).startOf('year').toDate(), lte: dayjs().year(year).endOf('year').toDate() },
    };

    if (query.transactionType === 'expense') {
      yearTransactionsWhere.type = 'expense'; // Apply if specified, for actuals
    }

    const yearTransactions = relevantCategories.length > 0 ? await this.prisma.transaction.findMany({
      where: yearTransactionsWhere,
      select: { amount: true, date: true, isShared: true, payer: true, splitRatio: true, categoryId: true, type: true }, // Added type here
    }) : [];

    if (query.periodType === PeriodType.Monthly) {
      for (let i = 0; i < 12; i++) { // Iterate through 12 months
        const currentMonthDate = dayjs().year(year).month(i);
        const startDate = currentMonthDate.startOf('month').toDate();
        const endDate = currentMonthDate.endOf('month').toDate();
        const periodLabel = currentMonthDate.format('YYYY-MM');
        let totalBudgetLimitForPeriod = 0;
        relevantCategories.forEach(cat => {
          totalBudgetLimitForPeriod += cat.budgetLimit || 0; // Assumes budgetLimit is monthly
        });

        let totalActualExpensesForPeriod = 0;
        const monthTransactions = yearTransactions.filter(tx => dayjs(tx.date).isBetween(startDate, endDate, null, '[]'));

        monthTransactions.forEach(tx => {
          // Only sum up if it's an expense transaction, especially if transactionType was 'all'
          if (tx.type === 'expense') {
            let expenseAmountForTx = tx.amount;
            if (query.memberIds && query.memberIds.length > 0) { // Filter by member
              if (!tx.isShared) {
                if (!tx.payer || !query.memberIds.includes(tx.payer)) {
                  expenseAmountForTx = 0; // Exclude if payer not in selected members
                }
              } else { // Shared expense
                const split = tx.splitRatio as unknown as Array<{ memberId: string; percentage: number }>;
                let memberPortion = 0;
                if (split) {
                  split.forEach(s => {
                    if (query.memberIds!.includes(s.memberId)) {
                      memberPortion += tx.amount * (s.percentage / 100);
                    }
                  });
                }
                expenseAmountForTx = memberPortion;
              }
            }
            totalActualExpensesForPeriod += expenseAmountForTx;
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
      // This will produce a single data point for the specified year.
      const startDate = dayjs().year(year).startOf('year').toDate();
      const endDate = dayjs().year(year).endOf('year').toDate();

      let totalBudgetLimitForYear = 0;
      relevantCategories.forEach(cat => {
        totalBudgetLimitForYear += (cat.budgetLimit || 0) * 12; // Annualize monthly budget
      });

      let totalActualExpensesForYear = 0;
      yearTransactions.forEach(tx => {
        // Only sum up if it's an expense transaction
        if (tx.type === 'expense') {
          let expenseAmountForTx = tx.amount;
          if (query.memberIds && query.memberIds.length > 0) { // Filter by member
            if (!tx.isShared) {
              if (!tx.payer || !query.memberIds.includes(tx.payer)) {
                expenseAmountForTx = 0;
              }
            } else { // Shared expense
              const split = tx.splitRatio as unknown as Array<{ memberId: string; percentage: number }>;
              let memberPortion = 0;
              if (split) {
                split.forEach(s => {
                  if (query.memberIds!.includes(s.memberId)) {
                    memberPortion += tx.amount * (s.percentage / 100);
                  }
                });
              }
              expenseAmountForTx = memberPortion;
            }
          }
          totalActualExpensesForYear += expenseAmountForTx;
        }
      });

      trendItems.push({ period: String(year), totalBudgetLimit: totalBudgetLimitForYear, totalActualExpenses: totalActualExpensesForYear });
    } else {
      throw new BadRequestException(`PeriodType '${query.periodType}' is not supported for budget trend. Use 'monthly' or 'yearly'.`);
    }

    return trendItems.sort((a,b) => a.period.localeCompare(b.period));
  }
}
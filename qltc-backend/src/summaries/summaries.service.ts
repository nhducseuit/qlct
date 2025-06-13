import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PeriodType, GetTotalsSummaryQueryDto } from './dto/get-totals-summary.dto';
import { PeriodSummaryDto } from './dto/totals-summary-response.dto';
import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';

dayjs.extend(quarterOfYear);

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

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
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
}
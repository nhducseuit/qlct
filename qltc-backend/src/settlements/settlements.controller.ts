import { Controller, Get, Query, UseGuards, Req, Post, Body, HttpStatus } from '@nestjs/common';
import { SettlementsService } from './settlements.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiCreatedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BalancesResponseDto } from './dto/balances-response.dto';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { SettlementDto } from './dto/settlement.dto';
import { GetBalancesQueryDto } from './dto/get-balances-query.dto';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

@ApiTags('Settlements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settlements')
export class SettlementsController {
    constructor(private readonly settlementsService: SettlementsService) {}

  @Get('balances')
  @ApiOperation({ summary: 'Calculate and retrieve member balances' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved member balances.',
    type: BalancesResponseDto,
  })
  async getBalances(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetBalancesQueryDto,
  ): Promise<BalancesResponseDto> {
    const userId = req.user.userId;
    return this.settlementsService.calculateBalances(userId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Record a new settlement between members' })
  @ApiCreatedResponse({
    description: 'The settlement has been successfully recorded.',
    type: SettlementDto,
  })
  async createSettlement(@Req() req: AuthenticatedRequest, @Body() createSettlementDto: CreateSettlementDto): Promise<SettlementDto> {
    const userId = req.user.userId;
    return this.settlementsService.createSettlement(userId, createSettlementDto);
  }
}

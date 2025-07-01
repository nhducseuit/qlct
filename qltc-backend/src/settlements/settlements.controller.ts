import { Controller, Get, Query, UseGuards, Req, Post, Body, HttpStatus } from '@nestjs/common';
import { SettlementsService } from './settlements.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiCreatedResponse } from '@nestjs/swagger';
import { BalancesResponseDto } from './dto/balances-response.dto';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { SettlementDto } from './dto/settlement.dto';
import { GetBalancesQueryDto } from './dto/get-balances-query.dto';
import { GetSettlementsQueryDto } from './dto/get-settlements-query.dto';
import { PaginatedSettlementsResponseDto } from './dto/paginated-settlements-response.dto';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FamilyGuard } from '../auth/guards/family.guard';

@ApiTags('Settlements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, FamilyGuard)
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
    const { familyId } = req.user;
    return this.settlementsService.calculateBalances(familyId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Record a new settlement between members' })
  @ApiCreatedResponse({
    description: 'The settlement has been successfully recorded.',
    type: SettlementDto,
  })
  async createSettlement(
    @Req() req: AuthenticatedRequest,
    @Body() createSettlementDto: CreateSettlementDto,
  ): Promise<SettlementDto> {
    const { familyId, id: userId } = req.user;
    return this.settlementsService.createSettlement(familyId, userId, createSettlementDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve a paginated list of settlements' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved settlements.',
    type: PaginatedSettlementsResponseDto,
  })
  async getSettlements(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetSettlementsQueryDto,
  ): Promise<PaginatedSettlementsResponseDto> {
    const { familyId } = req.user;
    return this.settlementsService.getSettlements(familyId, query);
  }
}

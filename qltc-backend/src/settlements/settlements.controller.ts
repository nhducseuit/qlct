import { Controller, Get, Query, UseGuards, Req, Post, Body } from '@nestjs/common';
import { SettlementsService } from './settlements.service';
import { PersonService } from '../person/person.service'; // <-- Add this import
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
  constructor(
    private readonly settlementsService: SettlementsService,
    private readonly personService: PersonService // <-- Inject PersonService
  ) {}

  /**
   * GET /settlements/balances
   * Calculate and retrieve person-to-person balances for a family
   */
  @Get('balances')
  @ApiOperation({ summary: 'Calculate and retrieve person-to-person balances' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved balances.',
    type: BalancesResponseDto,
  })
  async getBalances(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetBalancesQueryDto,
  ): Promise<BalancesResponseDto> {
    const { familyId } = req.user;
    return this.settlementsService.calculateBalances(familyId, query);
  }

  /**
   * POST /settlements
   * Record a new person-to-person settlement
   */
  @Post()
  @ApiOperation({ summary: 'Record a new settlement between persons' })
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

  /**
   * GET /settlements
   * Retrieve a paginated list of person-to-person settlements
   */
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
    // Use the same logic as get persons API
    const userId = req.user.id;
    const memberships = await this.personService.getMembershipsByUserId(userId);
    const familyIds = memberships.map((m: { familyId: string }) => m.familyId);
    let accessiblePersonIds: string[] = [];
    if (familyIds.length > 0) {
      const persons = await this.personService.findByFamilyIds(familyIds);
      accessiblePersonIds = persons.map((p: { id: string }) => p.id);
    }
    return this.settlementsService.getSettlementsAccessible(query, accessiblePersonIds);
  }
}
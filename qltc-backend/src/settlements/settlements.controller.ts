import { Controller, Get, Query, UseGuards, Req, Post, Body, HttpStatus } from '@nestjs/common';
import { SettlementsService } from './settlements.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiCreatedResponse } from '@nestjs/swagger';
import { BalancesResponseDto } from './dto/balances-response.dto';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { SettlementDto } from './dto/settlement.dto';
import { GetBalancesQueryDto } from './dto/get-balances-query.dto';
import { GetSettlementsQueryDto } from './dto/get-settlements-query.dto';
import { PaginatedSettlementsResponseDto } from './dto/paginated-settlements-response.dto';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface'; // Assuming you'll re-enable this
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Assuming you'll re-enable this

@ApiTags('Settlements')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard) // Temporarily removed for development: "no authorization yet"
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
  ): Promise<BalancesResponseDto> { // Correctly access the user ID from the 'id' property of req.user
    const userId = req.user?.id || 'dev-user'; // DEV mode default
    return this.settlementsService.calculateBalances(userId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Record a new settlement between members' })
  @ApiCreatedResponse({
    description: 'The settlement has been successfully recorded.',
    type: SettlementDto,
  })
  async createSettlement(@Req() req: AuthenticatedRequest, @Body() createSettlementDto: CreateSettlementDto): Promise<SettlementDto> {
    console.log('[SettlementsController] req.user (createSettlement):', JSON.stringify(req.user, null, 2)); // Correctly access the user ID from the 'id' property of req.user
    const userId = req.user?.id || 'dev-user'; // DEV mode default
    console.log('[SettlementsController] Extracted userId:', userId);
    return this.settlementsService.createSettlement(userId, createSettlementDto);
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
    // Correctly access the user ID from the 'id' property of req.user as indicated by the console log of req.user.
    const userId = req.user?.id || 'dev-user'; // DEV mode default
    return this.settlementsService.getSettlements(userId, query);
  }
}

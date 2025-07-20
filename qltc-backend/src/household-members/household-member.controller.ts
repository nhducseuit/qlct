import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { HouseholdMemberService } from './household-member.service';
import { CreateHouseholdMemberDto } from './dto/create-household-member.dto';
import { UpdateHouseholdMemberDto } from './dto/update-household-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { FamilyGuard } from '../auth/guards/family.guard';

@ApiBearerAuth()
@ApiTags('household-members')
@Controller('household-members')
@UseGuards(JwtAuthGuard, FamilyGuard)
export class HouseholdMemberController {
  constructor(private readonly householdMemberService: HouseholdMemberService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new household member' })
  @ApiResponse({ status: 201, description: 'The household member has been successfully created.', type: CreateHouseholdMemberDto })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  create(@Body() createHouseholdMemberDto: CreateHouseholdMemberDto, @Req() req: AuthenticatedRequest) {
    const { id: userId } = req.user;
    return this.householdMemberService.create(createHouseholdMemberDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all household members for the family' })
  @ApiResponse({ status: 200, description: 'List of household members.', type: [CreateHouseholdMemberDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findAll(@Req() req: AuthenticatedRequest) {
    const { familyId } = req.user;
    return this.householdMemberService.findAll(familyId);
  }

  @Get('my-members-by-family')
  @ApiOperation({ summary: 'Get all my household members grouped by family (hierarchical)' })
  @ApiResponse({ status: 200, description: 'List of household members grouped by family.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getMyMembersByFamily(@Req() req: AuthenticatedRequest) {
    const { email } = req.user;
    return this.householdMemberService.getMyMembersGroupedByFamilyByEmail(email);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a household member by ID' })
  @ApiParam({ name: 'id', description: 'Household Member ID', type: String })
  @ApiResponse({ status: 200, description: 'The found household member.', type: CreateHouseholdMemberDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Household member not found.' })
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const { familyId } = req.user; // Extract familyId from the request
    return this.householdMemberService.findOne(id, familyId); // Pass familyId to the service
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a household member by ID' })
  @ApiParam({ name: 'id', description: 'Household Member ID', type: String })
  @ApiResponse({ status: 200, description: 'The household member has been successfully updated.', type: CreateHouseholdMemberDto })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Household member not found.' })
  update(
    @Param('id') id: string,
    @Body() updateHouseholdMemberDto: UpdateHouseholdMemberDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const { id: userId } = req.user;
    return this.householdMemberService.update(id, updateHouseholdMemberDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a household member by ID' })
  @ApiParam({ name: 'id', description: 'Household Member ID', type: String })
  @ApiResponse({ status: 200, description: 'The household member has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Household member not found.' })
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const { familyId, id: userId } = req.user;
    return this.householdMemberService.remove(id, familyId, userId);
  }
}

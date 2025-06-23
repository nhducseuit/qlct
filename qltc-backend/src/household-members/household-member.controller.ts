import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { HouseholdMemberService } from './household-member.service';
import { CreateHouseholdMemberDto } from './dto/create-household-member.dto';
import { UpdateHouseholdMemberDto } from './dto/update-household-member.dto';
import { HouseholdMember as HouseholdMemberModel } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

@ApiBearerAuth()
@ApiTags('household-members')
@Controller('household-members')
@UseGuards(JwtAuthGuard) // Protect all routes in this controller
export class HouseholdMemberController {
  constructor(private readonly householdMemberService: HouseholdMemberService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new household member' })
  @ApiResponse({ status: 201, description: 'The household member has been successfully created.', type: CreateHouseholdMemberDto }) // Ideally HouseholdMemberModel
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  create(@Body() createHouseholdMemberDto: CreateHouseholdMemberDto, @Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.householdMemberService.create(createHouseholdMemberDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all household members for the user' })
  @ApiResponse({ status: 200, description: 'List of household members.', type: [CreateHouseholdMemberDto] }) // Ideally HouseholdMemberModel[]
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findAll(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.householdMemberService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a household member by ID' })
  @ApiParam({ name: 'id', description: 'Household Member ID (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'The found household member.', type: CreateHouseholdMemberDto }) // Ideally HouseholdMemberModel
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Household member not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedRequest) {
    return this.householdMemberService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a household member by ID' })
  @ApiParam({ name: 'id', description: 'Household Member ID (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'The household member has been successfully updated.', type: CreateHouseholdMemberDto }) // Ideally HouseholdMemberModel
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Household member not found.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateHouseholdMemberDto: UpdateHouseholdMemberDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    return this.householdMemberService.update(id, updateHouseholdMemberDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a household member by ID' })
  @ApiParam({ name: 'id', description: 'Household Member ID (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'The household member has been successfully deleted.' }) // Or 204 No Content
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Household member not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.householdMemberService.remove(id, userId);
  }
}
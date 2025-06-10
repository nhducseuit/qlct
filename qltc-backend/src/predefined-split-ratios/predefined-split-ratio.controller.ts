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
} from '@nestjs/common';
import { PredefinedSplitRatioService } from './predefined-split-ratio.service';
import { CreatePredefinedSplitRatioDto } from './dto/create-predefined-split-ratio.dto';
import { UpdatePredefinedSplitRatioDto } from './dto/update-predefined-split-ratio.dto'; // Corrected import path
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
// Assuming you have a JWT auth guard
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// Mock AuthGuard for DEV mode
class MockAuthGuard {
  canActivate(context: any): boolean {
    const request = context.switchToHttp().getRequest();
    // In DEV mode, we assume a 'dev-user' is authenticated
    // In a real app, this would validate a JWT token
    request.user = { id: 'dev-user' }; // Attach a mock user object
    return true; // Always allow in mock mode
  }
}

@ApiTags('predefined-split-ratios')
@ApiBearerAuth() // Indicate that this controller requires JWT authentication
@Controller('predefined-split-ratios')
// @UseGuards(JwtAuthGuard) // Use your actual JWT auth guard here
@UseGuards(MockAuthGuard) // Use mock guard for DEV
export class PredefinedSplitRatioController {
  constructor(
    private readonly predefinedSplitRatioService: PredefinedSplitRatioService,
  ) {}

  @Post()
  create(
    @Body() createPredefinedSplitRatioDto: CreatePredefinedSplitRatioDto,
    @Req() req: any, // Use 'any' for mock user, replace with actual Request type
  ) {
    // The user object is attached to the request by the AuthGuard
    const userId = req.user.id;
    return this.predefinedSplitRatioService.create(
      createPredefinedSplitRatioDto,
      userId,
    );
  }

  @Get()
  findAll(@Req() req: any) {
    const userId = req.user.id;
    return this.predefinedSplitRatioService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.predefinedSplitRatioService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePredefinedSplitRatioDto: UpdatePredefinedSplitRatioDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.predefinedSplitRatioService.update(
      id,
      updatePredefinedSplitRatioDto,
      userId,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.predefinedSplitRatioService.remove(id, userId);
  }
}
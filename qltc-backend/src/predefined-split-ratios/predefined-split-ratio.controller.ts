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
import { PredefinedSplitRatioService } from './predefined-split-ratio.service';
import { CreatePredefinedSplitRatioDto } from './dto/create-predefined-split-ratio.dto';
import { UpdatePredefinedSplitRatioDto } from './dto/update-predefined-split-ratio.dto'; // Corrected import path
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('predefined-split-ratios')
@ApiBearerAuth() // Indicate that JWT authentication is expected for Swagger
@Controller('predefined-split-ratios')
@UseGuards(JwtAuthGuard) // Re-enable JwtAuthGuard
export class PredefinedSplitRatioController {
  constructor(
    private readonly predefinedSplitRatioService: PredefinedSplitRatioService,
  ) {}

  @Post()
  create(
    @Body() createPredefinedSplitRatioDto: CreatePredefinedSplitRatioDto,
    @Req() req: AuthenticatedRequest,
  ) {
    // The user object is attached to the request by the AuthGuard
    const userId = req.user.id;
    return this.predefinedSplitRatioService.create(
      createPredefinedSplitRatioDto,
      userId,
    );
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.predefinedSplitRatioService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedRequest) {
    return this.predefinedSplitRatioService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string,
    @Body() updatePredefinedSplitRatioDto: UpdatePredefinedSplitRatioDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    return this.predefinedSplitRatioService.update(
      id,
      updatePredefinedSplitRatioDto,
      userId,
    );
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.predefinedSplitRatioService.remove(id, userId);
  }
}
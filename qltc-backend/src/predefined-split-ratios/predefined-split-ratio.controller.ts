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
import { UpdatePredefinedSplitRatioDto } from './dto/update-predefined-split-ratio.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('predefined-split-ratios')
@ApiBearerAuth()
@Controller('predefined-split-ratios')
@UseGuards(JwtAuthGuard)
export class PredefinedSplitRatioController {
  constructor(
    private readonly predefinedSplitRatioService: PredefinedSplitRatioService,
  ) {}

  @Post()
  create(
    @Body() createPredefinedSplitRatioDto: CreatePredefinedSplitRatioDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const { familyId, id: userId } = req.user;
    return this.predefinedSplitRatioService.create(
      createPredefinedSplitRatioDto,
      familyId,
      userId,
    );
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    const { familyId } = req.user;
    return this.predefinedSplitRatioService.findAll(familyId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedRequest) {
    const { familyId } = req.user;
    return this.predefinedSplitRatioService.findOne(id, familyId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePredefinedSplitRatioDto: UpdatePredefinedSplitRatioDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const { familyId, id: userId } = req.user;
    return this.predefinedSplitRatioService.update(
      id,
      updatePredefinedSplitRatioDto,
      familyId,
      userId,
    );
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedRequest) {
    const { familyId, id: userId } = req.user;
    return this.predefinedSplitRatioService.remove(id, familyId, userId);
  }
}

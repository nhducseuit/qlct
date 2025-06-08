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
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction as TransactionModel } from '@generated/prisma';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Temporarily disabled for DEV

interface AuthenticatedRequest extends Request {
  user?: { userId: string; email: string }; // Make user optional for DEV mode
}

// @UseGuards(JwtAuthGuard) // Temporarily disabled for DEV
@ApiBearerAuth()
@ApiTags('transactions')
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, description: 'The transaction has been successfully created.', type: CreateTransactionDto }) // Ideally TransactionModel
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  create(@Body() createTransactionDto: CreateTransactionDto, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.userId || 'dev-user'; // Default to 'dev-user' if not authenticated
    return this.transactionService.create(createTransactionDto, userId);
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    // TODO: Add pagination and filtering (date range, category, etc.) via query params
    const userId = req.user?.userId || 'dev-user';
    return this.transactionService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transaction by ID' })
  @ApiParam({ name: 'id', description: 'Transaction ID (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'The found transaction.', type: CreateTransactionDto }) // Ideally TransactionModel
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.userId || 'dev-user';
    return this.transactionService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a transaction by ID' })
  @ApiParam({ name: 'id', description: 'Transaction ID (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'The transaction has been successfully updated.', type: CreateTransactionDto }) // Ideally TransactionModel
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateTransactionDto: UpdateTransactionDto, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.userId || 'dev-user';
    return this.transactionService.update(id, updateTransactionDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a transaction by ID' })
  @ApiParam({ name: 'id', description: 'Transaction ID (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'The transaction has been successfully deleted.' }) // Or 204 No Content
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.userId || 'dev-user';
    return this.transactionService.remove(id, userId);
  }
}
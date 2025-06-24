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
  Query, // Make sure Query is imported
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction as TransactionModel } from '@prisma/client'; // Use Prisma's generated type
import { TransactionResponseDto } from './dto/transaction-response.dto'; // Import the new DTO
import { GetTransactionsQueryDto } from './dto/get-transactions-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

@ApiBearerAuth()
@ApiTags('transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, description: 'The transaction has been successfully created.', type: TransactionResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  create(@Body() createTransactionDto: CreateTransactionDto, @Req() req: AuthenticatedRequest): Promise<TransactionModel> {
    const userId = req.user.id;
    return this.transactionService.create(createTransactionDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get transactions for the authenticated user, with optional filters' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved transactions.', type: [TransactionResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findFiltered(
    @Req() req: AuthenticatedRequest,
    @Query() queryDto: GetTransactionsQueryDto
  ): Promise<TransactionModel[]> {
    const userId = req.user.id;
    return this.transactionService.findFiltered(userId, queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transaction by ID' })
  @ApiParam({ name: 'id', description: 'Transaction ID (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'The found transaction.', type: TransactionResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedRequest): Promise<TransactionModel> {
    const userId = req.user.id;
    return this.transactionService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a transaction by ID' })
  @ApiParam({ name: 'id', description: 'Transaction ID (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'The transaction has been successfully updated.', type: TransactionResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @Req() req: AuthenticatedRequest
  ): Promise<TransactionModel> {
    const userId = req.user.id;
    return this.transactionService.update(id, updateTransactionDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a transaction by ID' })
  @ApiParam({ name: 'id', description: 'Transaction ID (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'The transaction has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedRequest): Promise<{ message: string }> {
    const userId = req.user.id;
    return this.transactionService.remove(id, userId);
  }
}

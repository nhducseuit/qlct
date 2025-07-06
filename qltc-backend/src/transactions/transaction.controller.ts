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
import { FamilyGuard } from '../auth/guards/family.guard';

@ApiBearerAuth()
@ApiTags('transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard, FamilyGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, description: 'The transaction has been successfully created.', type: TransactionResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  create(
    @Body() createTransactionDto: CreateTransactionDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<TransactionModel> {
    // The FamilyGuard has already validated that the user is part of this family.
    return this.transactionService.create(createTransactionDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get transactions for the authenticated user, with optional filters' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved transactions.', type: [TransactionResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query() queryDto: GetTransactionsQueryDto
  ): Promise<TransactionModel[]> {
    // The FamilyGuard has already validated the familyId and attached it to the request.
    // We use the familyId from the user object on the request.
    const familyId = req.user.familyId;
    return this.transactionService.findFiltered(familyId, queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transaction by ID' })
  @ApiParam({ name: 'id', description: 'Transaction ID (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'The found transaction.', type: TransactionResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @Body() body: { familyId: string }): Promise<TransactionModel | null> {
    // The FamilyGuard has already validated the familyId in the body.
    return this.transactionService.findOne(id, body.familyId);
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
    @Req() req: AuthenticatedRequest,
  ): Promise<TransactionModel | null> {
    // The FamilyGuard has already validated the familyId in the body.
    return this.transactionService.update(id, updateTransactionDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a transaction by ID' })
  @ApiParam({ name: 'id', description: 'Transaction ID (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'The transaction has been successfully deleted.', type: Object })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Body() body: { familyId: string }): Promise<{ message: string }> {
    // The FamilyGuard has already validated the familyId in the body.
    return this.transactionService.remove(id, body.familyId);
  }
}

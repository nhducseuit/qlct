// src/settlements/dto/paginated-settlements-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { SettlementDto } from './settlement.dto';

export class PaginationMetaDto {
  @ApiProperty()
  totalItems!: number;

  @ApiProperty()
  itemCount!: number;

  @ApiProperty()
  itemsPerPage!: number;

  @ApiProperty()
  totalPages!: number;

  @ApiProperty()
  currentPage!: number;
}

export class PaginatedSettlementsResponseDto {
  @ApiProperty({ type: [SettlementDto] })
  items!: SettlementDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}
// src/settlements/dto/balances-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { DetailedMemberBalanceDto } from './member-balance.dto';

export class BalancesResponseDto {
  @ApiProperty({
    type: [DetailedMemberBalanceDto],
    description: 'List of detailed balances between pairs of members.',
  })
  balances!: DetailedMemberBalanceDto[];

  // Optionally, a simplified summary for the current user:
  // @ApiProperty({ type: [MemberBalanceDto], description: "Simplified balances from the current user's perspective." })
  // userPerspectiveBalances?: MemberBalanceDto[];
}

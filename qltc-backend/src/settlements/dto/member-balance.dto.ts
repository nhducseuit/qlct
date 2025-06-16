// src/settlements/dto/member-balance.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class MemberBalanceDto {
  @ApiProperty({ description: 'ID of the member who owes or is owed.' })
  memberId!: string;

  @ApiProperty({ description: 'Name of the member.' })
  memberName!: string;

  @ApiProperty({
    description:
      'The net amount. Positive if this member is owed by the context member, negative if this member owes the context member.',
  })
  amount!: number; // e.g., if A owes B $10, for B's perspective on A, amount = -10. For A's perspective on B, amount = +10
}

export class DetailedMemberBalanceDto {
  @ApiProperty({ description: 'ID of the first member in the pair.' })
  memberOneId!: string;

  @ApiProperty({ description: 'Name of the first member.' })
  memberOneName!: string;

  @ApiProperty({ description: 'ID of the second member in the pair.' })
  memberTwoId!: string;

  @ApiProperty({ description: 'Name of the second member.' })
  memberTwoName!: string;

  @ApiProperty({
    description:
      'Net amount memberOne owes memberTwo. Positive if memberOne owes memberTwo, negative if memberTwo owes memberOne.',
  })
  netAmountMemberOneOwesMemberTwo!: number;
}

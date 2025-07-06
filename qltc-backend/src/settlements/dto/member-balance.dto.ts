// src/settlements/dto/member-balance.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class DetailedMemberBalanceDto {
  @ApiProperty({ description: 'ID of the first person in the pair.' })
  personOneId!: string;

  @ApiProperty({ description: 'Name of the first member.' })
  memberOneName!: string;

  @ApiProperty({ description: 'ID of the second person in the pair.' })
  personTwoId!: string;

  @ApiProperty({ description: 'Name of the second member.' })
  memberTwoName!: string;

  @ApiProperty({
    description:
      'Net amount personOne owes personTwo. Positive if personOne owes personTwo, negative if personTwo owes personOne.',
  })
  netAmountPersonOneOwesPersonTwo!: number;
}

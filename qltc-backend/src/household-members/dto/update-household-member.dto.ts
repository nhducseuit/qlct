import { PartialType } from '@nestjs/mapped-types';
import { CreateHouseholdMemberDto } from './create-household-member.dto';

export class UpdateHouseholdMemberDto extends PartialType(CreateHouseholdMemberDto) {}
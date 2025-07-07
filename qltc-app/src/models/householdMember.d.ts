export interface HouseholdMember {
  id: string;
  familyId: string;
  personId: string;
  isActive: boolean;
  order?: number;
  person?: Person;
  createdAt: string;
  updatedAt: string;
}
import type { Person } from './person';

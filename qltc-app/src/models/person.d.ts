export interface Person {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  userId?: string | null;
  createdAt: string;
  updatedAt: string;
}

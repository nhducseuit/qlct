import apiClient from './api';

export interface Person {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  socialId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePersonPayload {
  name: string;
  email?: string;
  phone?: string;
  socialId?: string;
}

export const searchPersonsAPI = async (query: string): Promise<Person[]> => {
  const response = await apiClient.get<Person[]>('/persons', { params: { q: query } });
  return response.data;
};

export const createPersonAPI = async (payload: CreatePersonPayload): Promise<Person> => {
  const response = await apiClient.post<Person>('/persons', payload);
  return response.data;
};

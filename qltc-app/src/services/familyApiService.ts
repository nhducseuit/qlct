import api from './api';
import type { Family } from '../models/family';

export async function getFamilies(): Promise<Family[]> {
  const res = await api.get('/families');
  return res.data;
}

export async function createFamily(payload: { name: string }): Promise<Family> {
  const res = await api.post('/families', payload);
  return res.data;
}

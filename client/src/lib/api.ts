import type { MysteryCase, MysteryResult } from './types';

const base = '/api/v1';
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${base}${path}`, { ...init, cache: 'no-store', credentials: 'include', headers: { 'Content-Type': 'application/json', ...init?.headers } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.error?.message || 'We could not complete that request. Please try again.');
  return body as T;
}
export const api = {
  createCase: (data: object) => request<{ caseId: string; status: string; pollAfterMs: number }>('/cases', { method: 'POST', body: JSON.stringify(data) }),
  getCase: (id: string) => request<MysteryCase>(`/cases/${id}`),
  accuse: (id: string, data: object) => request(`/cases/${id}/accusations`, { method: 'POST', body: JSON.stringify(data) }),
  getResult: (id: string) => request<MysteryResult>(`/cases/${id}/result`),
};

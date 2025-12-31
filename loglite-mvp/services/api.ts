import { API_BASE_URL } from '../constants';
import { ApiResponse, SystemLog, NetworkLog, ServerLog, SecurityStats } from '../types';
import { mockApi } from './mockService';

const USE_MOCK_BY_DEFAULT = true; // Set to true for preview environments where backend isn't running

async function fetchJson<T>(endpoint: string, params: Record<string, any> = {}, fallback: () => Promise<T>): Promise<T> {
  if (USE_MOCK_BY_DEFAULT) {
    console.log(`[MockAPI] Serving ${endpoint}`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600)); 
    return fallback();
  }

  const url = new URL(`${API_BASE_URL}${endpoint}`);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.warn(`Backend unreachable (${endpoint}), falling back to mock data.`);
    return fallback();
  }
}

export const api = {
  health: () => fetchJson('/health', {}, mockApi.health),
  
  logs: {
    system: (type: string, limit = 50) => 
      fetchJson<ApiResponse<SystemLog>>(`/logs/${type}`, { limit }, () => mockApi.logs.system(type, limit)),
      
    network: (type: string, limit = 50) => 
      fetchJson<ApiResponse<NetworkLog>>(`/logs/${type}`, { limit }, () => mockApi.logs.network(type, limit)),
      
    server: (type: string, limit = 50) => 
      fetchJson<ApiResponse<ServerLog>>(`/logs/${type}`, { limit }, () => mockApi.logs.server(type, limit)),
  },

  stats: {
    security: () => fetchJson<SecurityStats>('/stats/security', {}, mockApi.stats.security),
  }
};

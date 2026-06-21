import { apiClient } from './client'
import type { WillApiResponse } from '@/types/will.types'

export async function askWill(message: string): Promise<WillApiResponse> {
  const response = await apiClient.post<WillApiResponse>('/ai/location-filter', { message })
  return response.data
}

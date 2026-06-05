import { apiClient } from './client'
import type { Difficulty } from '@/types/domain'

export interface PublicLocation {
  id: string
  name: string
  description: string | null
  difficulty: Difficulty
  image_url: string | null
}

export interface PublicProviderProfile {
  id: number
  first_name: string
  last_name: string
  organization_name: string | null
  profile_picture_url: string | null
  bio: string | null
  locations: PublicLocation[]
}

export async function getPublicProviderProfile(id: string | number): Promise<PublicProviderProfile> {
  const response = await apiClient.get<PublicProviderProfile>(`/providers/${id}/public`)
  return response.data
}

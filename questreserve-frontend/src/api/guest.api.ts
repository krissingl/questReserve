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
  id: string
  first_name: string
  last_name: string
  organization_name: string | null
  profile_picture_url: string | null
  bio: string | null
  locations: PublicLocation[]
}

export async function getPublicProviderProfile(id: string): Promise<PublicProviderProfile> {
  const response = await apiClient.get<PublicProviderProfile>(`/providers/${id}/public`)
  return response.data
}

export interface ReviewItem {
  id: string
  rating: number
  body: string | null
  created_at: string
  reviewer_first_name?: string | null
  reviewer_last_name?: string | null
}

export interface ReviewsResponse {
  reviews: ReviewItem[]
  averageRating: number
  count: number
}

export async function getReviews(
  targetId: string,
  targetType: 'provider' | 'customer' | 'location'
): Promise<ReviewsResponse> {
  const response = await apiClient.get<ReviewsResponse>('/reviews', {
    params: { targetId, targetType },
  })
  return response.data
}

export interface LocationRatingSummary {
  averageRating: number
  count: number
}

export async function getLocationAverages(): Promise<Record<string, LocationRatingSummary>> {
  const response = await apiClient.get<Record<string, LocationRatingSummary>>('/reviews/location-averages')
  return response.data
}

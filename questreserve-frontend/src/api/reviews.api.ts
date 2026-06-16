import { apiClient } from './client'

export interface SubmitReviewPayload {
  targetId: string
  targetType: 'provider' | 'customer' | 'location'
  bookingId: string
  rating: number
  body?: string | null
}

export interface ReviewResult {
  id: string
  reviewer_id: string
  reviewer_type: 'provider' | 'customer'
  target_id: string
  target_type: 'provider' | 'customer' | 'location'
  booking_id: string
  rating: number
  body: string | null
  created_at: string
}

export async function submitReview(payload: SubmitReviewPayload): Promise<ReviewResult> {
  const response = await apiClient.post<ReviewResult>('/reviews', payload)
  return response.data
}

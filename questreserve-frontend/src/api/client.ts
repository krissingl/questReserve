import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_URL as string | undefined
if (!apiUrl) {
  throw new Error(
    '[client.ts] VITE_API_URL is not defined. ' +
      'Add VITE_API_URL to your .env file and restart the dev server.',
  )
}

let _token: string | null = null

export function setAuthToken(token: string | null): void {
  _token = token
}

export const apiClient = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  if (_token) {
    config.headers.Authorization = `Bearer ${_token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401
    ) {
      setAuthToken(null)
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

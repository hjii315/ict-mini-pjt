// API service for connecting with the backend MCP server
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'

export interface UserLocation {
  lat: number
  lng: number
}

export interface Restaurant {
  place_id: string
  place_name: string
  place_url: string
  place_phone: string
  place_address: string
  place_road_address: string
  place_category: string
  place_x: number
  place_y: number
  distance: string
  image_url: string
  source: string
}

export interface MidpointInfo {
  lat: number
  lng: number
  address: string
  road_address: string
  jibun_address: string
  region1: string
  region2: string
  region3: string
}

export interface RecommendationResponse {
  midpoint: MidpointInfo
  users: UserLocation[]
  restaurants: Restaurant[]
  source_stats: {
    kakao: number
    naver: number
    total: number
  }
  query: string
  total_found: number
  returned: number
}

export interface MCPCallRequest {
  name: string
  arguments: {
    users: UserLocation[]
    radius?: number
    cuisine?: string
    max_results?: number
  }
}

export interface MCPCallResponse {
  content: RecommendationResponse
  isError: boolean
}

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getHealthStatus(): Promise<{ status: string; service: string }> {
    return this.makeRequest('/health')
  }

  async getMCPTools(): Promise<{ tools: any[] }> {
    return this.makeRequest('/mcp/tools')
  }

  async getRestaurantRecommendations(
    users: UserLocation[],
    options: {
      radius?: number
      cuisine?: string
      max_results?: number
    } = {}
  ): Promise<RecommendationResponse> {
    const payload: MCPCallRequest = {
      name: 'recommend_meetup_restaurants',
      arguments: {
        users,
        radius: options.radius || 1000,
        cuisine: options.cuisine,
        max_results: options.max_results || 15,
      },
    }

    const response = await this.makeRequest<MCPCallResponse>('/mcp/call', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    if (response.isError) {
      throw new Error('Failed to get restaurant recommendations')
    }

    return response.content
  }

  async getCacheStats(): Promise<{ cache: any }> {
    return this.makeRequest('/cache/stats')
  }

  async clearCache(pattern: string = '*'): Promise<{ deleted: number; pattern: string }> {
    return this.makeRequest('/cache/clear', {
      method: 'POST',
      body: JSON.stringify({ pattern }),
    })
  }
}

export const apiService = new ApiService()

// Utility function to convert address to coordinates (geocoding)
export async function geocodeAddress(address: string): Promise<UserLocation | null> {
  try {
    // This would typically use a geocoding service like Kakao Maps API
    // For now, return null to indicate geocoding is needed
    console.warn('Geocoding not implemented yet. Address:', address)
    return null
  } catch (error) {
    console.error('Geocoding failed:', error)
    return null
  }
}

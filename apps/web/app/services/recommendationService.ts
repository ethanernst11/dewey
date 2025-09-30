import { RecommendationRequest, RecommendationResponse } from '../types/book';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const PROJECT_NAME = process.env.NEXT_PUBLIC_PROJECT_NAME || 'dewey';
const TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || '';

class RecommendationService {
  async getRecommendations(params: RecommendationRequest): Promise<RecommendationResponse> {
    const { sessionId, page = 1, batchCount = 10, events = [], searchPrompt = '' } = params;
    
    const url = `${API_BASE_URL}/hackathon/${PROJECT_NAME}/feed/${sessionId}`;
    console.log('url', url);
    const requestBody = {
      page,
      batch_count: batchCount,
      events,
      search_prompt: searchPrompt
    };

    console.log('Making API request to:', url);
    console.log('Request body:', requestBody);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API response:', data.cards);
    return data;
  }

  async getMockRecommendations(): Promise<RecommendationResponse> {
    return {
      cards: []
    };
  }
}

// Export a singleton instance
export const recommendationService = new RecommendationService();
export default recommendationService;

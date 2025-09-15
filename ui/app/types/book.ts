export interface Book {
  id: string;
  title: string;
  imageUrl: string;
  isRead: boolean;
  author?: string;
  description?: string;
  genre?: string;
  publishedYear?: number;
  productUrl?: string;
}

export interface ProductAttribute {
  name: string;
  value: string;
}

export interface Product {
  sku: string;
  body: string;
  title: string;
  image_url: string;
  product_url: string;
  attributes: ProductAttribute[];
}

export interface Card {
  type: string;
  id: string;
  product: Product;
}

export interface LingerEventProperties {
  organization_id: string;
  visitor_id: string;
  session_id: string;
  payload: Record<string, {
    enter_count: number;
    id: string;
    time: number;
    type: string;
  }>;
}

export interface AbstractInterestProperties {
  organization_id: string;
  visitor_id: string;
  session_id: string;
  id: string;
  weight: number;
}

export interface Event {
  event: string;
  properties: LingerEventProperties | AbstractInterestProperties;
}

export interface RecommendationRequest {
  sessionId: string;
  page?: number;
  batchCount?: number;
  events?: Event[];
  searchPrompt?: string;
}

export interface RecommendationResponse {
  cards: Card[];
}

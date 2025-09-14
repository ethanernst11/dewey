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

export interface RecommendationRequest {
  sessionId: string;
  page?: number;
  batchCount?: number;
  events?: string[];
  searchPrompt?: string;
}

export interface RecommendationResponse {
  cards: Card[];
}

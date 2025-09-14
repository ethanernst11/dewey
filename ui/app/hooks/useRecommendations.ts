'use client';

import { useState, useEffect, useCallback } from 'react';
import { Book, Card, RecommendationRequest, RecommendationResponse } from '../types/book';
import { recommendationService } from '../services/recommendationService';

interface UseRecommendationsReturn {
  books: Book[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  markAsRead: (bookId: string) => Promise<void>;
  markAsUnread: (bookId: string) => Promise<void>;
}


// Helper function to convert Card to Book
function cardToBook(card: Card): Book {
  const author = card.product.attributes.find(attr => attr.name === 'Author')?.value;
  const genre = card.product.attributes.find(attr => attr.name === 'genre')?.value;
  const publishedYear = card.product.attributes.find(attr => attr.name === 'Year Published')?.value;
  
  return {
    id: card.id,
    title: card.product.title,
    imageUrl: card.product.image_url,
    isRead: false, // Default to unread
    author,
    description: card.product.body,
    genre,
    publishedYear: publishedYear ? parseInt(publishedYear) : undefined,
    productUrl: card.product.product_url,
  };
}

export function useRecommendations(sessionId: string, params: Partial<RecommendationRequest> = {}): UseRecommendationsReturn {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(params.page || 1);

  const fetchRecommendations = useCallback(async (page: number = 1, append: boolean = false) => {
    try {

      if (params.searchPrompt) {
        params.searchPrompt = `Find book that has similar genre, year, author, title and description as ${params.searchPrompt}`
      }
      console.log('fetchRecommendations called with:', { page, append, searchPrompt: params.searchPrompt });
      setLoading(true);
      setError(null);


      const requestParams = { sessionId, ...params, page };
      const response = await recommendationService.getRecommendations(requestParams);
      console.log('API response:', response);
      
      const convertedBooks = response.cards.map(cardToBook);
      if (append) {
        setBooks(prevBooks => [...prevBooks, ...convertedBooks]);
      } else {
        setBooks(convertedBooks);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  }, [sessionId, params.batchCount, params.events, params.searchPrompt]);

  // Fetch recommendations when search prompt or other params change
  useEffect(() => {
    console.log('useEffect triggered for search:', params.searchPrompt);
    setCurrentPage(1);
    fetchRecommendations(1, false);
  }, [params.searchPrompt, params.batchCount, params.events, sessionId, fetchRecommendations]);

  const refetch = useCallback(async () => {
    await fetchRecommendations();
  }, [fetchRecommendations]);

  const loadMore = useCallback(async () => {
    if (loading) return;

    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    await fetchRecommendations(nextPage, true);
  }, [loading, currentPage, fetchRecommendations]);

  const markAsRead = useCallback(async (bookId: string) => {
    setBooks(prevBooks =>
      prevBooks.map(book =>
        book.id === bookId ? { ...book, isRead: true } : book
      )
    );
  }, []);

  const markAsUnread = useCallback(async (bookId: string) => {
    setBooks(prevBooks =>
      prevBooks.map(book =>
        book.id === bookId ? { ...book, isRead: false } : book
      )
    );
  }, []);


  return {
    books,
    loading,
    error,
    refetch,
    loadMore,
    markAsRead,
    markAsUnread,
  };
}

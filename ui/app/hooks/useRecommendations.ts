'use client';

import { useState, useEffect, useCallback } from 'react';
import { Book, Card, RecommendationRequest, Event } from '../types/book';
import { recommendationService } from '../services/recommendationService';
import { useLingerTracking } from './useLingerTracking';

interface UseRecommendationsReturn {
  books: Book[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  markAsRead: (bookId: string) => Promise<void>;
  markAsUnread: (bookId: string) => Promise<void>;
  trackCard: (cardId: string, element: HTMLElement) => void;
  untrackCard: (cardId: string) => void;
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
    status: 'want_to_read',
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

  const batchCount = params.batchCount ?? 10;
  const eventsFromParams = params.events;
  const searchPrompt = params.searchPrompt ?? '';

  // Initialize linger tracking
  const { trackCard, untrackCard, getLingerMetrics, resetTracking } = useLingerTracking(sessionId);

  const fetchRecommendations = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      console.log('fetchRecommendations called with:', { page, append, searchPrompt });
      setLoading(true);
      setError(null);

      // Get linger metrics before making the request
      const lingerEvent = getLingerMetrics();
      const events: Event[] = [...(eventsFromParams ?? [])];
      
      if (lingerEvent) {
        events.push(lingerEvent);
        console.log('Sending linger metrics:', lingerEvent);
      }
      const requestParams = {
        sessionId,
        page,
        batchCount,
        events,
        searchPrompt,
      };

      console.log('requestParams:', requestParams);
      const response = await recommendationService.getRecommendations(requestParams);
      console.log('API response:', response.cards);

      const convertedBooks = response.cards.map(cardToBook);
      console.log('convertedBooks:', convertedBooks);
      if (append) {
        setBooks(prevBooks => [...prevBooks, ...convertedBooks]);
      } else {
        // Reset tracking when loading new results (not appending)
        resetTracking();
        setBooks(convertedBooks);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  }, [sessionId, batchCount, eventsFromParams, searchPrompt, getLingerMetrics, resetTracking]);

  // Fetch recommendations when search prompt or other params change
  useEffect(() => {
    console.log('useEffect triggered for search:', searchPrompt);
    setCurrentPage(1);
    fetchRecommendations(1, false);
  }, [searchPrompt, batchCount, eventsFromParams, sessionId, fetchRecommendations]);

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
    trackCard,
    untrackCard,
  };
}

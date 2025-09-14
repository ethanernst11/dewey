'use client';

import { useState, useEffect, useCallback } from 'react';
import { Book } from '../types/book';
import { 
  addBookToLibrary, 
  removeBookFromLibrary, 
  markBookAsRead,
  markBookAsUnread,
  getLibraryBooks,
  isBookInLibrary
} from '../services/libService';

interface UseLibraryReturn {
  libraryBooks: Book[];
  addBook: (book: Book) => void;
  removeBook: (bookId: string) => void;
  markAsRead: (bookId: string) => void;
  markAsUnread: (bookId: string) => void;
  refreshLibrary: () => void;
  isInLibrary: (bookId: string) => boolean;
}

export function useLibrary(): UseLibraryReturn {
  const [libraryBooks, setLibraryBooks] = useState<Book[]>([]);

  const refreshLibrary = useCallback(() => {
    const books = getLibraryBooks();
    setLibraryBooks(books);
  }, []);

  const addBook = useCallback((book: Book) => {
    addBookToLibrary(book);
    refreshLibrary();
  }, [refreshLibrary]);

  const removeBook = useCallback((bookId: string) => {
    removeBookFromLibrary(bookId);
    refreshLibrary();
  }, [refreshLibrary]);

  const markAsRead = useCallback((bookId: string) => {
    markBookAsRead(bookId);
    refreshLibrary();
  }, [refreshLibrary]);

  const markAsUnread = useCallback((bookId: string) => {
    markBookAsUnread(bookId);
    refreshLibrary();
  }, [refreshLibrary]);

  const isInLibrary = useCallback((bookId: string) => {
    return isBookInLibrary(bookId);
  }, []);

  useEffect(() => {
    refreshLibrary();
  }, [refreshLibrary]);

  return {
    libraryBooks,
    addBook,
    removeBook,
    markAsRead,
    markAsUnread,
    refreshLibrary,
    isInLibrary,
  };
}

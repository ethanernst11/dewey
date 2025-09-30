'use client';

import { useState, useEffect, useCallback } from 'react';
import { Book } from '../types/book';
import { 
  addBookToLibrary, 
  removeBookFromLibrary, 
  markBookAsRead,
  markBookAsCurrentlyReading,
  markBookAsUnread,
  getLibraryBooks,
  isBookInLibrary
} from '../services/libService';

interface UseLibraryReturn {
  libraryBooks: Book[];
  readBooks: Book[];
  wantToReadBooks: Book[];
  currentlyReadingBooks: Book[];
  addBook: (book: Book) => void;
  removeBook: (bookId: string) => void;
  markAsRead: (bookId: string) => void;
  markAsReading: (bookId: string) => void;
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

  const markAsReading = useCallback((bookId: string) => {
    markBookAsCurrentlyReading(bookId);
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

  const getStatus = useCallback((book: Book) => {
    return book.status ?? (book.isRead ? 'read' : 'want_to_read');
  }, []);

  const readBooks = libraryBooks.filter(b => getStatus(b) === 'read');
  const currentlyReadingBooks = libraryBooks.filter(b => getStatus(b) === 'reading');
  const wantToReadBooks = libraryBooks.filter(b => getStatus(b) === 'want_to_read');

  return {
    libraryBooks,
    readBooks,
    wantToReadBooks,
    currentlyReadingBooks,
    addBook,
    removeBook,
    markAsRead,
    markAsReading,
    markAsUnread,
    refreshLibrary,
    isInLibrary,
  };
}

 'use client';

import { useMemo, useState, useCallback } from 'react';
import Navigation from './components/Navigation';
import Card from './components/Card';
import { useRecommendations } from './hooks/useRecommendations';
import { useLibrary } from './hooks/libHooks';

export default function FeedPage() {
  const sessionId = 'c53521d3-e2ba-4814-8e46-7c167799a949';
  
  // Create stable references to prevent infinite loops
  const [currentPage, setCurrentPage] = useState(1);
  const params = useMemo(() => ({
    page: currentPage,
    batchCount: 10,
    events: [] as string[],
    searchPrompt: ''
  }), [currentPage]);
  
  const { books, loading, error, loadMore } = useRecommendations(sessionId, params);
  const { addBook, isInLibrary, markAsRead, markAsUnread, readBooks, wantToReadBooks } = useLibrary();

  const [actionForId, setActionForId] = useState<string | null>(null);

  const closeActionMenu = useCallback(() => setActionForId(null), []);

  const handleCardClick = (book: any) => {
    if (isInLibrary(book.id)) {
      // Book is already in library, do nothing or show message
      console.log('Book is already in your library');
    } else {
      // Open action menu to choose how to add
      setActionForId(book.id);
    }
  };

  const handleAddAsRead = (book: any) => {
    addBook(book);
    markAsRead(book.id);
    closeActionMenu();
  };

  const handleAddAsWantToRead = (book: any) => {
    addBook(book);
    // Ensure isRead is false in stored book for consistency
    markAsUnread(book.id);
    closeActionMenu();
  };

  if (loading && books.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Feed</h2>
            <p className="text-gray-600">Discover new books and track your reading progress</p>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Feed</h2>
            <p className="text-gray-600">Discover new books and track your reading progress</p>
          </div>
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load recommendations</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Feed</h2>
          <p className="text-gray-600">Discover new books and track your reading progress</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => {
            const inLibrary = isInLibrary(book.id);
            const isReadInLibrary = readBooks.some(b => b.id === book.id);
            const isWantInLibrary = wantToReadBooks.some(b => b.id === book.id);
            return (
              <div 
                key={book.id} 
                className="cursor-pointer relative group"
                onClick={() => handleCardClick(book)}
              >
                <Card
                  id={book.id}
                  title={book.title}
                  imageUrl={book.imageUrl}
                  isRead={inLibrary ? isReadInLibrary : book.isRead}
                  author={book.author}
                  description={book.description}
                />
                
                {/* Library status indicator - only show for Want to Read since Read is shown in Card component */}
                {inLibrary && !isReadInLibrary && (
                  <div className="absolute top-6 right-6 bg-white text-yellow-500 w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  </div>
                )}
                
                {/* Add to library hint */}
                {!inLibrary && actionForId !== book.id && (
                  <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-75 text-white px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <p className="text-sm text-center">Click to choose how to add</p>
                  </div>
                )}

                {/* Action menu for adding */}
                {!inLibrary && actionForId === book.id && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-4" onClick={(e) => { e.stopPropagation(); }}>
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-xs p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Add to Library</h4>
                      <div className="space-y-2">
                        <button
                          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                          onClick={(e) => { e.stopPropagation(); handleAddAsWantToRead(book); }}
                        >
                          Mark as Want to Read
                        </button>
                        <button
                          className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                          onClick={(e) => { e.stopPropagation(); handleAddAsRead(book); }}
                        >
                          Mark as Read
                        </button>
                        <button
                          className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                          onClick={(e) => { e.stopPropagation(); closeActionMenu(); }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Loading...
              </div>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

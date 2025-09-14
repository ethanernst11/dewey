'use client';

import Navigation from '../components/Navigation';
import Card from '../components/Card';
import { useLibrary } from '../hooks/libHooks';

export default function LibPage() {
  const { libraryBooks, markAsRead, markAsUnread, removeBook } = useLibrary();

  const handleCardClick = (bookId: string, isRead: boolean) => {
    if (isRead) {
      markAsUnread(bookId);
    } else {
      markAsRead(bookId);
    }
  };

  const handleRemoveBook = (bookId: string) => {
    if (confirm('Are you sure you want to remove this book from your library?')) {
      removeBook(bookId);
    }
  };

  if (libraryBooks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">My Library</h2>
            <p className="text-gray-600">Your personal collection of books</p>
          </div>
          
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your library is empty</h3>
            <p className="text-gray-600 mb-4">Start building your collection by adding books from the feed</p>
            <a 
              href="/" 
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Browse Feed
            </a>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">My Library</h2>
          <p className="text-gray-600">Your personal collection of books ({libraryBooks.length} books)</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {libraryBooks.map((book) => (
            <div key={book.id} className="relative group">
              <div 
                className="cursor-pointer"
                onClick={() => handleCardClick(book.id, book.isRead)}
              >
                <Card
                  id={book.id}
                  title={book.title}
                  imageUrl={book.imageUrl}
                  isRead={book.isRead}
                  author={book.author}
                  description={book.description}
                />
              </div>
              
              {/* Remove button */}
              <button
                onClick={() => handleRemoveBook(book.id)}
                className="absolute top-2 left-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                title="Remove from library"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

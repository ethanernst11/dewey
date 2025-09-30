'use client';

import Navigation from './Navigation';
import SearchBar from './SearchBar';

interface PageLayoutProps {
  title: string;
  subtitle: string;
  onSearch: (query: string) => void;
  children: React.ReactNode;
  showSearchBar?: boolean;
}

export default function PageLayout({ 
  title, 
  subtitle, 
  onSearch, 
  children, 
  showSearchBar = true 
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600">{subtitle}</p>
        </div>

        {showSearchBar && (
          <div className="mb-8">
            <SearchBar 
              onSearch={onSearch}
              placeholder="Search for books by title, author, or genre..."
              className="max-w-lg"
            />
          </div>
        )}

        {children}
      </div>
    </div>
  );
}

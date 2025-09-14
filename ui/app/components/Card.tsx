import Image from 'next/image';

interface CardProps {
  id: string;
  title: string;
  imageUrl: string;
  isRead: boolean;
  author?: string;
  description?: string;
}

export default function Card({ title, imageUrl, isRead, author, description }: CardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 h-[28rem] flex flex-col">
      <div className="relative h-64 w-full shrink-0 bg-white p-4">
        <div className="relative h-full w-full">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-contain"
          />
        </div>
        {isRead && (
          <div className="absolute top-6 right-6 bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-3">
          {title}
        </h3>
        {author && (
          <p className="text-sm text-gray-600 mb-3">by {author}</p>
        )}
        {/* Spacer to ensure consistent bottom padding placement */}
        <div className="mt-auto" />
        {description && (
          <p className="text-base text-gray-700 line-clamp-5">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

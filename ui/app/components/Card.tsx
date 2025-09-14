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
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
        />
        {isRead && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            Read
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {title}
        </h3>
        {author && (
          <p className="text-sm text-gray-600 mb-2">by {author}</p>
        )}
        {description && (
          <p className="text-sm text-gray-700 line-clamp-3">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

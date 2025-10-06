'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, ImageIcon, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface ImageData {
  id: number;
  src: string;
  success: boolean;
  error?: string;
}

interface StatsData {
  total_images: number;
  successful_loads: number;
  failed_loads: number;
}

const fetchUserImages = async (): Promise<{
  success: boolean;
  data: {
    images: ImageData[];
    total_images: number;
    successful_loads: number;
    failed_loads: number;
  };
}> => {
  const response = await fetch('/api/face-recognition/images-display', {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch images');
  }

  return data;
};

const UserImagesGallery = () => {
  const [hasError, setHasError] = useState(false)
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['userImages'],
    queryFn: fetchUserImages,
  });

  const stats: StatsData = {
    total_images: data?.data?.total_images ?? 0,
    successful_loads: data?.data?.successful_loads ?? 0,
    failed_loads: data?.data?.failed_loads ?? 0,
  };

  const images: ImageData[] = data?.data?.images || [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600">Loading your images...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 p-8">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Images</h3>
        <p className="text-gray-600 text-center mb-4">{(error as Error).message}</p>
        <Button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Your Image Gallery</h1>
        </div>
        <Button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Bar */}
      {stats.total_images > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-4">
              <span className="text-green-600 font-medium">
                ✓ {stats.successful_loads} loaded
              </span>
              {stats.failed_loads > 0 && (
                <span className="text-red-600 font-medium">
                  ✗ {stats.failed_loads} failed
                </span>
              )}
            </div>
            <span className="text-gray-500">
              Total: {stats.total_images} images
            </span>
          </div>
        </div>
      )}

      {/* Images Grid */}
      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-64 p-8 bg-gray-50 rounded-lg">
          <ImageIcon className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Images Found</h3>
          <p className="text-gray-500 text-center">
            You haven&lsquo;t uploaded any images yet. Upload some images to see them here!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-square relative bg-gray-100">
                <Image
                  src={
                    hasError
                      ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzI4ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZD48L3RleHQ+PC9zdmc+'
                      : image.src
                  }
                  alt={`Face recognition image ${image.id}`}
                  width={160}
                  height={160}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  unoptimized
                  onError={() => {
                    console.error(`Failed to load image ${image.id}`)
                    setHasError(true)
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserImagesGallery;

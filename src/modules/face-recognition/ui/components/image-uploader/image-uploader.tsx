'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

interface UploadFormProps {
  userId: string;
}

const fetchAuthStatus = async () => {
  const res = await fetch('/api/auth/status', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch auth status');
  return res.json();
};

export function UploadForm({ userId }: UploadFormProps) {
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading: loadingRole } = useQuery({
    queryKey: ['authStatus'],
    queryFn: fetchAuthStatus,
  });

  useEffect(() => {
    if (uploadSuccess) {
      const timer = setTimeout(() => {
        setUploadSuccess(null);
      }, 2000); // 2 seconds

      return () => clearTimeout(timer); // Cleanup
    }
  }, [uploadSuccess]);


  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', userId);

      const res = await fetch('/api/face-recognition/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Upload failed');
      return result;
    },
    onSuccess: (data) => {
      setUploadSuccess(data.message || 'Choose another image with a clearer face');
      queryClient.invalidateQueries({ queryKey: ['userImages'] });
    },
    onError: () => {
      setUploadSuccess('Upload failed');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  if (loadingRole) return null;
  if (data?.user?.role !== 'student') return null;

  return (
    <div>
      <label
        htmlFor="file-upload"
        className="cursor-pointer inline-flex items-center justify-center px-4 py-2 text-black opacity-50 text-sm font-medium underline hover:opacity-100 transition-opacity duration-200"
      >
        Add pictures +
      </label>
      <input
        id="file-upload"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {uploadMutation.isPending && (
        <p className="mt-2 text-sm text-blue-500">Uploading...</p>
      )}
      {uploadSuccess && (
        <p className="mt-2 text-sm text-green-500">{uploadSuccess}</p>
      )}

    </div>
  );
}
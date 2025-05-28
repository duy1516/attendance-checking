'use client';

import { useState } from 'react';

interface UploadFormProps {
  userId: string;
}

export function UploadForm({ userId }: UploadFormProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId);

    try {
      setUploading(true);
      const response = await fetch('/api/face-recognition/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setUploadSuccess(data.message || 'Upload successful');
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadSuccess('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    // make the input prettier
    // disable the button for teachers
    <div className="flex flex-col items-center">
      <input type="file" onChange={handleFileChange} />
      {uploading && <p className="mt-2 text-sm text-blue-500">Uploading...</p>}
      {uploadSuccess && <p className="mt-2 text-sm text-green-500">{uploadSuccess}</p>}
    </div>
  );
}

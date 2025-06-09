"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, User } from "lucide-react";
import { UploadForm } from "@/modules/face-recognition/ui/components/image-uploader/image-uploader";
import UserImagesGallery from "@/modules/face-recognition/ui/components/image-gallery/image-gallery";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function PictureDropdown() {
  const [showPictures, setShowPictures] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch('/api/auth/status');
      const data = await res.json();

      if (data.isAuthenticated) {
        setUser(data.user);
      }

      setLoading(false);
    };

    fetchUser();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (user?.role !== 'student') return null;

  return (
    <div className="w-full">
      {/* Toggle Button */}
      <button
        onClick={() => setShowPictures(!showPictures)}
        className="flex items-center font-semibold text-lg px-6 py-4"
      >
        View pictures
        {showPictures ? (
          <ChevronUp className="ml-2 h-5 w-5" />
        ) : (
          <ChevronDown className="ml-2 h-5 w-5" />
        )}
      </button>

      {/* Picture Grid */}
      {showPictures && (
        <>
          <div className="px-2 mb-4">
            <UploadForm userId={user?.id || ''} />
          </div>
          <UserImagesGallery />
        </>
      )}
    </div>
  );
}

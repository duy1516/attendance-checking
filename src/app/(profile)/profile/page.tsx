'use client';

import { LogoutButton } from '@/modules/auth/ui/components/logout-button';
import { UserCircle2Icon } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function ProfilePage() {
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

  return (
    <div className='flex'>
      <div className="flex flex-col items-center justify-center p-4 mx-auto">
        {user && (
          <div className="flex flex-col items-center p-4">
            <div className="flex items-center justify-center mb-4">
              <Image src="/user-3296.svg" alt="Logo" width={100} height={100} />
            </div>
            <p className="font-bold text-3xl uppercase">{user.name}</p>
            <p className='mt-4 text-sm opacity-50'>{user.email}</p>
            <p className='text-sm opacity-50'>{user.role}</p>
          </div>

        )}
        <div className="mt-4">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}

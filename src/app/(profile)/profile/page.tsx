// app/profile/page.tsx
'use client';

import { LogoutButton } from '@/modules/auth/ui/components/logout-button';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const [authStatus, setAuthStatus] = useState({ loading: true, isAuthenticated: false, error: null });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/status');
        const data = await res.json();
        console.log('Auth status response:', data); // Debug log

        setAuthStatus({
          loading: false,
          isAuthenticated: data.isAuthenticated,
          error: null
        });
      } catch (error) {
        console.error('Error checking auth status:', error);
        setAuthStatus({
          loading: false,
          isAuthenticated: false,
          error: null,
        });
      }
    };

    checkAuth();
  }, []);

  if (authStatus.loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Profile Page</h1>
      {authStatus.isAuthenticated ? (
        <div>
          <p>You are logged in!</p>
          <p>Auth status debug: {JSON.stringify(authStatus)}</p>
        </div>
      ) : (
        <div>
          <p>Authentication issue: {authStatus.error || 'Not logged in'}</p>
          <p>Auth status debug: {JSON.stringify(authStatus)}</p>
        </div>
      )}
      <LogoutButton />
    </div>
  );
}
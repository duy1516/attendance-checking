"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const AuthButton = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check authentication status when component mounts
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        setIsAuthenticated(data.isAuthenticated);
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  //add logout function
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return <button className="px-4 py-2 bg-gray-200 rounded">Loading...</button>;
  }

  return isAuthenticated ? (
    <div className="flex gap-3">
      <Link href="/profile">
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Profile
        </button>
      </Link>
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        Logout
      </button>
    </div>
  ) : (
    <Link href="/sign-in">
      <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Login
      </button>
    </Link>
  );
};
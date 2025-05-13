"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { UserCircleIcon } from 'lucide-react';

export const AuthButton = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return <Button className="px-4 py-2 rounded-xl" variant="outline">Loading</Button>;
  }

  return isAuthenticated ? (
    <div className="flex gap-3">
      <Button
        onClick={() => { }}
        variant="outline"
        className="md:flex items-center gap-2 rounded-2xl">
        <Link href="/profile" className="flex items-center gap-4">
          <UserCircleIcon className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  ) : (
    <Link href="/login">
      <Button className="rounded-xl">
        Login
      </Button>
    </Link>
  );
};
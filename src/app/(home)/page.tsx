"use client";

import { useEffect, useState } from "react";

const Page = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchAuthStatus = async () => {
      try {
        const res = await fetch("/api/auth/status");
        const data = await res.json();
        setIsAuthenticated(data.isAuthenticated);
      } catch (error) {
        console.error("Error checking auth status:", error);
        setIsAuthenticated(false);
      }
    };

    fetchAuthStatus();
  }, []);

  if (isAuthenticated === null) {
    // Optional: show a loading state while checking auth
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-center">
          <h1 className="text-xl font-medium text-gray-500">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="text-center">
        <h1 className="text-2xl font-bold">
          {isAuthenticated
            ? "Click on a class to view it!"
            : "Please login to see your classes"}
        </h1>
      </div>
    </div>
  );
};

export default Page;

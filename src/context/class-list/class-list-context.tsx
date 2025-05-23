"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type ClassItem = {
  id: string;
  className: string;
  classLink: string | null;
};

interface ClassContextType {
  classes: ClassItem[];
  loading: boolean;
  refreshClasses: () => Promise<void>;
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

export const ClassProvider = ({ children }: { children: ReactNode }) => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/class/list");
      if (!res.ok) {
        // Unauthorized or other error - treat as logged out
        setClasses([]);
      } else {
        const data = await res.json();
        setClasses(data.classes || []);
      }
    } catch (error) {
      console.error("Failed to fetch classes:", error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchClasses();
  }, []);

  return (
    <ClassContext.Provider value={{ classes, loading, refreshClasses: fetchClasses }}>
      {children}
    </ClassContext.Provider>
  );
};

export const useClasses = () => {
  const context = useContext(ClassContext);
  if (context === undefined) {
    throw new Error("useClasses must be used within a ClassProvider");
  }
  return context;
};
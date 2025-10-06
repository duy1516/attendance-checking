"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

// Define user type
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

// Fetch auth status
const fetchAuthStatus = async (): Promise<{ user: User | null }> => {
  const res = await fetch("/api/auth/status");
  if (!res.ok) throw new Error("Failed to fetch auth status");
  const data = await res.json();
  return data.isAuthenticated ? { user: data.user } : { user: null };
};

export const LeaveClassButton = ({ classId }: { classId: string }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["authStatus"],
    queryFn: fetchAuthStatus,
    staleTime: 1000 * 60, // 1 minute
  });

  const user = data?.user;

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/class/${classId}/leave`, {
        method: "DELETE",
      });

      if (!res.ok) {
        let errorMsg = "Failed to leave class";
        try {
          const data = await res.json();
          errorMsg = data.error || errorMsg;
        } catch {
          // leave errorMsg as-is
        }
        throw new Error(errorMsg);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      router.push("/");
    },
    onError: (err: Error) => {
      alert(err.message);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const handleLeave = () => {
    if (confirm("Are you sure you want to leave this class?")) {
      setLoading(true);
      mutation.mutate();
    }
  };

  // Only render button if user is a student
  if (isLoading || isError || !user || user.role !== "student") return null;

  return (
    <div className="m-2">
      <Button
        variant="destructive"
        size="sm"
        onClick={handleLeave}
        disabled={loading}
        className="text-xs"
      >
        {loading ? "Leaving..." : "Leave Class"}
      </Button>
    </div>
  );
};

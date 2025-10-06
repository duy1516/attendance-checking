"use client";

import { Button } from "@/components/ui/button";
import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const fetchAuthStatus = async (): Promise<{ user: User | null }> => {
  const res = await fetch("/api/auth/status");
  if (!res.ok) throw new Error("Failed to fetch auth status");
  const data = await res.json();
  return data.isAuthenticated ? { user: data.user } : { user: null };
};

export const DeleteClassButton = ({ classId }: { classId: string }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["authStatus"],
    queryFn: fetchAuthStatus,
    staleTime: 1000 * 60, // 1 minute
  });

  const user = data?.user;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this class?")) return;

    const res = await fetch(`/api/class/${classId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      // Invalidate class list so sidebar updates
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      router.push("/");
    } else {
      alert("Failed to delete class");
    }
  };

  if (isLoading || isError || !user || user.role !== "teacher") return null;

  return (
    <div className="m-2">
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        className="text-xs"
      >
        <Trash2Icon className="h-4 w-4 mr-1" />
        Delete Class
      </Button>
    </div>
  );
};

"use client";

import { Button } from "@/components/ui/button";
import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export const DeleteClassButton = ({ classId }: { classId: string }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const fetchAuthStatus = async () => {
      try {
        const res = await fetch("/api/auth/status");
        const data = await res.json();
        if (data.isAuthenticated) {
          setUser(data.user);
        }
      } catch (err) {
        console.error("Failed to fetch auth status:", err);
      } finally {
        setAuthChecked(true);
      }
    };

    fetchAuthStatus();
  }, []);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this class?")) return;
    setLoading(true);
    const res = await fetch(`/api/class/${classId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      alert("Failed to delete class");
    }

    setLoading(false);
  };

  if (!authChecked) return null; // Optionally show a spinner

  // Only show button for teachers
  if (!user || user.role !== "teacher") return null;

  return (
    <div className="mx-4 my-2">
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={loading}
        className="text-xs"
      >
        <Trash2Icon className="h-4 w-4 mr-1" />
        {loading ? "Deleting..." : "Delete Class"}
      </Button>
    </div>
  );
};

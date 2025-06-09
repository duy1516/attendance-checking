"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { VideoOffIcon } from "lucide-react";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Types
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

interface CloseSessionButtonProps {
  sessionId: string;
  onClose: () => void;
}

// Fetch auth status
const fetchAuthStatus = async (): Promise<{ user: User | null }> => {
  const res = await fetch("/api/auth/status");
  if (!res.ok) throw new Error("Failed to fetch auth status");
  const data = await res.json();
  return data.isAuthenticated ? { user: data.user } : { user: null };
};

export const CloseSessionButton = ({ sessionId, onClose }: CloseSessionButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["authStatus"],
    queryFn: fetchAuthStatus,
    staleTime: 1000 * 60,
  });

  const user = data?.user;

  const handleCloseSession = async () => {
    setLoading(true);
    const res = await fetch(`/api/session/${sessionId}/close`, {
      method: "PATCH",
    });

    if (res.ok) {
      onClose();
      await queryClient.invalidateQueries({ queryKey: ["sessionStatus"] });
    } else {
      const errorData = await res.json();
      alert("Failed to close session: " + (errorData?.error || "Unknown error"));
    }

    setLoading(false);
  };

  // Hide button if user is not a teacher
  if (isLoading || isError || !user || user.role !== "teacher") return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <VideoOffIcon className="mb-2 cursor-pointer" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>End Attendance Session</DialogTitle>
        </DialogHeader>
        <p>Are you sure you want to close the current attendance session?</p>
        <DialogFooter>
          <Button onClick={handleCloseSession} disabled={loading}>
            {loading ? "Closing..." : "Close Session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

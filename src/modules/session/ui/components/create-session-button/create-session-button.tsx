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
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { VideoIcon } from "lucide-react";

// Define user type
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

interface CreateSessionButtonProps {
  classId: string;
  onSessionCreated: (sessionId: string) => void;
}

// Fetch auth status
const fetchAuthStatus = async (): Promise<{ user: User | null }> => {
  const res = await fetch("/api/auth/status");
  if (!res.ok) throw new Error("Failed to fetch auth status");
  const data = await res.json();
  return data.isAuthenticated ? { user: data.user } : { user: null };
};

export const CreateSessionButton = ({
  classId,
  onSessionCreated,
}: CreateSessionButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient(); // React Query cache manager

  const { data, isLoading, isError } = useQuery({
    queryKey: ["authStatus"],
    queryFn: fetchAuthStatus,
    staleTime: 1000 * 60,
  });

  const user = data?.user;

  const handleCreateSession = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/session/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          classId,
          sessionDate: new Date().toISOString(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setOpen(false);
        onSessionCreated(data.sessionId);

        // Invalidate sessionStatus query so AttendanceRecord refetches it
        await queryClient.invalidateQueries({
          queryKey: ["sessionStatus", classId],
        });
      } else {
        alert(data.error || "Failed to create session");
      }
    } catch (error) {
      console.error(error);
      alert("Error creating session");
    }
    setLoading(false);
  };

  // Hide button if not teacher
  if (isLoading || isError || !user || user.role !== "teacher") return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <VideoIcon className="mb-2 cursor-pointer" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start Attendance Session</DialogTitle>
        </DialogHeader>
        <p>Are you sure you want to create a new attendance session for this class?</p>
        <DialogFooter>
          <Button onClick={handleCreateSession} disabled={loading}>
            {loading ? "Creating..." : "Create Session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

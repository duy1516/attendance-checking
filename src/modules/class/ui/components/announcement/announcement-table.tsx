"use client"

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SquarePenIcon, CalendarIcon, UserIcon } from "lucide-react";

interface Announcement {
  id: string;
  classId: string;
  teacherId: string;
  title: string;
  message: string | null;
  createdAt: Date;
  teacherName?: string;
}

interface AnnouncementTableProps {
  classId: string;
  teacherId: string;
  teacherName?: string;
}

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export const AnnouncementTable = ({ classId, teacherId, teacherName }: AnnouncementTableProps) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    message: ""
  });

  // Fetch announcements on component mount
  useEffect(() => {
    fetchAnnouncements();
  }, [classId]);

  const fetchAuthStatus = async (): Promise<{ user: User | null }> => {
    const res = await fetch("/api/auth/status");
    if (!res.ok) throw new Error("Failed to fetch auth status");
    const data = await res.json();
    return data.isAuthenticated ? { user: data.user } : { user: null };
  };

  const { data } = useQuery({
    queryKey: ["authStatus"],
    queryFn: fetchAuthStatus,
    staleTime: 1000 * 60,
  });

  const user = data?.user;
  const isTeacher = user?.role === "teacher";


  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      // Replace with your actual API endpoint
      const response = await fetch(`/api/announcements?classId=${classId}`);
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createAnnouncement = async () => {
    if (!newAnnouncement.title.trim()) return;

    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId,
          teacherId,
          title: newAnnouncement.title,
          message: newAnnouncement.message || null,
        }),
      });

      if (response.ok) {
        const createdAnnouncement = await response.json();
        setAnnouncements(prev => [createdAnnouncement, ...prev]);
        setNewAnnouncement({ title: "", message: "" });
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
    }
  };

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex-1">
      <div className="m-4">
        <div className="min-h-[250px] bg-white border border-[#D9D9D9] rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <h1 className="font-bold text-2xl">Announcements</h1>
            {isTeacher && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <SquarePenIcon className="mb-2 cursor-pointer hover:text-blue-600 transition-colors" />
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create New Announcement</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <label htmlFor="title" className="text-sm font-medium">
                        Title *
                      </label>
                      <Input
                        id="title"
                        value={newAnnouncement.title}
                        onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter announcement title"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium">
                        Message
                      </label>
                      <Textarea
                        id="message"
                        value={newAnnouncement.message}
                        onChange={(e) => setNewAnnouncement(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Enter announcement message (optional)"
                        rows={4}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createAnnouncement} disabled={!newAnnouncement.title.trim()}>
                      Create Announcement
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <Separator />

          <div className="mt-4 max-h-[150px] overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-500">Loading announcements...</span>
              </div>
            ) : announcements.length === 0 ? (
              <p className="text-sm mt-1 text-gray-500">No announcements yet</p>
            ) : (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {announcement.title}
                        </h3>
                        {announcement.message && (
                          <p className="text-gray-700 mt-1 whitespace-pre-wrap">
                            {announcement.message}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <UserIcon className="w-4 h-4" />
                            <span>{announcement.teacherName || teacherName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{formatDate(announcement.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
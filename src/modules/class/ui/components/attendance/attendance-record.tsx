"use client";

import { Separator } from "@/components/ui/separator";
import FaceScanner from "@/modules/face-recognition/ui/components/face-camera/face-camera";
import { CreateSessionButton } from "@/modules/session/ui/components/create-session-button/create-session-button";
import { CloseSessionButton } from "@/modules/session/ui/components/close-session-button/close-session-button";
import { useQuery } from "@tanstack/react-query";

export const AttendanceRecord = ({ classId }: { classId: string }) => {

  // Fetch current session status
  const {
    data: sessionStatus,
    isLoading: statusLoading,
    refetch: refetchSessionStatus,
  } = useQuery({
    queryKey: ["sessionStatus", classId],
    queryFn: async () => {
      const res = await fetch(`/api/session/status/${classId}`);
      if (!res.ok) throw new Error("Failed to fetch session status");
      return res.json();
    },
    enabled: !!classId,
  });

  // Fetch sessions list
  const {
    data: sessionsData,
    isLoading: sessionsLoading,
    refetch: refetchSessions,
  } = useQuery({
    queryKey: ["sessions", classId],
    queryFn: async () => {
      const res = await fetch(`/api/session/get/${classId}`);
      if (!res.ok) throw new Error("Failed to fetch sessions");
      return res.json();
    },
    enabled: !!classId,
  });

  const activeSessionId = sessionStatus?.sessionOpen ? sessionStatus?.session?.id : null;

  const handleSessionCreated = async (sessionId: string) => {
    await refetchSessionStatus();
    await refetchSessions();
  };

  const handleSessionClosed = async () => {
    await refetchSessionStatus();
    await refetchSessions();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="m-4">
      <div className="w-auto min-h-[250px] bg-white border border-[#D9D9D9] rounded-lg shadow-md p-4 md:w-[350px]">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-2xl">Sessions</h1>
          <div className="flex items-center gap-2">
            <FaceScanner classId={classId} />
            {activeSessionId ? (
              <CloseSessionButton
                sessionId={activeSessionId}
                onClose={handleSessionClosed}
              />
            ) : (
              <CreateSessionButton
                classId={classId}
                onSessionCreated={handleSessionCreated}
              />
            )}
          </div>
        </div>
        <Separator />

        {/* Sessions List */}
        <div className="mt-4">
          {sessionsLoading ? (
            <p className="text-sm text-gray-500">Loading sessions...</p>
          ) : sessionsData?.sessions?.length > 0 ? (
            <div className="space-y-2 max-h-[150px] overflow-y-auto">
              {sessionsData.sessions.map((session: any) => (
                <div
                  key={session.id}
                  className={`p-2 border-0 rounded-md text-sm ${session.id === activeSessionId
                    ? "bg-green-50"
                    : "bg-gray-50"
                    }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {formatDate(session.sessionDate)}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs uppercase ${session.status === "open"
                        ? "text-[#00ff00]"
                        : "text-gray-800"
                        }`}
                    >
                      {session.status || "completed"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No sessions found</p>
          )}
        </div>
      </div>
    </div>
  );
};

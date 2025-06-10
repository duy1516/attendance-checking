"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type Student = {
  id: string;
  name: string;
  email: string;
};

type AttendanceSession = {
  id: string;
  sessionDate: string;
};

type AttendanceRecord = {
  sessionId: string;
  studentId: string;
  status: string;
  scannedAt: string;
};

type StudentListProps = {
  classId: string;
};

export const StudentList = ({ classId }: StudentListProps) => {
  const queryClient = useQueryClient();

  const [userRole, setUserRole] = useState<"teacher" | "student" | null>(null);

  // Fetch user role
  useQuery({
    queryKey: ["authStatus"],
    queryFn: async () => {
      const res = await fetch("/api/auth/status");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch auth status");
      setUserRole(data.user.role);
      return data;
    },
  });

  // Fetch enrolled students
  const {
    data: studentsData,
    isLoading: studentsLoading,
    error: studentsError,
  } = useQuery({
    queryKey: ["students", classId],
    queryFn: async () => {
      const res = await fetch(`/api/class/${classId}/students`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch students");
      return data.students as Student[];
    },
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

  // Fetch attendance records
  const {
    data: attendanceData,
    isLoading: attendanceLoading,
    error: attendanceError,
  } = useQuery({
    queryKey: ["attendance", classId],
    queryFn: async () => {
      const res = await fetch(`/api/attendance/class/${classId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch attendance");
      return data.records as AttendanceRecord[];
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const res = await fetch(`/api/class/${classId}/students/${studentId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete student");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students", classId] });
    },
  });

  const handleDelete = (studentId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to remove this student?");
    if (confirmDelete) deleteMutation.mutate(studentId);
  };

  // Helper function to get attendance record for a specific student and session
  const getAttendanceRecord = (studentId: string, sessionId: string) => {
    return attendanceData?.find(
      (record) => record.studentId === studentId && record.sessionId === sessionId
    );
  };

  if (studentsLoading || attendanceLoading || sessionsLoading)
    return <p className="text-gray-600">Loading...</p>;

  if (studentsError || attendanceError)
    return (
      <p className="text-red-500">
        Error: {(studentsError as Error)?.message || (attendanceError as Error)?.message}
      </p>
    );

  if (!studentsData || studentsData.length === 0)
    return <p className="text-gray-600">No students enrolled yet.</p>;

  const sessions = sessionsData?.sessions || [];

  return (
    <div className="bg-white border border-[#D9D9D9] rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-3">Enrolled Students</h2>
      {sessions.length === 0 && (
        <p className="text-sm text-gray-500 mt-4 text-center italic">
          No attendance sessions found for this class.
        </p>
      )}
      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="sticky left-0 z-10 bg-white text-left py-3 px-4 font-semibold text-gray-700 min-w-[200px] border-r border-gray-200">
                  Student Info
                </th>
                {sessionsData.sessions.map((session: any) => (
                  <th key={session.id} className="text-center py-3 px-4 font-semibold text-gray-700 min-w-[120px]">
                    {new Date(session.sessionDate).toLocaleDateString('en-GB')}
                  </th>
                ))}
                {userRole === "teacher" && (
                  <th className="sticky right-0 z-10 bg-white text-center py-3 px-4 font-semibold text-gray-700 min-w-[100px] border-l border-gray-200">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {studentsData.map((student) => (
                <tr key={student.id} className="border-b border-gray-100">
                  <td className="sticky left-0 z-10 bg-white py-3 px-4 border-r border-gray-200">
                    <div>
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-500">{student.email}</p>
                    </div>
                  </td>
                  {sessionsData.sessions.map((session: any) => {
                    const record = getAttendanceRecord(student.id, session.id);
                    return (
                      <td key={session.id} className="py-3 px-4 text-center">
                        {record ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs text-gray-600">
                              {new Date(record.scannedAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {record.status === "present" && (
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                {record.status}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Absent</span>
                        )}
                      </td>
                    );
                  })}
                  {userRole === "teacher" && (
                    <td className="sticky right-0 z-10 bg-white py-3 px-4 text-center border-l border-gray-200">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(student.id)}
                        disabled={deleteMutation.isPending}
                      >
                        Remove
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
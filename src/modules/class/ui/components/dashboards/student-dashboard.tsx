"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AttendanceStats } from "../student-list/attendance-stats";
import {
  CheckCircle2,
  XCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Student = {
  id: string;
  name: string;
  email: string;
};

type AttendanceRecord = {
  sessionId: string;
  studentId: string;
  status: string;
  scannedAt: string;
};

type Session = {
  id: string;
  sessionDate: string;
  status: string;
};

type StudentDashboardProps = {
  classId: string;
  currentUserId: string;
};

export const StudentDashboard = ({
  classId,
  currentUserId,
}: StudentDashboardProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch student info
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
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
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

  if (studentsLoading || attendanceLoading || sessionsLoading)
    return <p className="text-gray-600">Loading...</p>;

  if (studentsError || attendanceError)
    return (
      <p className="text-red-500">
        Error:{" "}
        {(studentsError as Error)?.message ||
          (attendanceError as Error)?.message}
      </p>
    );

  const currentStudent = studentsData?.find(
    (student) => student.id === currentUserId
  );
  if (!currentStudent)
    return <p className="text-gray-600">Student data not found.</p>;

  const sessions = (sessionsData?.sessions || []) as Session[];
  const myAttendanceRecords =
    attendanceData?.filter((record) => record.studentId === currentUserId) ||
    [];

  const getAttendanceRecord = (sessionId: string) => {
    return myAttendanceRecords.find((record) => record.sessionId === sessionId);
  };

  // Pagination logic
  const sortedSessions = sessions.sort(
    (a, b) =>
      new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
  );
  const totalPages = Math.ceil(sortedSessions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSessions = sortedSessions.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="space-y-6">
      {/* Stats Card */}
      <div className="bg-white border border-[#D9D9D9] rounded-lg shadow-md p-6">
        <h3 className="font-bold text-xl mb-4">Attendance Overview</h3>
        <AttendanceStats
          studentId={currentUserId}
          attendanceData={attendanceData}
          totalSessions={sessions.length}
        />
      </div>

      {/* Attendance History */}
      <div className="bg-white border border-[#D9D9D9] rounded-lg shadow-md p-6">
        <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Attendance History
        </h3>

        {sessions.length === 0 ? (
          <p className="text-sm text-gray-500 text-center italic py-8">
            No attendance sessions found for this class.
          </p>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedSessions.map((session) => {
                const record = getAttendanceRecord(session.id);
                const isPresent = record?.status === "present";

                return (
                  <div
                    key={session.id}
                    className={`border-l-4 ${
                      isPresent
                        ? "border-green-500 bg-green-50"
                        : "border-red-500 bg-red-50"
                    } rounded-r-lg p-4 transition-all hover:shadow-md`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isPresent ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-600" />
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">
                            {new Date(session.sessionDate).toLocaleDateString(
                              "en-GB",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </p>
                          {record && (
                            <p className="text-sm text-gray-600">
                              Checked in at{" "}
                              {new Date(record.scannedAt).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            isPresent
                              ? "bg-green-200 text-green-800"
                              : "bg-red-200 text-red-800"
                          }`}
                        >
                          {isPresent ? "Present" : "Absent"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({sessions.length} total sessions)
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Recent Activity Card */}
      <div className="bg-white border border-[#D9D9D9] rounded-lg shadow-md p-6">
        <h3 className="font-bold text-xl mb-4">Present Activity</h3>
        {myAttendanceRecords.length === 0 ? (
          <p className="text-sm text-gray-500 text-center italic py-4">
            No attendance records yet.
          </p>
        ) : (
          <div className="space-y-2">
            {myAttendanceRecords
              .sort(
                (a, b) =>
                  new Date(b.scannedAt).getTime() -
                  new Date(a.scannedAt).getTime()
              )
              .slice(0, 5)
              .map((record) => {
                const session = sessions.find((s) => s.id === record.sessionId);
                return (
                  <div
                    key={record.sessionId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">
                        Attended on{" "}
                        {session &&
                          new Date(session.sessionDate).toLocaleDateString(
                            "en-GB"
                          )}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(record.scannedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

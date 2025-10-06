"use client";

import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

type AttendanceRecord = {
  sessionId: string;
  studentId: string;
  status: string;
  scannedAt: string;
};

type Student = {
  id: string;
  name: string;
  email: string;
};

type Session = {
  id: string;
  sessionDate: string;
};

type AttendanceTableProps = {
  students: Student[];
  sessions: Session[];
  attendanceData: AttendanceRecord[] | undefined;
  userRole: "teacher" | "student" | null;
  onDelete?: (studentId: string) => void;
  isDeleting?: boolean;
};

export const AttendanceTable = ({
  students,
  sessions,
  attendanceData,
  userRole,
  onDelete,
  isDeleting,
}: AttendanceTableProps) => {
  const getAttendanceRecord = (studentId: string, sessionId: string) => {
    return attendanceData?.find(
      (record) =>
        record.studentId === studentId && record.sessionId === sessionId
    );
  };

  const calculateAttendancePercentage = (studentId: string) => {
    if (sessions.length === 0) return 0;
    const presentCount = sessions.filter((session) => {
      const record = getAttendanceRecord(studentId, session.id);
      return record && record.status === "present";
    }).length;
    return Math.round((presentCount / sessions.length) * 100);
  };

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="sticky left-0 z-10 bg-white text-left py-3 px-4 font-semibold text-black min-w-[240px] border-r border-gray-200">
                Student Info
              </th>
              {sessions.map((session) => (
                <th
                  key={session.id}
                  className="text-center py-3 px-6 font-semibold text-black min-w-[140px]"
                >
                  {new Date(session.sessionDate).toLocaleDateString("en-GB")}
                </th>
              ))}
              {userRole === "teacher" && (
                <th className="sticky right-0 z-10 bg-white text-center py-3 px-4 font-semibold text-black min-w-[100px] border-l border-gray-200">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td
                  colSpan={sessions.length + (userRole === "teacher" ? 2 : 1)}
                  className="py-8 text-center text-gray-500"
                >
                  No students match the selected filters.
                </td>
              </tr>
            ) : (
              students.map((student) => {
                const percentage = calculateAttendancePercentage(student.id);
                return (
                  <tr key={student.id} className="border-b border-gray-100">
                    <td className="sticky left-0 z-10 bg-white py-3 px-4 border-r border-gray-200">
                      <div className="space-y-2">
                        <div>
                          <p className="font-medium text-gray-900">
                            {student.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {student.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-medium text-gray-600">
                            Attendance:
                          </p>
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  percentage >= 75
                                    ? "bg-green-500"
                                    : percentage >= 50
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-xs font-medium text-gray-600 min-w-[40px]">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    </td>
                    {sessions.map((session) => {
                      const record = getAttendanceRecord(
                        student.id,
                        session.id
                      );
                      return (
                        <td key={session.id} className="py-3 px-6 text-center">
                          {record ? (
                            <div className="flex flex-col items-center gap-1">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                                <Check className="w-5 h-5 text-green-600" />
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(record.scannedAt).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 mx-auto">
                              <X className="w-5 h-5 text-red-600" />
                            </div>
                          )}
                        </td>
                      );
                    })}
                    {userRole === "teacher" && onDelete && (
                      <td className="sticky right-0 z-10 bg-white py-3 px-4 text-center border-l border-gray-200">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onDelete(student.id)}
                          disabled={isDeleting}
                        >
                          Remove
                        </Button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type Student = {
  id: string;
  name: string;
  email: string;
};

type AttendanceRecord = {
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

  if (studentsLoading || attendanceLoading) return <p className="text-gray-600">Loading...</p>;
  if (studentsError || attendanceError)
    return (
      <p className="text-red-500">
        Error: {(studentsError as Error)?.message || (attendanceError as Error)?.message}
      </p>
    );
  if (!studentsData || studentsData.length === 0)
    return <p className="text-gray-600">No students enrolled yet.</p>;

  return (
    <div className="bg-white border border-[#D9D9D9] rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-3">Enrolled Students</h2>
      <ul className="divide-y">
        {studentsData.map((student) => {
          const records = attendanceData?.filter((rec) => rec.studentId === student.id) || [];
          return (
            <li key={student.id} className="py-2 flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-gray-500">{student.email}</p>
                </div>
                {userRole === "teacher" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(student.id)}
                    disabled={deleteMutation.isPending}
                  >
                    Remove
                  </Button>
                )}
              </div>

              {/* Attendance Records */}
              <div className="mt-1 ml-2 text-sm text-gray-700 space-y-1">
                {records.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No attendance recorded</p>
                ) : (
                  records.map((rec, i) => (
                    <p key={i} className="flex justify-between">
                      <span>
                        {new Date(rec.scannedAt).toLocaleDateString()} –{" "}
                        {new Date(rec.scannedAt).toLocaleTimeString()}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${rec.status === "present"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                          }`}
                      >
                        {rec.status}
                      </span>
                    </p>
                  ))
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

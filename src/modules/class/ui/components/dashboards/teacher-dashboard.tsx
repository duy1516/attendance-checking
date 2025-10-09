"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AttendanceTable } from "../student-list/attendance-table";
import { Filters } from "../student-list/filters";
import { AttendanceConfirmModal } from "../student-list/attendance-confirm-modal";

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
};

type TeacherDashboardProps = {
  classId: string;
};

export const TeacherDashboard = ({ classId }: TeacherDashboardProps) => {
  const queryClient = useQueryClient();
  const [selectedSessionId, setSelectedSessionId] = useState<string | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "present" | "absent">("all");
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    studentId: string;
    sessionId: string;
    newStatus: "present" | "absent";
    studentName: string;
    sessionDate: string;
  }>({
    isOpen: false,
    studentId: "",
    sessionId: "",
    newStatus: "present",
    studentName: "",
    sessionDate: "",
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

  // Toggle attendance mutation
  const toggleAttendanceMutation = useMutation({
    mutationFn: async ({
      studentId,
      sessionId,
      newStatus
    }: {
      studentId: string;
      sessionId: string;
      newStatus: "present" | "absent"
    }) => {
      const res = await fetch("/api/attendance/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, sessionId, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update attendance");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance", classId] });
    },
  });

  const handleToggleAttendance = (
    studentId: string,
    sessionId: string,
    newStatus: "present" | "absent"
  ) => {
    const student = studentsData?.find(s => s.id === studentId);
    const session = sessions.find((s: Session) => s.id === sessionId);
    const sessionDate = session ? new Date(session.sessionDate).toLocaleDateString("en-GB") : "";

    setConfirmModal({
      isOpen: true,
      studentId,
      sessionId,
      newStatus,
      studentName: student?.name || "this student",
      sessionDate,
    });
  };

  const handleConfirmAttendance = () => {
    toggleAttendanceMutation.mutate({
      studentId: confirmModal.studentId,
      sessionId: confirmModal.sessionId,
      newStatus: confirmModal.newStatus,
    });
    setConfirmModal({ ...confirmModal, isOpen: false });
  };

  const handleCloseModal = () => {
    setConfirmModal({ ...confirmModal, isOpen: false });
  };

  // Helper function to get attendance record for a specific student and session
  const getAttendanceRecord = (studentId: string, sessionId: string) => {
    return attendanceData?.find(
      (record) => record.studentId === studentId && record.sessionId === sessionId
    );
  };

  // Filter students based on selected session and status
  const filterStudents = (students: Student[]) => {
    if (selectedSessionId === "all" && statusFilter === "all") {
      return students;
    }

    return students.filter((student) => {
      // If filtering by specific session
      if (selectedSessionId !== "all") {
        const record = getAttendanceRecord(student.id, selectedSessionId);
        const studentStatus = record?.status === "present" ? "present" : "absent";

        // If also filtering by status
        if (statusFilter !== "all") {
          return studentStatus === statusFilter;
        }
        return true;
      }

      // If only filtering by status across all sessions
      if (statusFilter !== "all") {
        const hasMatchingStatus = sessions.some((session: Session) => {
          const record = getAttendanceRecord(student.id, session.id);
          const studentStatus = record?.status === "present" ? "present" : "absent";
          return studentStatus === statusFilter;
        });
        return hasMatchingStatus;
      }

      return true;
    });
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
  const filteredStudents = filterStudents(studentsData);

  return (
    <div className="bg-white border border-[#D9D9D9] rounded-lg shadow-md p-4">
      <h2 className="font-bold text-xl mx-1">Enrolled Students</h2>

      {/* Filter Controls */}
      {sessions.length > 0 && (
        <Filters
          sessions={sessions}
          selectedSessionId={selectedSessionId}
          statusFilter={statusFilter}
          onSessionChange={setSelectedSessionId}
          onStatusChange={setStatusFilter}
          onClearFilters={() => {
            setSelectedSessionId("all");
            setStatusFilter("all");
          }}
          filteredCount={filteredStudents.length}
          totalCount={studentsData.length}
        />
      )}

      {sessions.length === 0 && (
        <p className="text-sm text-gray-500 mt-4 text-center italic">
          No attendance sessions found for this class.
        </p>
      )}

      <AttendanceTable
        students={filteredStudents}
        sessions={sessions}
        attendanceData={attendanceData}
        userRole="teacher"
        onDelete={handleDelete}
        isDeleting={deleteMutation.isPending}
        onToggleAttendance={handleToggleAttendance}
        isTogglingAttendance={toggleAttendanceMutation.isPending}
      />

      <AttendanceConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmAttendance}
        studentName={confirmModal.studentName}
        sessionDate={confirmModal.sessionDate}
        newStatus={confirmModal.newStatus}
        isLoading={toggleAttendanceMutation.isPending}
      />
    </div>
  );
};

"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { TeacherDashboard } from "../dashboards/teacher-dashboard";
import { StudentDashboard } from "../dashboards/student-dashboard";

type StudentListProps = {
  classId: string;
};

export const StudentList = ({ classId }: StudentListProps) => {
  const [userRole, setUserRole] = useState<"teacher" | "student" | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Fetch user role and ID
  const { isLoading: authLoading } = useQuery({
    queryKey: ["authStatus"],
    queryFn: async () => {
      const res = await fetch("/api/auth/status");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch auth status");
      setUserRole(data.user.role);
      setCurrentUserId(data.user.id);
      return data;
    },
  });

  if (authLoading) return <p className="text-gray-600">Loading...</p>;

  if (userRole === "teacher") {
    return <TeacherDashboard classId={classId} />;
  }

  if (userRole === "student" && currentUserId) {
    return <StudentDashboard classId={classId} currentUserId={currentUserId} />;
  }

  return <p className="text-gray-600">Unable to load dashboard.</p>;
};
"use client";

import { useQuery } from "@tanstack/react-query";
import { TeacherDashboard } from "../dashboards/teacher-dashboard";
import { StudentDashboard } from "../dashboards/student-dashboard";

type StudentListProps = {
  classId: string;
};

export const StudentList = ({ classId }: StudentListProps) => {
  // Fetch user role and ID
  const { data: authData, isLoading: authLoading } = useQuery({
    queryKey: ["authStatus"],
    queryFn: async () => {
      const res = await fetch("/api/auth/status");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch auth status");
      return data;
    },
  });

  if (authLoading) return <p className="text-gray-600">Loading...</p>;

  const userRole = authData?.user?.role;
  const currentUserId = authData?.user?.id;

  if (userRole === "teacher") {
    return <TeacherDashboard classId={classId} />;
  }

  if (userRole === "student" && currentUserId) {
    return <StudentDashboard classId={classId} currentUserId={currentUserId} />;
  }

  return <p className="text-gray-600">Unable to load dashboard.</p>;
};

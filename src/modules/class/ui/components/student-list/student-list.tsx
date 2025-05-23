"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Student = {
  id: string;
  name: string;
  email: string;
};

type StudentListProps = {
  classId: string;
};

export const StudentList = ({ classId }: StudentListProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState<"teacher" | "student" | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get role
        const statusRes = await fetch("/api/auth/status");
        const statusData = await statusRes.json();
        if (statusData.isAuthenticated) {
          setUserRole(statusData.user.role);
        }

        // Get students
        const studentRes = await fetch(`/api/class/${classId}/students`);
        const studentData = await studentRes.json();
        if (!studentRes.ok) throw new Error(studentData.error || "Failed to fetch students");

        setStudents(studentData.students);
      } catch (err: any) {
        setError(err.message || "An error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classId]);

  const handleDelete = async (studentId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to remove this student?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/class/${classId}/students/${studentId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete student");

      setStudents((prev) => prev.filter((s) => s.id !== studentId));
    } catch (err: any) {
      alert(err.message || "Failed to delete student");
    }
  };

  if (loading) return <p className="text-gray-600">Loading students...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (students.length === 0) return <p className="text-gray-600">No students enrolled yet.</p>;

  return (
    <div className="bg-white border border-[#D9D9D9] rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-3">Enrolled Students</h2>
      <ul className="divide-y">
        {students.map((student) => (
          <li key={student.id} className="py-2 flex justify-between items-center">
            <div>
              <p className="font-medium">{student.name}</p>
              <p className="text-sm text-gray-500">{student.email}</p>
            </div>
            {userRole === "teacher" && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(student.id)}
              >
                Remove
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

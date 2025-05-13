"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(`/api/class/${classId}/students`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch students.");
        }

        setStudents(data.students);
      } catch (err: any) {
        setError(err.message || "An error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [classId]);

  if (loading) {
    return <p className="text-gray-600">Loading students...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  if (students.length === 0) {
    return <p className="text-gray-600">No students enrolled yet.</p>;
  }

  return (
    <div className="bg-white border border-[#D9D9D9] rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-3">Enrolled Students</h2>
      <ul className="divide-y">
        {students.map((student) => (
          <li key={student.id} className="py-2">
            <p className="font-medium">{student.name}</p>
            <p className="text-sm text-gray-500">{student.email}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

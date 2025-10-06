"use client";

type AttendanceRecord = {
  sessionId: string;
  studentId: string;
  status: string;
  scannedAt: string;
};

type AttendanceStatsProps = {
  studentId: string;
  attendanceData: AttendanceRecord[] | undefined;
  totalSessions: number;
};

export const AttendanceStats = ({
  studentId,
  attendanceData,
  totalSessions,
}: AttendanceStatsProps) => {
  const studentRecords =
    attendanceData?.filter(
      (record) => record.studentId === studentId && record.status === "present"
    ) || [];

  const presentCount = studentRecords.length;
  const absentCount = totalSessions - presentCount;
  const attendanceRate =
    totalSessions > 0 ? (presentCount / totalSessions) * 100 : 0;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600 mb-1">Total</p>
        <p className="text-3xl font-bold text-gray-700">{totalSessions}</p>
        <p className="text-xs text-gray-500 mt-1">sessions</p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-gray-600 mb-1">Present</p>
        <p className="text-3xl font-bold text-green-700">{presentCount}</p>
        <p className="text-xs text-gray-500 mt-1">sessions</p>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-gray-600 mb-1">Absent</p>
        <p className="text-3xl font-bold text-red-700">{absentCount}</p>
        <p className="text-xs text-gray-500 mt-1">sessions</p>
      </div>

      <div className="col-span-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-gray-600 mb-1">Attendance Rate</p>
        <p className="text-3xl font-bold text-blue-700">
          {attendanceRate.toFixed(1)}%
        </p>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${attendanceRate}%` }}
          />
        </div>
      </div>
    </div>
  );
};

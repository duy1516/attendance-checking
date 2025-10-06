"use client";

import { Button } from "@/components/ui/button";

type Session = {
  id: string;
  sessionDate: string;
};

type FiltersProps = {
  sessions: Session[];
  selectedSessionId: string;
  statusFilter: "all" | "present" | "absent";
  onSessionChange: (sessionId: string) => void;
  onStatusChange: (status: "all" | "present" | "absent") => void;
  onClearFilters: () => void;
  filteredCount: number;
  totalCount: number;
};

export const Filters = ({
  sessions,
  selectedSessionId,
  statusFilter,
  onSessionChange,
  onStatusChange,
  onClearFilters,
  filteredCount,
  totalCount,
}: FiltersProps) => {
  return (
    <div className="mt-4 mb-6 flex flex-wrap gap-4 items-center bg-gray-50 p-4 rounded-lg">
      <div className="flex flex-col gap-2">
        <label htmlFor="session-filter" className="text-sm font-medium text-gray-700">
          Filter by Day:
        </label>
        <select
          id="session-filter"
          value={selectedSessionId}
          onChange={(e) => onSessionChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Sessions</option>
          {sessions.map((session) => (
            <option key={session.id} value={session.id}>
              {new Date(session.sessionDate).toLocaleDateString('en-GB')}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
          Filter by Status:
        </label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value as "all" | "present" | "absent")}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
        </select>
      </div>

      {(selectedSessionId !== "all" || statusFilter !== "all") && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="mt-6"
        >
          Clear Filters
        </Button>
      )}

      <div className="ml-auto text-sm text-gray-600 mt-6">
        Showing {filteredCount} of {totalCount} students
      </div>
    </div>
  );
};

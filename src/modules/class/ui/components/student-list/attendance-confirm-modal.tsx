"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type AttendanceConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  studentName: string;
  sessionDate: string;
  newStatus: "present" | "absent";
  isLoading?: boolean;
};

export const AttendanceConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  studentName,
  sessionDate,
  newStatus,
  isLoading,
}: AttendanceConfirmModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Attendance Change</DialogTitle>
          <DialogDescription>
            Are you sure you want to mark <strong>{studentName}</strong> as{" "}
            <strong>{newStatus}</strong> for the session on{" "}
            <strong>{sessionDate}</strong>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

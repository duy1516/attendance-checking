"use client"

import { Separator } from "@/components/ui/separator"
import { SquarePenIcon } from "lucide-react";

export const AnnouncementTable = () => {
  return (
    <div className="flex-1 ">
      <div className="m-4">
        <div className="min-h-[250px] bg-white border border-[#D9D9D9] rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <h1 className="font-bold text-2xl">Announcements</h1>
            <SquarePenIcon
              onClick={() => alert("viet")}
              className="mb-2 cursor-pointer" />
          </div>
          <Separator />
          {/* Modify to add real data later */}
          <p className="text-sm mt-1 text-gray-500">No announcements yet</p>
        </div>
      </div>
    </div>
  );
};

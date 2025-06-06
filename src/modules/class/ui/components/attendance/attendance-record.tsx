"use client"

import { Separator } from "@/components/ui/separator"
import { VideoIcon } from "lucide-react";

export const AttendanceRecord = () => {
  return (
    <div className="m-4">
      <div className="w-auto h-[250px] bg-white border border-[#D9D9D9] rounded-lg shadow-md p-4 md:w-[350px]">
        {/* w-auto h-[250px] bg-white border border-[#D9D9D9] rounded-lg shadow-md p-4 md:w-[350px] */}
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-2xl">Sessions</h1>
          {/* remove for teacher */}
          <VideoIcon
            onClick={() => navigator.mediaDevices.getUserMedia({ video: true, audio: false })}
            className="mb-2 cursor-pointer" />
        </div>
        <Separator />
        {/* Modify to add real data later */}
        <p className="text-sm mt-1 text-gray-500">No sessions yet</p>
      </div>
    </div>
  );
}
import { Separator } from "@/components/ui/separator"
import { VideoIcon } from "lucide-react";

export const AttendanceRecord = () => {
  return (
    <div className="m-4">
      <div className="w-[825px] min-h-[250px] bg-white border border-[#D9D9D9] rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-2xl">Sessions</h1>
          <VideoIcon />
        </div>
        <Separator className="w-full" />
        {/* Modify to add real data later */}
        <p className="text-sm mt-1 text-gray-500">No sessions yet</p>
      </div>
    </div>
  );
}
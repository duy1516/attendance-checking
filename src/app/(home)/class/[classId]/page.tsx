import { db } from "@/db";
import { classes, users } from "@/db/schema";
import { DeleteClassButton } from "@/modules/class/ui/components/delete-class/delete-class-button";
import { AnnouncementTable } from "@/modules/class/ui/components/announcement/announcement-table";
import { AttendanceRecord } from "@/modules/class/ui/components/attendance/attendance-record";
import { StudentList } from "@/modules/class/ui/components/student-list/student-list";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { LeaveClassButton } from "@/modules/class/ui/components/leave-class/leave-class-button";

interface PageProps {
  params: Promise<{
    classId: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  const { classId } = await params;

  const result = await db
    .select()
    .from(classes)
    .where(eq(classes.id, classId));

  const classItem = result[0];
  const teacher = await db
    .select()
    .from(users)
    .where(eq(users.id, classItem.teacherId))
    .then((res) => res[0]);

  if (!classItem) return notFound();

  return (
    <>
      <div className="p-4 flex justify-between">
        <div className="flex flex-col px-4">
          <h1 className="text-3xl truncate font-bold max-w-[250px] md:max-w-[500px]">{classItem.className}</h1>
          <p className="text-sm mt-1 text-gray-500">{classItem.description}</p>
          <p className="text-sm mt-1 text-gray-500">Owner: {teacher?.name}</p>
        </div >
        <div className="">
          <p className="mx-4 text-sm text-gray-500">Class Code: {classItem.classLink}</p>
          <div className="flex justify-end">
            <DeleteClassButton classId={classId} />
            <LeaveClassButton classId={classId} />
          </div>
        </div>
      </div >
      <div className="flex flex-col p-4">
        <div className="flex">
          <AttendanceRecord classId={classId} />
          <AnnouncementTable />
        </div>
        <div className="m-4">
          <StudentList classId={classId} />
        </div>
      </div>
    </>
  );
};

export default Page;

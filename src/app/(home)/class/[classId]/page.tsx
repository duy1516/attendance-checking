import { db } from "@/db";
import { classes } from "@/db/schema";
import { DeleteClassButton } from "@/modules/class/ui/components/delete-class/delete-class-button";
import { AnnouncementTable } from "@/modules/class/ui/components/announcement/announcement-table";
import { AttendanceRecord } from "@/modules/class/ui/components/attendance/attendance-record";
import { StudentList } from "@/modules/class/ui/components/student-list/student-list";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

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

  if (!classItem) return notFound();

  return (
    <>
      <div className="p-4 flex justify-between">
        <div>
          <h1 className="text-3xl font-bold">{classItem.className}</h1>
          <p className="text-sm mt-1 text-gray-500">{classItem.description}</p>
        </div>
        <div>
          <p className="mx-4 text-sm text-gray-500">Class Code: {classItem.classLink}</p>
          <DeleteClassButton classId={classId} />
        </div>
      </div>
      <div className="flex flex-col p-4">
        <div className="flex">
          <AttendanceRecord />
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

import { db } from "@/db";
import { classes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

type Props = {
  params: {
    classId: string;
  };
};

export default async function ClassPage(props: Props) {
  const { params } = await Promise.resolve(props);
  const classId = params.classId;

  // Fetch the class from DB
  const result = await db
    .select()
    .from(classes)
    .where(eq(classes.id, classId));

  const classItem = result[0];

  if (!classItem) return notFound();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{classItem.className}</h1>
      <p className="mt-2 text-gray-600">{classItem.description}</p>
      <p className="mt-4 text-sm text-gray-500">Class Link: {classItem.classLink}</p>
    </div>
  );
}


import { db } from "@/db";
import { classes } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  const allClasses = await db.select().from(classes);
  return NextResponse.json({ classes: allClasses });
}

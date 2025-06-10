import { pgTable, uuid, text, timestamp, unique } from "drizzle-orm/pg-core";

// --- Users Table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull(), // 'student' or 'teacher'
  faceImages: text("face_images"), // only for students (nullable)
  createdAt: timestamp("created_at").defaultNow(),
});

// --- Classes Table
export const classes = pgTable("classes", {
  id: uuid("id").defaultRandom().primaryKey(),
  teacherId: uuid("teacher_id").notNull().references(() => users.id), // Must be a teacher
  className: text("class_name").notNull(),
  classLink: text("class_link"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- Class Students (Enrollments)
export const classStudents = pgTable("class_students", {
  id: uuid("id").defaultRandom().primaryKey(),
  classId: uuid("class_id").notNull().references(() => classes.id),
  studentId: uuid("student_id").notNull().references(() => users.id), // Must be a student
  enrolledAt: timestamp("enrolled_at").defaultNow(),
});

// --- Attendance Sessions
export const attendanceSessions = pgTable("attendance_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  classId: uuid("class_id").notNull().references(() => classes.id),
  teacherId: uuid("teacher_id").notNull().references(() => users.id), // Must be a teacher
  sessionDate: timestamp("session_date").notNull(),
  status: text("status"), // e.g., 'open', 'closed'
});

// --- Attendance Records
export const attendanceRecords = pgTable("attendance_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id").notNull().references(() => attendanceSessions.id),
  studentId: uuid("student_id").notNull().references(() => users.id),
  status: text("status").default("present"), // 'present', 'absent'
  scannedAt: timestamp("scanned_at").defaultNow(),
}, (table) => ({
  // Prevent duplicate attendance for same session
  uniqueSessionStudent: unique().on(table.sessionId, table.studentId),
}));

// --- Announcements 
export const announcements = pgTable("announcements", {
  id: uuid("id").defaultRandom().primaryKey(),
  classId: uuid("class_id").notNull().references(() => classes.id),
  teacherId: uuid("teacher_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
});

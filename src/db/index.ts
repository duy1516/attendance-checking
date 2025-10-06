import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Create a single connection pool
const queryClient = postgres(process.env.DATABASE_URL!, {
  max: 10, // number of max pooled connections
  idle_timeout: 30, // optional: disconnects idle clients
});

export const db = drizzle(queryClient);

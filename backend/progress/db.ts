import { SQLDatabase } from "encore.dev/storage/sqldb";

export const progressDB = new SQLDatabase("progress", {
  migrations: "./migrations",
});

import { SQLDatabase } from "encore.dev/storage/sqldb";

export const mediaDB = new SQLDatabase("media", {
  migrations: "./migrations",
});

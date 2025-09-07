import { SQLDatabase } from "encore.dev/storage/sqldb";

export const chatDB = new SQLDatabase("chat", {
  migrations: "./migrations",
});

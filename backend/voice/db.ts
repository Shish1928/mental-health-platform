import { SQLDatabase } from "encore.dev/storage/sqldb";

export const voiceDB = new SQLDatabase("voice", {
  migrations: "./migrations",
});

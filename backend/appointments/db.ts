import { SQLDatabase } from "encore.dev/storage/sqldb";

export const appointmentsDB = new SQLDatabase("appointments", {
  migrations: "./migrations",
});

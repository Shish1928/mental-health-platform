import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { appointmentsDB } from "./db";

export interface ListAppointmentsRequest {
  userId: string;
  userType: Query<"student" | "counselor">;
  status?: Query<string>;
}

export interface Appointment {
  id: string;
  studentId: string;
  counselorId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  sessionType: string;
  notes?: string;
  meetingUrl?: string;
}

export interface ListAppointmentsResponse {
  appointments: Appointment[];
}

// Lists appointments for a user (student or counselor)
export const listAppointments = api<ListAppointmentsRequest, ListAppointmentsResponse>(
  { expose: true, method: "GET", path: "/appointments/list/:userId" },
  async (req) => {
    const { userId, userType, status } = req;

    const userField = userType === "student" ? "student_id" : "counselor_id";
    let whereClause = `WHERE ${userField} = ${userId}`;

    if (status) {
      whereClause += ` AND status = '${status}'`;
    }

    const appointments = await appointmentsDB.queryAll<{
      id: string;
      student_id: string;
      counselor_id: string;
      appointment_date: string;
      start_time: string;
      end_time: string;
      status: string;
      session_type: string;
      notes: string | null;
      meeting_url: string | null;
    }>`
      SELECT id, student_id, counselor_id, appointment_date, start_time, end_time,
             status, session_type, notes, meeting_url
      FROM appointments
      ${whereClause}
      ORDER BY appointment_date DESC, start_time DESC
    `;

    return {
      appointments: appointments.map(apt => ({
        id: apt.id,
        studentId: apt.student_id,
        counselorId: apt.counselor_id,
        appointmentDate: apt.appointment_date,
        startTime: apt.start_time,
        endTime: apt.end_time,
        status: apt.status,
        sessionType: apt.session_type,
        notes: apt.notes || undefined,
        meetingUrl: apt.meeting_url || undefined,
      })),
    };
  }
);

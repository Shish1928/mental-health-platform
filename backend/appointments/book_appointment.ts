import { api, APIError } from "encore.dev/api";
import { appointmentsDB } from "./db";

export interface BookAppointmentRequest {
  studentId: string;
  counselorId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  sessionType: "video" | "audio" | "chat";
  notes?: string;
}

export interface BookAppointmentResponse {
  appointmentId: string;
  status: string;
  message: string;
}

// Books an appointment with a counselor
export const bookAppointment = api<BookAppointmentRequest, BookAppointmentResponse>(
  { expose: true, method: "POST", path: "/appointments/book" },
  async (req) => {
    const { studentId, counselorId, appointmentDate, startTime, endTime, sessionType, notes } = req;

    // Check if counselor exists and is available
    const counselor = await appointmentsDB.queryRow<{ id: string; is_available: boolean }>`
      SELECT id, is_available
      FROM counselors
      WHERE id = ${counselorId}
    `;

    if (!counselor) {
      throw APIError.notFound("Counselor not found");
    }

    if (!counselor.is_available) {
      throw APIError.failedPrecondition("Counselor is not available");
    }

    // Check for time conflicts
    const existingAppointment = await appointmentsDB.queryRow<{ id: string }>`
      SELECT id
      FROM appointments
      WHERE counselor_id = ${counselorId}
        AND appointment_date = ${appointmentDate}
        AND status NOT IN ('cancelled', 'completed')
        AND (
          (start_time <= ${startTime} AND end_time > ${startTime})
          OR (start_time < ${endTime} AND end_time >= ${endTime})
          OR (start_time >= ${startTime} AND end_time <= ${endTime})
        )
    `;

    if (existingAppointment) {
      throw APIError.failedPrecondition("Time slot is already booked");
    }

    // Create appointment
    const result = await appointmentsDB.queryRow<{ id: string }>`
      INSERT INTO appointments (student_id, counselor_id, appointment_date, start_time, end_time, session_type, notes)
      VALUES (${studentId}, ${counselorId}, ${appointmentDate}, ${startTime}, ${endTime}, ${sessionType}, ${notes})
      RETURNING id
    `;

    if (!result) {
      throw APIError.internal("Failed to create appointment");
    }

    return {
      appointmentId: result.id,
      status: "pending",
      message: "Appointment booked successfully. Waiting for counselor confirmation.",
    };
  }
);

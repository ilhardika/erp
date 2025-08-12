import { sql } from "@/lib/neon";
import { NextResponse } from "next/server";

// GET - Get attendance record by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const attendance = await sql.query(
      `
      SELECT 
        a.*, e.employee_number, e.department, e.position,
        u.full_name as employee_name, u.email as employee_email,
        recorder.full_name as recorded_by_name,
        CASE 
          WHEN a.status = 'present' THEN 'Hadir'
          WHEN a.status = 'absent' THEN 'Tidak Hadir'
          WHEN a.status = 'late' THEN 'Terlambat'
          WHEN a.status = 'sick' THEN 'Sakit'
          WHEN a.status = 'leave' THEN 'Cuti'
          ELSE a.status
        END as status_label
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN users recorder ON a.recorded_by = recorder.id
      WHERE a.id = $1
    `,
      [id]
    );

    if (attendance.length === 0) {
      return NextResponse.json(
        { error: "Attendance record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      attendance: attendance[0],
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance record" },
      { status: 500 }
    );
  }
}

// PUT - Update attendance record
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { check_in, check_out, break_start, break_end, status, notes } = body;

    // Check if attendance record exists
    const existingAttendance = await sql.query(
      "SELECT id, attendance_date, employee_id FROM attendance WHERE id = $1",
      [id]
    );

    if (existingAttendance.length === 0) {
      return NextResponse.json(
        { error: "Attendance record not found" },
        { status: 404 }
      );
    }

    const attendanceDate = existingAttendance[0].attendance_date;

    // Recalculate total hours if times are updated
    let total_hours = 0;
    let overtime_hours = 0;

    if (check_in && check_out) {
      const checkInTime = new Date(`${attendanceDate}T${check_in}`);
      const checkOutTime = new Date(`${attendanceDate}T${check_out}`);

      // Calculate break time if provided
      let breakMinutes = 0;
      if (break_start && break_end) {
        const breakStartTime = new Date(`${attendanceDate}T${break_start}`);
        const breakEndTime = new Date(`${attendanceDate}T${break_end}`);
        breakMinutes = (breakEndTime - breakStartTime) / (1000 * 60);
      }

      // Calculate total working hours (excluding break)
      const totalMinutes =
        (checkOutTime - checkInTime) / (1000 * 60) - breakMinutes;
      total_hours = totalMinutes / 60;

      // Calculate overtime (assuming standard work day is 8 hours)
      if (total_hours > 8) {
        overtime_hours = total_hours - 8;
      }

      // Round to 2 decimal places
      total_hours = Math.round(total_hours * 100) / 100;
      overtime_hours = Math.round(overtime_hours * 100) / 100;
    }

    // Update attendance record
    const updateQuery = `
      UPDATE attendance SET 
        check_in = $1,
        check_out = $2,
        break_start = $3,
        break_end = $4,
        total_hours = $5,
        overtime_hours = $6,
        status = $7,
        notes = $8
      WHERE id = $9
      RETURNING *
    `;

    const values = [
      check_in,
      check_out,
      break_start,
      break_end,
      total_hours,
      overtime_hours,
      status,
      notes,
      id,
    ];

    const result = await sql.query(updateQuery, values);

    // Get updated attendance with employee info
    const updatedAttendance = await sql.query(
      `
      SELECT 
        a.*, e.employee_number, e.department, e.position,
        u.full_name as employee_name
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      LEFT JOIN users u ON e.user_id = u.id
      WHERE a.id = $1
    `,
      [id]
    );

    return NextResponse.json({
      message: "Attendance updated successfully",
      attendance: updatedAttendance[0],
    });
  } catch (error) {
    console.error("Error updating attendance:", error);
    return NextResponse.json(
      { error: "Failed to update attendance record" },
      { status: 500 }
    );
  }
}

// DELETE - Delete attendance record
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Check if attendance record exists
    const existingAttendance = await sql.query(
      "SELECT id, attendance_date, employee_id FROM attendance WHERE id = $1",
      [id]
    );

    if (existingAttendance.length === 0) {
      return NextResponse.json(
        { error: "Attendance record not found" },
        { status: 404 }
      );
    }

    // Delete attendance record
    await sql.query("DELETE FROM attendance WHERE id = $1", [id]);

    return NextResponse.json({
      message: "Attendance record deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting attendance:", error);
    return NextResponse.json(
      { error: "Failed to delete attendance record" },
      { status: 500 }
    );
  }
}

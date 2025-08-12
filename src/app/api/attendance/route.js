import { sql } from "@/lib/neon";
import { NextResponse } from "next/server";

// GET - Get attendance records with pagination and filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const employee_id = searchParams.get("employee_id") || "";
    const date_from = searchParams.get("date_from") || "";
    const date_to = searchParams.get("date_to") || "";
    const status = searchParams.get("status") || "";
    const department = searchParams.get("department") || "";

    const offset = (page - 1) * limit;

    // Build query with optional filters
    let whereClause = "WHERE 1=1";
    let queryParams = [];
    let paramIndex = 1;

    if (employee_id) {
      whereClause += ` AND a.employee_id = $${paramIndex}`;
      queryParams.push(employee_id);
      paramIndex++;
    }

    if (date_from) {
      whereClause += ` AND a.attendance_date >= $${paramIndex}`;
      queryParams.push(date_from);
      paramIndex++;
    }

    if (date_to) {
      whereClause += ` AND a.attendance_date <= $${paramIndex}`;
      queryParams.push(date_to);
      paramIndex++;
    }

    if (status) {
      whereClause += ` AND a.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    if (department) {
      whereClause += ` AND e.department = $${paramIndex}`;
      queryParams.push(department);
      paramIndex++;
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      LEFT JOIN users u ON e.user_id = u.id
      ${whereClause}
    `;
    const countResult = await sql.query(countQuery, queryParams);
    const total = parseInt(countResult[0].total);

    // Get attendance records with pagination
    const attendanceQuery = `
      SELECT 
        a.id, a.employee_id, a.attendance_date, a.check_in, a.check_out,
        a.break_start, a.break_end, a.total_hours, a.overtime_hours,
        a.status, a.notes, a.recorded_by, a.created_at,
        e.employee_number, e.department, e.position,
        u.full_name as employee_name,
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
      ${whereClause}
      ORDER BY a.attendance_date DESC, a.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);
    const attendance = await sql.query(attendanceQuery, queryParams);

    // Get summary statistics
    const summaryQuery = `
      SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present_count,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_count,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late_count,
        COUNT(CASE WHEN status = 'sick' THEN 1 END) as sick_count,
        COUNT(CASE WHEN status = 'leave' THEN 1 END) as leave_count,
        COALESCE(AVG(total_hours), 0) as avg_hours,
        COALESCE(SUM(overtime_hours), 0) as total_overtime
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      ${whereClause}
    `;
    const summary = await sql.query(summaryQuery, queryParams.slice(0, -2));

    return NextResponse.json({
      attendance,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      summary: summary[0],
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance records" },
      { status: 500 }
    );
  }
}

// POST - Create new attendance record
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      employee_id,
      attendance_date,
      check_in,
      check_out,
      break_start,
      break_end,
      status = "present",
      notes,
      recorded_by,
    } = body;

    // Validate required fields
    if (!employee_id || !attendance_date) {
      return NextResponse.json(
        { error: "Employee ID and attendance date are required" },
        { status: 400 }
      );
    }

    // Check if employee exists
    const employeeCheck = await sql.query(
      "SELECT id, employee_number FROM employees WHERE id = $1 AND is_active = true",
      [employee_id]
    );

    if (employeeCheck.length === 0) {
      return NextResponse.json(
        { error: "Employee not found or inactive" },
        { status: 400 }
      );
    }

    // Check if attendance record already exists for this date
    const existingAttendance = await sql.query(
      "SELECT id FROM attendance WHERE employee_id = $1 AND attendance_date = $2",
      [employee_id, attendance_date]
    );

    if (existingAttendance.length > 0) {
      return NextResponse.json(
        { error: "Attendance record already exists for this date" },
        { status: 400 }
      );
    }

    // Calculate total hours if check_in and check_out provided
    let total_hours = 0;
    let overtime_hours = 0;

    if (check_in && check_out) {
      const checkInTime = new Date(`${attendance_date}T${check_in}`);
      const checkOutTime = new Date(`${attendance_date}T${check_out}`);

      // Calculate break time if provided
      let breakMinutes = 0;
      if (break_start && break_end) {
        const breakStartTime = new Date(`${attendance_date}T${break_start}`);
        const breakEndTime = new Date(`${attendance_date}T${break_end}`);
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

    // Insert attendance record
    const insertQuery = `
      INSERT INTO attendance (
        employee_id, attendance_date, check_in, check_out, break_start,
        break_end, total_hours, overtime_hours, status, notes, recorded_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      employee_id,
      attendance_date,
      check_in,
      check_out,
      break_start,
      break_end,
      total_hours,
      overtime_hours,
      status,
      notes,
      recorded_by,
    ];

    const result = await sql.query(insertQuery, values);
    const newAttendance = result[0];

    // Get attendance with employee info
    const attendanceWithEmployee = await sql.query(
      `
      SELECT 
        a.*, e.employee_number, e.department, e.position,
        u.full_name as employee_name,
        recorder.full_name as recorded_by_name
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN users recorder ON a.recorded_by = recorder.id
      WHERE a.id = $1
    `,
      [newAttendance.id]
    );

    return NextResponse.json(
      {
        message: "Attendance recorded successfully",
        attendance: attendanceWithEmployee[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating attendance:", error);
    return NextResponse.json(
      { error: "Failed to record attendance" },
      { status: 500 }
    );
  }
}

import { sql } from "@/lib/neon";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Helper function to get current user from token
async function getCurrentUser(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cookieToken = request.cookies.get("auth-token")?.value;
    const token = authHeader?.replace("Bearer ", "") || cookieToken;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const users = await sql`
      SELECT id, email, full_name as name, role 
      FROM users 
      WHERE id = ${decoded.userId} 
      AND is_active = true
      LIMIT 1
    `;

    return users.length > 0 ? users[0] : null;
  } catch (error) {
    return null;
  }
}

// GET - Get employee by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const employee = await sql.query(
      `
      SELECT 
        e.id,
        e.employee_number,
        e.full_name,
        e.email,
        e.phone,
        e.department,
        e.position,
        e.hire_date,
        e.salary,
        e.commission_rate,
        e.bank_account,
        e.bank_name,
        e.emergency_contact,
        e.emergency_phone,
        e.address,
        e.city,
        e.postal_code,
        e.is_active,
        e.created_at,
        e.updated_at,
        CASE 
          WHEN e.is_active = true THEN 'Aktif'
          ELSE 'Tidak Aktif'
        END as status_label
      FROM employees e
      WHERE e.id = $1
    `,
      [id]
    );

    if (employee.length === 0) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    // Get attendance summary for this employee (last 30 days)
    const attendanceSummary = await sql.query(
      `
      SELECT 
        COUNT(*) as total_days,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present_days,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_days,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late_days,
        COALESCE(SUM(total_hours), 0) as total_hours,
        COALESCE(SUM(overtime_hours), 0) as overtime_hours
      FROM attendance 
      WHERE employee_id = $1 
        AND attendance_date >= CURRENT_DATE - INTERVAL '30 days'
    `,
      [id]
    );

    // Get recent attendance records (last 10)
    const recentAttendance = await sql.query(
      `
      SELECT 
        attendance_date, check_in, check_out, total_hours, 
        overtime_hours, status, notes
      FROM attendance 
      WHERE employee_id = $1 
      ORDER BY attendance_date DESC 
      LIMIT 10
    `,
      [id]
    );

    return NextResponse.json({
      success: true,
      data: {
        employee: employee[0],
        attendance_summary: attendanceSummary[0],
        recent_attendance: recentAttendance,
      },
    });
  } catch (error) {
    console.error("Error fetching employee:", error);
    return NextResponse.json(
      { error: "Failed to fetch employee" },
      { status: 500 }
    );
  }
}

// PUT - Update employee
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      employee_number,
      full_name,
      email,
      phone,
      department,
      position,
      hire_date,
      salary,
      commission_rate,
      bank_account,
      bank_name,
      emergency_contact,
      emergency_phone,
      address,
      city,
      postal_code,
      is_active,
    } = body;

    // Check if employee exists
    const existingEmployee = await sql.query(
      "SELECT id FROM employees WHERE id = $1",
      [id]
    );

    if (existingEmployee.length === 0) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    // Check if employee number already exists (excluding current employee)
    if (employee_number) {
      const duplicateCheck = await sql.query(
        "SELECT id FROM employees WHERE employee_number = $1 AND id != $2",
        [employee_number, id]
      );

      if (duplicateCheck.length > 0) {
        return NextResponse.json(
          { error: "Employee number already exists" },
          { status: 400 }
        );
      }
    }

    // Update employee
    const updateQuery = `
      UPDATE employees SET 
        employee_number = $1,
        full_name = $2,
        email = $3,
        phone = $4,
        department = $5,
        position = $6,
        hire_date = $7,
        salary = $8,
        commission_rate = $9,
        bank_account = $10,
        bank_name = $11,
        emergency_contact = $12,
        emergency_phone = $13,
        address = $14,
        city = $15,
        postal_code = $16,
        is_active = $17,
        updated_at = NOW()
      WHERE id = $18
      RETURNING *
    `;

    const values = [
      employee_number,
      full_name,
      email,
      phone,
      department,
      position,
      hire_date,
      salary,
      commission_rate,
      bank_account,
      bank_name,
      emergency_contact,
      emergency_phone,
      address,
      city,
      postal_code,
      is_active,
      id,
    ];

    const result = await sql.query(updateQuery, values);

    // Get updated employee data
    const updatedEmployee = await sql.query(
      `
      SELECT 
        e.id,
        e.employee_number,
        e.full_name,
        e.email,
        e.phone,
        e.department,
        e.position,
        e.hire_date,
        e.salary,
        e.commission_rate,
        e.bank_account,
        e.bank_name,
        e.emergency_contact,
        e.emergency_phone,
        e.address,
        e.city,
        e.postal_code,
        e.is_active,
        e.created_at,
        e.updated_at,
        CASE 
          WHEN e.is_active = true THEN 'Aktif'
          ELSE 'Tidak Aktif'
        END as status_label
      FROM employees e
      WHERE e.id = $1
    `,
      [id]
    );

    return NextResponse.json({
      success: true,
      message: "Employee updated successfully",
      data: updatedEmployee[0],
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    return NextResponse.json(
      { error: "Failed to update employee" },
      { status: 500 }
    );
  }
}

// DELETE - Delete employee (soft delete by setting is_active = false)
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Check if employee exists
    const existingEmployee = await sql.query(
      "SELECT id, employee_number FROM employees WHERE id = $1",
      [id]
    );

    if (existingEmployee.length === 0) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    // Check if employee has attendance records
    const attendanceCheck = await sql.query(
      "SELECT COUNT(*) as count FROM attendance WHERE employee_id = $1",
      [id]
    );

    const hasAttendance = parseInt(attendanceCheck[0].count) > 0;

    if (hasAttendance) {
      // Soft delete - deactivate employee instead of permanent deletion
      await sql.query(
        "UPDATE employees SET is_active = false, updated_at = NOW() WHERE id = $1",
        [id]
      );

      return NextResponse.json({
        success: true,
        message: "Employee deactivated successfully (has attendance records)",
        data: { id: parseInt(id), soft_delete: true },
      });
    } else {
      // Hard delete if no attendance records
      await sql.query("DELETE FROM employees WHERE id = $1", [id]);

      return NextResponse.json({
        success: true,
        message: "Employee deleted successfully",
        data: { id: parseInt(id), soft_delete: false },
      });
    }
  } catch (error) {
    console.error("Error deleting employee:", error);
    return NextResponse.json(
      { error: "Failed to delete employee" },
      { status: 500 }
    );
  }
}

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

// GET - Get all employees with pagination and filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const department = searchParams.get("department") || "";
    const status = searchParams.get("status") || "";
    const position = searchParams.get("position") || "";

    const offset = (page - 1) * limit;

    // Build query with optional filters (using existing schema)
    let whereClause = "WHERE 1=1";
    let queryParams = [];
    let paramIndex = 1;

    if (search) {
      whereClause += ` AND (e.employee_number ILIKE $${paramIndex} OR e.full_name ILIKE $${paramIndex} OR e.email ILIKE $${paramIndex} OR e.department ILIKE $${paramIndex} OR e.position ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (department) {
      whereClause += ` AND e.department = $${paramIndex}`;
      queryParams.push(department);
      paramIndex++;
    }

    if (position) {
      whereClause += ` AND e.position ILIKE $${paramIndex}`;
      queryParams.push(`%${position}%`);
      paramIndex++;
    }

    if (status === "active") {
      whereClause += ` AND e.is_active = true`;
    } else if (status === "inactive") {
      whereClause += ` AND e.is_active = false`;
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM employees e
      ${whereClause}
    `;
    const countResult = await sql.query(countQuery, queryParams);
    const total = parseInt(countResult[0]?.total || 0);

    // Get employees with pagination
    const employeesQuery = `
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
      ${whereClause}
      ORDER BY e.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);
    const employees = await sql.query(employeesQuery, queryParams);

    // Get unique departments for filter options
    const departmentsQuery = `
      SELECT DISTINCT department 
      FROM employees 
      WHERE department IS NOT NULL AND department != ''
      ORDER BY department
    `;
    const departments = await sql.query(departmentsQuery);

    // Get unique positions for filter options
    const positionsQuery = `
      SELECT DISTINCT position 
      FROM employees 
      WHERE position IS NOT NULL AND position != ''
      ORDER BY position
    `;
    const positions = await sql.query(positionsQuery);

    return NextResponse.json({
      success: true,
      data: employees,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        departments: departments.map((d) => d.department),
        positions: positions.map((p) => p.position),
      },
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}

// POST - Create new employee
export async function POST(request) {
  try {
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
      commission_rate = 0,
      bank_account,
      bank_name,
      emergency_contact,
      emergency_phone,
      address,
      city,
      postal_code,
      is_active = true,
    } = body;

    // Validate required fields
    if (!employee_number) {
      return NextResponse.json(
        { error: "Employee number is required" },
        { status: 400 }
      );
    }

    if (!full_name) {
      return NextResponse.json(
        { error: "Full name is required" },
        { status: 400 }
      );
    }

    // Check if employee number already exists
    const existingEmployee = await sql.query(
      "SELECT id FROM employees WHERE employee_number = $1",
      [employee_number]
    );

    if (existingEmployee.length > 0) {
      return NextResponse.json(
        { error: "Employee number already exists" },
        { status: 400 }
      );
    }

    // Insert new employee
    const insertQuery = `
      INSERT INTO employees (
        employee_number, full_name, email, phone, department, position, 
        hire_date, salary, commission_rate, bank_account, bank_name, 
        emergency_contact, emergency_phone, address, city, postal_code, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
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
      bank_account || null,
      bank_name || null,
      emergency_contact || null,
      emergency_phone || null,
      address || null,
      city || null,
      postal_code || null,
      is_active,
    ];

    const result = await sql.query(insertQuery, values);
    const newEmployee = result[0];

    return NextResponse.json(
      {
        success: true,
        message: "Employee created successfully",
        data: newEmployee,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating employee:", error);
    return NextResponse.json(
      { error: "Failed to create employee" },
      { status: 500 }
    );
  }
}

// DELETE - Delete employee by ID
export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { error: "Employee ID is required" },
        { status: 400 }
      );
    }

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

    // Delete employee
    await sql.query("DELETE FROM employees WHERE id = $1", [id]);

    return NextResponse.json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return NextResponse.json(
      { error: "Failed to delete employee" },
      { status: 500 }
    );
  }
}

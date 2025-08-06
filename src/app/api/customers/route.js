import { sql } from "@/lib/neon";
import { NextResponse } from "next/server";

// GET - List all customers with pagination and search
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const type = searchParams.get("type") || "";

    const offset = (page - 1) * limit;

    let whereConditions = [];
    let params = [];

    if (search) {
      whereConditions.push(
        `(name ILIKE $${params.length + 1} OR code ILIKE $${
          params.length + 1
        } OR email ILIKE $${params.length + 1})`
      );
      params.push(`%${search}%`);
    }

    if (status) {
      whereConditions.push(`status = $${params.length + 1}`);
      params.push(status);
    }

    if (type) {
      whereConditions.push(`customer_type = $${params.length + 1}`);
      params.push(type);
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    // Get total count - Use simple query first
    let countResult;
    let customers;

    if (whereConditions.length === 0) {
      // No filters - simple queries
      countResult = await sql`SELECT COUNT(*) as total FROM customers`;
      customers = await sql`
        SELECT id, code, name, email, phone, address, city, customer_type, 
               credit_limit, payment_terms, status, created_at, updated_at
        FROM customers 
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      // With filters - build dynamic query
      let baseQuery = "SELECT COUNT(*) as total FROM customers";
      let dataQuery = `
        SELECT id, code, name, email, phone, address, city, customer_type, 
               credit_limit, payment_terms, status, created_at, updated_at
        FROM customers
      `;

      if (search) {
        baseQuery += ` WHERE (name ILIKE '%${search}%' OR code ILIKE '%${search}%' OR email ILIKE '%${search}%')`;
        dataQuery += ` WHERE (name ILIKE '%${search}%' OR code ILIKE '%${search}%' OR email ILIKE '%${search}%')`;
      }

      if (status) {
        const connector = search ? " AND " : " WHERE ";
        baseQuery += `${connector}status = '${status}'`;
        dataQuery += `${connector}status = '${status}'`;
      }

      if (type) {
        const connector = search || status ? " AND " : " WHERE ";
        baseQuery += `${connector}customer_type = '${type}'`;
        dataQuery += `${connector}customer_type = '${type}'`;
      }

      dataQuery += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

      countResult = await sql.unsafe(baseQuery);
      customers = await sql.unsafe(dataQuery);
    }

    const total = parseInt(countResult[0].total);
    return NextResponse.json({
      success: true,
      data: customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data customer" },
      { status: 500 }
    );
  }
}

// POST - Create new customer
export async function POST(request) {
  try {
    const data = await request.json();
    const {
      code,
      name,
      email,
      phone,
      address,
      city,
      postal_code,
      tax_id,
      customer_type = "retail",
      credit_limit = 0,
      payment_terms = 0,
      notes,
    } = data;

    // Validate required fields
    if (!code || !name) {
      return NextResponse.json(
        { success: false, error: "Kode dan nama customer harus diisi" },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existingCustomer = await sql`
      SELECT id FROM customers WHERE code = ${code} LIMIT 1
    `;

    if (existingCustomer.length > 0) {
      return NextResponse.json(
        { success: false, error: "Kode customer sudah digunakan" },
        { status: 400 }
      );
    }

    // Create new customer
    const newCustomer = await sql`
      INSERT INTO customers (
        code, name, email, phone, address, city, postal_code, tax_id,
        customer_type, credit_limit, payment_terms, notes
      ) VALUES (
        ${code}, ${name}, ${email}, ${phone}, ${address}, ${city}, 
        ${postal_code}, ${tax_id}, ${customer_type}, ${credit_limit}, 
        ${payment_terms}, ${notes}
      )
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      message: "Customer berhasil ditambahkan",
      data: newCustomer[0],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal menambahkan customer" },
      { status: 500 }
    );
  }
}


import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET - Get all products
export async function GET(request) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";

    // Build query
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (category) {
      query.category = category;
    }
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    // Get products with pagination
    const products = await db
      .collection("products")
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get total count for pagination
    const total = await db.collection("products").countDocuments(query);

    // Get categories for filter
    const categories = await db.collection("products").distinct("category", {});

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        categories,
      },
    });
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(request) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    // Validate required fields
    const requiredFields = ["name", "code", "price", "category"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Check if product code already exists
    const existingProduct = await db.collection("products").findOne({
      code: body.code,
    });

    if (existingProduct) {
      return NextResponse.json(
        { success: false, error: "Product code already exists" },
        { status: 400 }
      );
    }

    // Prepare product data
    const productData = {
      name: body.name,
      code: body.code,
      description: body.description || "",
      category: body.category,
      price: parseFloat(body.price),
      cost: parseFloat(body.cost) || 0,
      stock: parseInt(body.stock) || 0,
      minStock: parseInt(body.minStock) || 0,
      unit: body.unit || "pcs",
      barcode: body.barcode || "",
      supplier: body.supplier || "",
      status: body.status || "active",
      images: body.images || [],
      tags: body.tags || [],
      weight: parseFloat(body.weight) || 0,
      dimensions: body.dimensions || { length: 0, width: 0, height: 0 },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("products").insertOne(productData);

    return NextResponse.json({
      success: true,
      data: {
        _id: result.insertedId,
        ...productData,
      },
    });
  } catch (error) {
    console.error("Products POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 }
    );
  }
}

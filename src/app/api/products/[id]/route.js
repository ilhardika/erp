import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET - Get single product by ID
export async function GET(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const product = await db.collection("products").findOne({
      _id: new ObjectId(id),
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Product GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT - Update product
export async function PUT(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    const { id } = await params;
    const body = await request.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid product ID" },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProduct = await db.collection("products").findOne({
      _id: new ObjectId(id),
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if code is being changed and if new code already exists
    if (body.code && body.code !== existingProduct.code) {
      const codeExists = await db.collection("products").findOne({
        code: body.code,
        _id: { $ne: new ObjectId(id) },
      });

      if (codeExists) {
        return NextResponse.json(
          { success: false, error: "Product code already exists" },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData = {
      ...(body.name && { name: body.name }),
      ...(body.code && { code: body.code }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.category && { category: body.category }),
      ...(body.price !== undefined && { price: parseFloat(body.price) }),
      ...(body.cost !== undefined && { cost: parseFloat(body.cost) }),
      ...(body.stock !== undefined && { stock: parseInt(body.stock) }),
      ...(body.minStock !== undefined && { minStock: parseInt(body.minStock) }),
      ...(body.unit && { unit: body.unit }),
      ...(body.barcode !== undefined && { barcode: body.barcode }),
      ...(body.supplier !== undefined && { supplier: body.supplier }),
      ...(body.status && { status: body.status }),
      ...(body.images && { images: body.images }),
      ...(body.tags && { tags: body.tags }),
      ...(body.weight !== undefined && { weight: parseFloat(body.weight) }),
      ...(body.dimensions && { dimensions: body.dimensions }),
      updatedAt: new Date(),
    };

    const result = await db
      .collection("products")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Get updated product
    const updatedProduct = await db.collection("products").findOne({
      _id: new ObjectId(id),
    });

    return NextResponse.json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Product PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE - Delete product
export async function DELETE(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid product ID" },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProduct = await db.collection("products").findOne({
      _id: new ObjectId(id),
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if product is used in any transactions (optional safety check)
    // You can add checks for sales, purchases, etc. here

    const result = await db.collection("products").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Failed to delete product" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Product DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 }
    );
  }
}

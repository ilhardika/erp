// Simple test script to verify the purchase API works correctly
const testPurchaseAPI = async () => {
  try {
    console.log("Testing purchase order API...");

    // Test data with only existing columns
    const testData = {
      supplier_id: 1,
      order_date: new Date().toISOString().split("T")[0],
      expected_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      status: "confirmed",
      notes: "Test update from API",
      shipping_address: "Test address",
      terms_conditions: "Test terms",
    };

    // Assuming purchase order with ID 18 exists
    const response = await fetch(
      "http://localhost:3000/api/purchases/orders/18",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      }
    );

    const result = await response.json();

    console.log("Response status:", response.status);
    console.log("Response data:", result);

    if (response.ok && result.success) {
      console.log("✅ API test passed! Purchase order updated successfully");
    } else {
      console.log("❌ API test failed:", result.error || "Unknown error");
    }
  } catch (error) {
    console.error("❌ API test error:", error.message);
  }
};

// Run the test
testPurchaseAPI();

// Test script to verify purchase order update API
console.log("Testing purchase order update API...");

fetch("http://localhost:3000/api/purchases/orders/20", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    supplier_id: 1,
    order_date: "2025-08-11",
    expected_date: "2025-08-18",
    status: "confirmed",
    notes: "Test update - API fixed",
    subtotal: 1000.0,
    discount_amount: 50.0,
    tax_amount: 95.0,
    total_amount: 1045.0,
  }),
})
  .then((response) => {
    console.log("Response status:", response.status);
    return response.json();
  })
  .then((data) => {
    console.log("Response data:", data);
    if (data.success) {
      console.log("✅ API test passed!");
    } else {
      console.log("❌ API test failed:", data.error);
    }
  })
  .catch((error) => {
    console.error("❌ Error:", error);
  });

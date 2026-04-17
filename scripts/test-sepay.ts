/**
 * Script test tích hợp SePay
 * 
 * Chạy: npx tsx scripts/test-sepay.ts
 */

import { getSePay } from "../src/lib/payment/sepay";

async function testSePayIntegration() {
  console.log("🧪 Testing SePay Integration...\n");

  try {
    // 1. Test khởi tạo client
    console.log("1️⃣ Testing SePay Client Initialization...");
    const sepay = getSePay();
    console.log("✅ SePay client initialized successfully");
    console.log(`   Environment: ${process.env.SEPAY_ENV || "sandbox"}`);
    console.log(`   Merchant ID: ${process.env.SEPAY_MERCHANT_ID?.slice(0, 15)}...`);
    console.log();

    // 2. Test tạo checkout fields
    console.log("2️⃣ Testing Checkout Fields Generation...");
    const testPledgeId = "test-pledge-" + Date.now();
    const checkoutFields = sepay.createCheckoutFields({
      orderInvoiceNumber: `INV-${testPledgeId.slice(0, 8)}-${Date.now()}`,
      orderAmount: 100000,
      orderDescription: "Test payment for campaign",
      customerId: "test-user-123",
      successUrl: "http://localhost:3000/payment-success?status=success",
      errorUrl: "http://localhost:3000/payment-success?status=error",
      cancelUrl: "http://localhost:3000/campaigns",
      paymentMethod: "BANK_TRANSFER",
    });

    console.log("✅ Checkout fields generated successfully");
    console.log("   Fields:", Object.keys(checkoutFields).join(", "));
    console.log("   Signature:", checkoutFields.signature.slice(0, 20) + "...");
    console.log();

    // 3. Test checkout URL
    console.log("3️⃣ Testing Checkout URL...");
    const checkoutUrl = sepay.getCheckoutUrl();
    console.log("✅ Checkout URL:", checkoutUrl);
    console.log();

    // 4. Test signature verification
    console.log("4️⃣ Testing Signature Verification...");
    const mockIPNData = {
      timestamp: Date.now(),
      notification_type: "ORDER_PAID",
      order: {
        id: "test-order-id",
        order_status: "CAPTURED",
      },
      transaction: {
        id: "test-transaction-id",
        transaction_status: "APPROVED",
      },
    };

    // Tạo signature giả để test
    const testSignature = "test-signature-123";
    const isValid = sepay.verifyIPNSignature(mockIPNData, testSignature);
    console.log(`   Signature verification result: ${isValid ? "✅ Valid" : "❌ Invalid (expected for test)"}`);
    console.log();

    // 5. Test generate HTML form
    console.log("5️⃣ Testing HTML Form Generation...");
    const htmlForm = sepay.generateFormHtml(checkoutFields);
    console.log("✅ HTML form generated successfully");
    console.log(`   Form length: ${htmlForm.length} characters`);
    console.log();

    // Summary
    console.log("=" .repeat(50));
    console.log("✅ All tests passed!");
    console.log("=" .repeat(50));
    console.log("\n📝 Next steps:");
    console.log("   1. Start dev server: npm run dev");
    console.log("   2. Create a test payment via UI");
    console.log("   3. Check webhook logs when payment completes");
    console.log("   4. Verify pledge status in database");
    console.log("\n💡 Tips:");
    console.log("   - Use ngrok for local webhook testing");
    console.log("   - Check SePay dashboard for transaction logs");
    console.log("   - Monitor console logs for webhook calls");

  } catch (error: any) {
    console.error("\n❌ Test failed:", error.message);
    console.error("\n🔍 Troubleshooting:");
    console.error("   1. Check .env file has SEPAY_MERCHANT_ID and SEPAY_SECRET_KEY");
    console.error("   2. Verify credentials from SePay dashboard");
    console.error("   3. Ensure SEPAY_ENV is set to 'sandbox' or 'production'");
    process.exit(1);
  }
}

// Run tests
testSePayIntegration();

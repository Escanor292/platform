#!/bin/bash

# Script test SePay webhook locally
# Usage: ./scripts/test-sepay-webhook.sh [pledge-id]

PLEDGE_ID=${1:-"cm5abc12"}
TIMESTAMP=$(date +%s)
WEBHOOK_URL="http://localhost:3000/api/payment/sepay/webhook"

echo "🧪 Testing SePay Webhook..."
echo "📍 Webhook URL: $WEBHOOK_URL"
echo "🆔 Pledge ID: $PLEDGE_ID"
echo ""

# Test 1: Successful payment
echo "1️⃣ Testing successful payment notification..."
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"timestamp\": $TIMESTAMP,
    \"notification_type\": \"ORDER_PAID\",
    \"order\": {
      \"id\": \"test-order-$(date +%s)\",
      \"order_id\": \"NQD-TEST-$(date +%s)\",
      \"order_status\": \"CAPTURED\",
      \"order_currency\": \"VND\",
      \"order_amount\": \"100000.00\",
      \"order_invoice_number\": \"INV-$PLEDGE_ID-$TIMESTAMP\",
      \"order_description\": \"Test payment\"
    },
    \"transaction\": {
      \"id\": \"test-txn-$(date +%s)\",
      \"payment_method\": \"BANK_TRANSFER\",
      \"transaction_id\": \"TEST-TXN-$(date +%s)\",
      \"transaction_type\": \"PAYMENT\",
      \"transaction_date\": \"$(date '+%Y-%m-%d %H:%M:%S')\",
      \"transaction_status\": \"APPROVED\",
      \"transaction_amount\": \"100000\",
      \"transaction_currency\": \"VND\"
    }
  }"

echo -e "\n"
echo "=" | tr -d '\n' | head -c 50
echo ""

# Test 2: Failed payment
echo -e "\n2️⃣ Testing failed payment notification..."
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"timestamp\": $TIMESTAMP,
    \"notification_type\": \"ORDER_PAID\",
    \"order\": {
      \"id\": \"test-order-failed-$(date +%s)\",
      \"order_status\": \"DECLINED\",
      \"order_currency\": \"VND\",
      \"order_amount\": \"100000.00\",
      \"order_invoice_number\": \"INV-$PLEDGE_ID-$TIMESTAMP\",
      \"order_description\": \"Test failed payment\"
    },
    \"transaction\": {
      \"id\": \"test-txn-failed-$(date +%s)\",
      \"transaction_status\": \"DECLINED\",
      \"transaction_amount\": \"100000\"
    }
  }"

echo -e "\n"
echo "=" | tr -d '\n' | head -c 50
echo ""

# Test 3: GET endpoint info
echo -e "\n3️⃣ Testing GET endpoint..."
curl -X GET "$WEBHOOK_URL"

echo -e "\n\n✅ Tests completed!"
echo ""
echo "📝 Next steps:"
echo "   1. Check server logs for [SEPAY WEBHOOK] messages"
echo "   2. Verify pledge status in database"
echo "   3. Check audit logs for changes"
echo ""
echo "💡 Tips:"
echo "   - Make sure dev server is running (npm run dev)"
echo "   - Use a real pledge ID for accurate testing"
echo "   - Check Prisma Studio to verify changes"

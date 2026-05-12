// scripts/test-mongo-resilience.js
/**
 * Script này kiểm tra tính ổn định của hệ thống khi MongoDB gặp sự cố.
 * Cách chạy: 
 * 1. Chỉnh MONGODB_URI trong .env thành một giá trị sai (VD: mongodb://localhost:27018 - cổng sai)
 * 2. Chạy: node scripts/test-mongo-resilience.js
 */

const { activityLogService } = require('../src/services/mongodb/activity-log.service');
require('dotenv').config();

async function testResilience() {
  console.log('--- STARTING MONGO RESILIENCE TEST ---');
  console.log('Testing with MONGODB_URI:', process.env.MONGODB_URI);
  
  // 1. Giả lập một hành động quan trọng (ví dụ: User Payment)
  console.log('\n[STEP 1] Simulating a core transaction (e.g., Payment)...');
  
  try {
    // Luồng chính (Giả định PostgreSQL thành công)
    console.log('>> [SUCCESS] Core transaction logic executed (PostgreSQL simulate).');

    // 2. Gọi MongoDB logging (Fire-and-forget)
    console.log('[STEP 2] Calling MongoDB activityLogService.log (Non-blocking)...');
    
    activityLogService.log({
      action: 'TEST_RESILIENCE',
      entityType: 'SYSTEM',
      entityId: 'TEST_001',
      details: { message: 'This should not block if Mongo is down' }
    });

    // 3. Kiểm tra xem luồng chính có bị block không
    console.log('[STEP 3] Verifying if main thread continues...');
    
    let count = 0;
    const interval = setInterval(() => {
      count++;
      console.log(`>> Main thread is still alive and ticking... (${count}s)`);
      if (count >= 5) {
        clearInterval(interval);
        console.log('\n--- TEST FINISHED ---');
        console.log('RESULT: The main thread was NOT blocked by MongoDB failure.');
        console.log('Check console for [MONGODB MONITOR] warnings above.');
        process.exit(0);
      }
    }, 1000);

  } catch (error) {
    console.error('!! [FAILED] The main thread crashed!', error);
    process.exit(1);
  }
}

testResilience();

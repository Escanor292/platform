const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('👤 Creating new accounts...\n');

        // 1. Admin Account
        console.log('Creating Admin account...');
        const adminPassword = await bcrypt.hash('Admin@123456', 10);
        const admin = await prisma.user.create({
            data: {
                email: 'admin@crowdfunding.vn',
                password: adminPassword,
                name: 'Admin',
                displayName: 'Admin',
                role: 'ADMIN',
                status: 'NORMAL',
                isAdmin: true,
            },
        });
        console.log(`  ✅ Admin created`);
        console.log(`     Email: ${admin.email}`);
        console.log(`     Password: Admin@123456`);
        console.log(`     Role: ADMIN\n`);

        // 2. Backer Account
        console.log('Creating Backer account...');
        const backerPassword = await bcrypt.hash('123', 10);
        const backer = await prisma.user.create({
            data: {
                email: 'test1@gmail.com',
                password: backerPassword,
                name: 'Test Backer',
                displayName: 'Test Backer',
                role: 'BACKER',
                status: 'NORMAL',
            },
        });
        console.log(`  ✅ Backer created`);
        console.log(`     Email: ${backer.email}`);
        console.log(`     Password: 123`);
        console.log(`     Role: BACKER\n`);

        // 3. Creator Account
        console.log('Creating Creator account...');
        const creatorPassword = await bcrypt.hash('123', 10);
        const creator = await prisma.user.create({
            data: {
                email: 'test2@gmail.com',
                password: creatorPassword,
                name: 'Test Creator',
                displayName: 'Test Creator',
                role: 'CREATOR',
                status: 'NORMAL',
            },
        });
        console.log(`  ✅ Creator created`);
        console.log(`     Email: ${creator.email}`);
        console.log(`     Password: 123`);
        console.log(`     Role: CREATOR\n`);

        // 4. Creator Pro Account
        console.log('Creating Creator Pro account...');
        const creatorProPassword = await bcrypt.hash('123', 10);
        const creatorPro = await prisma.user.create({
            data: {
                email: 'test3@gmail.com',
                password: creatorProPassword,
                name: 'Test Creator Pro',
                displayName: 'Test Creator Pro',
                role: 'CREATOR',
                status: 'PRO',
            },
        });
        console.log(`  ✅ Creator Pro created`);
        console.log(`     Email: ${creatorPro.email}`);
        console.log(`     Password: 123`);
        console.log(`     Role: CREATOR`);
        console.log(`     Status: PRO\n`);

        // 5. Summary
        console.log('✅ All accounts created successfully!\n');
        console.log('📋 ACCOUNT SUMMARY:\n');
        console.log('Admin Account:');
        console.log('  Email: admin@crowdfunding.vn');
        console.log('  Password: Admin@123456');
        console.log('  Role: ADMIN\n');

        console.log('Backer Account:');
        console.log('  Email: test1@gmail.com');
        console.log('  Password: 123');
        console.log('  Role: BACKER\n');

        console.log('Creator Account:');
        console.log('  Email: test2@gmail.com');
        console.log('  Password: 123');
        console.log('  Role: CREATOR\n');

        console.log('Creator Pro Account:');
        console.log('  Email: test3@gmail.com');
        console.log('  Password: 123');
        console.log('  Role: CREATOR (PRO)\n');

    } catch (error) {
        console.error('❌ Error creating accounts:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();

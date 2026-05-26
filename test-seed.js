const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Testing campaign creation...');

        // Get test3 user
        const test3 = await prisma.user.findFirst({
            where: { email: 'test3@gmail.com' }
        });

        if (!test3) {
            console.log('test3 user not found!');
            return;
        }

        console.log('Found test3:', test3.email);

        // Try to create one campaign
        const campaign = await prisma.campaign.create({
            data: {
                campaignCode: 'TEST-001',
                slug: 'test-campaign',
                title: 'Test Campaign',
                description: 'Test description',
                longDescription: '<p>Test long description</p>',
                imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=600&fit=crop',
                category: 'Công Nghệ',
                type: 'REWARD',
                goalAmount: 10000000,
                currentAmount: 0,
                status: 'ACTIVE',
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                creatorId: test3.id,
            }
        });

        console.log('✅ Created campaign:', campaign.title);

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    }
}

main()
    .finally(() => prisma.$disconnect());

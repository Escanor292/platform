// Script to fix Next.js 15 params in API routes
const fs = require('fs');
const path = require('path');

const files = [
    'src/app/api/auth/[...nextauth]/route.ts',
    'src/app/api/blog/comments/[id]/route.ts',
    'src/app/api/blog/posts/[slug]/route.ts',
    'src/app/api/campaigns/[slug]/route.ts',
    'src/app/api/campaigns/[slug]/updates/[id]/route.ts',
    'src/app/api/chat/messages/[messageId]/route.ts',
    'src/app/api/payment/sepay/status/[pledgeId]/route.ts',
    'src/app/api/rewards/[id]/route.ts',
    'src/app/api/taxonomy/[category]/route.ts',
    'src/app/api/transactions/[txId]/route.ts',
    'src/app/api/users/[userId]/route.ts',
];

files.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);

    if (!fs.existsSync(fullPath)) {
        console.log(`⏭️  Skip: ${filePath} (not found)`);
        return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // Pattern 1: { params }: { params: { ... } }
    const pattern1 = /\{\s*params\s*\}:\s*\{\s*params:\s*\{([^}]+)\}\s*\}/g;
    if (pattern1.test(content)) {
        content = content.replace(
            pattern1,
            'context: { params: Promise<{$1}> }'
        );
        modified = true;
    }

    // Add await params after function start
    if (modified) {
        // Find all function bodies and add await params
        content = content.replace(
            /(export async function \w+\([^)]+context: \{ params: Promise<[^>]+>\s*\}\s*\)\s*\{[^]*?)(const|let|var|return|await|if|try)/,
            (match, before, after) => {
                if (!before.includes('await context.params')) {
                    return before + '\n  const params = await context.params;\n  ' + after;
                }
                return match;
            }
        );
    }

    if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ Fixed: ${filePath}`);
    } else {
        console.log(`⏭️  Skip: ${filePath} (no changes needed)`);
    }
});

console.log('\n✅ Done!');

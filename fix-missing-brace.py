import os
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Fix: context: { params: Promise<{ ... }>\n) {
    # To:   context: { params: Promise<{ ... }> }\n) {
    content = re.sub(
        r'context:\s*\{\s*params:\s*Promise<\{([^}]+)\}>\s*\n\)',
        r'context: { params: Promise<{\1}> }\n)',
        content
    )
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

# Find all route files
count = 0
for root, dirs, files in os.walk('src/app/api'):
    for file in files:
        if file.endswith('.ts'):
            filepath = os.path.join(root, file)
            if fix_file(filepath):
                print(f'✅ Fixed: {filepath}')
                count += 1

print(f'\n✅ Fixed {count} files!')

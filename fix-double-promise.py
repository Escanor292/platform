import os
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Fix Promise<Promise<...>> to Promise<...>
    content = re.sub(r'Promise<Promise<([^>]+)>', r'Promise<\1}', content)
    
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

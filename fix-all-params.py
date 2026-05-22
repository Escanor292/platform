import os
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Pattern 1: Fix { params }: Params to context: { params: Promise<...> }
    # We need to find the Params type definition first
    
    # For single param like { slug: string }
    content = re.sub(
        r'(\w+)\s*\(\s*([^,]+),\s*\{\s*params\s*\}:\s*Params\s*\)',
        lambda m: f'{m.group(1)}(\n  {m.group(2).strip()},\n  context: {{ params: Promise<{{ [key: string]: string }}> }}\n)',
        content
    )
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

# Find all route files
count = 0
fixed_files = []

for root, dirs, files in os.walk('src/app/api'):
    for file in files:
        if file.endswith('.ts'):
            filepath = os.path.join(root, file)
            if fix_file(filepath):
                print(f'✅ Fixed: {filepath}')
                fixed_files.append(filepath)
                count += 1

print(f'\n✅ Fixed {count} files!')
if fixed_files:
    print('\nFixed files:')
    for f in fixed_files:
        print(f'  - {f}')

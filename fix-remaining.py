import os
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Pattern: { params }: { params: ... }
    pattern = r'\{\s*params\s*\}:\s*\{\s*params:\s*([^}]+)\}'
    
    def replace_params(match):
        param_type = match.group(1).strip()
        return f'context: {{ params: Promise<{param_type}> }}'
    
    content = re.sub(pattern, replace_params, content)
    
    # Add await params if changed and not exists
    if content != original and 'await context.params' not in content:
        # Find function with context and add await
        lines = content.split('\n')
        new_lines = []
        i = 0
        while i < len(lines):
            line = lines[i]
            new_lines.append(line)
            
            # If function with context param
            if 'export async function' in line and 'context:' in line:
                # Look for try { or just {
                j = i + 1
                while j < len(lines) and j < i + 5:
                    if 'try {' in lines[j]:
                        new_lines.append('    const params = await context.params;')
                        break
                    elif ') {' in line and 'try' not in lines[j]:
                        new_lines.append('  const params = await context.params;')
                        break
                    j += 1
            i += 1
        
        content = '\n'.join(new_lines)
    
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

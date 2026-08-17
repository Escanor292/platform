import os

env_path = r'd:\Du_An\crowdfunding-vn\.env'

# Read existing content
with open(env_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Process lines - remove old MONGODB_URI and MONGODB_DB_NAME, add new ones
new_lines = []
found_mongo_uri = False
found_mongo_db = False

for line in lines:
    if line.startswith('MONGODB_URI='):
        found_mongo_uri = True
        # Skip old line, will add new one at end
        continue
    elif line.startswith('MONGODB_DB_NAME='):
        found_mongo_db = True
        # Skip old line, will add new one at end
        continue
    else:
        new_lines.append(line)

# Add new MongoDB config at the end
new_lines.append('\n# --- MongoDB (Parallel Integration) ---\n')
new_lines.append('MONGODB_URI=mongodb+srv://nguyenquachphutai_db_user:0909115079%40Tai@duan.b4wcshp.mongodb.net/?appName=DuAn\n')
new_lines.append('MONGODB_DB_NAME=DuAn\n')

# Write back
with open(env_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f'Updated .env file')
print(f'Found old MONGODB_URI: {found_mongo_uri}')
print(f'Found old MONGODB_DB_NAME: {found_mongo_db}')

import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const r = await pool.query("SELECT id, name, email, role FROM users WHERE id IN ('92df92ff-0f15-469f-9f24-99b44984bd13','cmphnhw8e0002so1uh16dwpvn')");
console.log(r.rows);
await pool.end();

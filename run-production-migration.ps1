# Script để chạy migration trên production database

Write-Host "🚀 Chạy migration trên Production Database..." -ForegroundColor Green

# Set production DATABASE_URL
$env:DATABASE_URL = "postgresql://neondb_owner:npg_v9Q4oKsHObqT@ep-weathered-sky-ao6ep9en.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

Write-Host "📊 Kiểm tra kết nối database..." -ForegroundColor Yellow
npx prisma db pull --force

Write-Host "🔄 Chạy migrations..." -ForegroundColor Yellow
npx prisma migrate deploy

Write-Host "✨ Generate Prisma Client..." -ForegroundColor Yellow
npx prisma generate

Write-Host "✅ Migration hoàn tất!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Tiếp theo, chạy seed để thêm blog post:" -ForegroundColor Cyan
Write-Host "   node create-blog-thue-tncn.js" -ForegroundColor White
Write-Host "   node update-blog-content.js" -ForegroundColor White

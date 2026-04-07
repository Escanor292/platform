const { execSync } = require('child_process');
const os = require('os');

/**
 * Tự động lấy địa chỉ IP LAN (Wifi/Ethernet) để hiển thị địa chỉ Network
 */
function getIPAddress() {
    const interfaces = os.networkInterfaces();
    let ip = '0.0.0.0';
    
    // Ưu tiên các card mạng có tên chứa 'Wi-Fi' hoặc 'Ethernet' trên Windows
    const priority = ['Wi-Fi', 'Ethernet', 'Wireless', 'Local Area Connection'];
    
    // Sắp xếp các interface theo độ ưu tiên
    const sortedInterfaces = Object.keys(interfaces).sort((a, b) => {
        const aIndex = priority.findIndex(p => a.includes(p));
        const bIndex = priority.findIndex(p => b.includes(p));
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return 0;
    });

    for (const name of sortedInterfaces) {
        const iface = interfaces[name];
        for (const alias of iface) {
            if (alias.family === 'IPv4' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return ip;
}

const host = getIPAddress();
const port = 3000;

console.log(`\x1b[36m   ▲ Next.js 15.5.14 CFVN===================================\x1b[0m`);
console.log(`\x1b[36m   - Local:        http://localhost:${port}\x1b[0m`);
console.log(`\x1b[36m   - Network:      http://${host}:${port}\x1b[0m`);
console.log(`\x1b[36m   - Environments: .env\x1b[0m`);
console.log('');

try {
    // Chạy lệnh next dev, sử dụng local binary để ổn định
    execSync(`npx next dev -H 0.0.0.0 -p ${port}`, { stdio: 'inherit' });
} catch (e) {
    // Port 3000 might be in use
    execSync(`npx next dev -H 0.0.0.0 -p 3001`, { stdio: 'inherit' });
}

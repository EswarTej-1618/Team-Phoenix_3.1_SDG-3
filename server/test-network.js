const dns = require('dns');
const net = require('net');

console.log('=== Network Diagnostics for Gmail SMTP ===\n');

// Test 1: DNS Resolution
console.log('1. Testing DNS resolution for smtp.gmail.com...');
dns.lookup('smtp.gmail.com', (err, address) => {
    if (err) {
        console.error('   ✗ DNS lookup failed:', err.message);
        console.error('   This means your computer cannot resolve smtp.gmail.com');
        console.error('   Possible causes:');
        console.error('   - No internet connection');
        console.error('   - DNS server issues');
        console.error('   - Firewall blocking DNS');
    } else {
        console.log('   ✓ DNS resolved to:', address);

        // Test 2: SMTP Port Connection
        console.log('\n2. Testing connection to Gmail SMTP port 587...');
        const socket = net.createConnection(587, address);

        socket.on('connect', () => {
            console.log('   ✓ Successfully connected to Gmail SMTP server!');
            console.log('   The network connection is working.');
            socket.end();
        });

        socket.on('error', (err) => {
            console.error('   ✗ Connection failed:', err.message);
            console.error('   Possible causes:');
            console.error('   - Firewall blocking port 587');
            console.error('   - Antivirus blocking SMTP');
            console.error('   - Corporate network blocking outbound SMTP');
        });

        socket.setTimeout(5000);
        socket.on('timeout', () => {
            console.error('   ✗ Connection timeout');
            console.error('   The server is not responding on port 587');
            socket.destroy();
        });
    }
});

// Test 3: Internet connectivity
console.log('\n3. Testing general internet connectivity...');
dns.lookup('google.com', (err, address) => {
    if (err) {
        console.error('   ✗ Cannot reach google.com');
        console.error('   You may not have internet connection');
    } else {
        console.log('   ✓ Internet connection is working');
        console.log('   Resolved google.com to:', address);
    }
});

setTimeout(() => {
    console.log('\n=== Diagnostic Complete ===');
    console.log('\nIf DNS or connection failed, try these solutions:');
    console.log('1. Check your internet connection');
    console.log('2. Disable firewall/antivirus temporarily to test');
    console.log('3. Try using a different network (mobile hotspot)');
    console.log('4. Check if your network blocks SMTP (port 587)');
}, 6000);

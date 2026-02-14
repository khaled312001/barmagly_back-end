const { PrismaClient } = require('@prisma/client');
const net = require('net');
const fs = require('fs');

async function test() {
    let log = '--- Backend Diagnostic ---\n';
    log += `Time: ${new Date().toISOString()}\n`;
    
    // Check port 5001
    const checkPort = (port) => new Promise((resolve) => {
        const server = net.createServer();
        server.once('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                resolve(`❌ Port ${port} is already in use\n`);
            } else {
                resolve(`❌ Error checking port ${port}: ${err.message}\n`);
            }
        });
        server.once('listening', () => {
            server.close();
            resolve(`✅ Port ${port} is available\n`);
        });
        server.listen(port);
    });

    log += await checkPort(5001);
    log += await checkPort(3001);

    // Check Prisma
    const prisma = new PrismaClient();
    try {
        log += 'Attempting DB connection...\n';
        await prisma.$connect();
        log += '✅ DB connection successful\n';
        const userCount = await prisma.user.count();
        log += `✅ User count in DB: ${userCount}\n`;
    } catch (err) {
        log += `❌ DB connection failed: ${err.message}\n`;
    } finally {
        await prisma.$disconnect();
    }

    fs.writeFileSync('diagnostic.log', log);
    console.log('Diagnostic completed. See diagnostic.log');
}

test();

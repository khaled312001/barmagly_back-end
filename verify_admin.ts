import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    let output = '--- Database Admin Verification ---\n';
    try {
        const admin = await prisma.user.findUnique({
            where: { email: 'admin@barmagly.ch' }
        });

        if (!admin) {
            output += '❌ Admin user NOT found in database.\n';
        } else {
            output += '✅ Admin user found:\n';
            output += `   ID: ${admin.id}\n`;
            output += `   Email: ${admin.email}\n`;
            output += `   Name: ${admin.name}\n`;
            output += `   Role: ${admin.role}\n`;
            output += `   IsActive: ${admin.isActive}\n`;

            const passwordMatch = await bcrypt.compare('admin123', admin.password);
            output += `   Password "admin123" matches: ${passwordMatch ? '✅ YES' : '❌ NO'}\n`;
        }
    } catch (error: any) {
        output += `❌ Error connecting to database: ${error.message}\n`;
    } finally {
        await prisma.$disconnect();
        fs.writeFileSync('verify_results.txt', output);
        console.log('Results written to verify_results.txt');
    }
}

main();

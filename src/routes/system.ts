import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, roleGuard } from '../middleware/auth';
import * as bcrypt from 'bcryptjs';
import { seedDatabase } from '../lib/seeding';

const router = Router();

// ============ PUBLIC HEALTH CHECK ============
router.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        databaseUrlDetected: !!process.env.DATABASE_URL || !!process.env.MONGODB_URI,
        nodeEnv: process.env.NODE_ENV
    });
});

// ============ PUBLIC INIT/REPAIR ============

// Initialize or repair critical data without authentication
router.get('/init-db', async (_req, res) => {
    try {
        const result = await seedDatabase();

        res.json({
            success: result.success,
            message: result.success
                ? 'Database initialized and seeded successfully. You can now log in.'
                : 'Initialization failed partially. Check logs.',
            logs: result.logs
        });
    } catch (error: any) {
        console.error('Public Init error:', error);
        res.status(500).json({
            success: false,
            message: `Initialization failed: ${error.message}`,
            logs: [error.message]
        });
    }
});

// ============ PROTECTED SYSTEM ROUTES ============
router.use(authMiddleware);

// Check system status
router.get('/status', roleGuard('ADMIN'), async (_req, res) => {
    const status = {
        database: 'Checking...',
        env: {
            FRONTEND_URL: process.env.FRONTEND_URL ? 'Defined' : 'Missing',
            DATABASE_URL: process.env.DATABASE_URL ? 'Defined' : 'Missing',
            PORT: process.env.PORT || 5001,
            NODE_ENV: process.env.NODE_ENV || 'development'
        }
    };

    try {
        await prisma.user.findFirst();
        status.database = 'Connected';
    } catch (error: any) {
        status.database = `Error: ${error.message} `;
    }

    res.json(status);
});

// Run repair / re-seed
router.post('/repair', roleGuard('ADMIN'), async (_req, res) => {
    const logs: string[] = [];
    const log = (msg: string) => logs.push(`[${new Date().toLocaleTimeString()}] ${msg} `);

    try {
        log('Starting repair operation...');

        // 1. Verify Admin User
        const adminEmail = 'admin@barmagly.ch';
        const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } });

        if (!adminExists) {
            log('Admin user missing. Creating default admin...');
            const hashedPassword = await bcrypt.hash('admin123', 12);
            await prisma.user.create({
                data: {
                    email: adminEmail,
                    password: hashedPassword,
                    name: 'Admin',
                    role: 'ADMIN',
                }
            });
            log('Default admin user created successfully.');
        } else {
            log('Admin user verified.');
        }

        // 2. Verify Essential Site Settings
        log('Verifying site settings...');
        const essentialSettings = [
            { key: 'companyName', value: 'Barmagly' },
            { key: 'email', value: 'info@barmagly.ch' }
        ];

        for (const s of essentialSettings) {
            await prisma.siteSetting.upsert({
                where: { key: s.key },
                update: {},
                create: { key: s.key, value: s.value }
            });
        }
        log('Essential site settings verified.');

        res.json({
            success: true,
            message: 'System repair completed successfully',
            logs
        });
    } catch (error: any) {
        console.error('Repair error:', error);
        res.status(500).json({
            success: false,
            message: `Repair failed: ${error.message} `,
            logs
        });
    }
});

export default router;

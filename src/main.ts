import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Load env
dotenv.config();

// Routes
import authRoutes from './routes/auth';
import publicRoutes from './routes/public';
import adminRoutes from './routes/admin';
import fs from 'fs';

const logFile = 'server_startup.log';
function log(msg: string) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logFile, `[${timestamp}] ${msg}\n`);
    console.log(msg);
}

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5001;

// ============ MIDDLEWARE ============

// Security
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS
const allowedOrigins = process.env.FRONTEND_URL?.split(',') || ['http://localhost:3000'];
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));

// Rate limiting
app.use(rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 100,
    message: { error: 'Too many requests, please try again later.' },
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files (uploads)
app.use('/uploads', express.static('uploads'));

// ============ ROUTES ============

app.use('/api/auth', authRoutes);
app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============ ERROR HANDLING ============

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    });
});

// 404
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// ============ START ============

async function main() {
    log('🚀 Starting server initialization...');
    try {
        await prisma.$connect();
        log('✅ Database connected');
    } catch (error: any) {
        log(`❌ Database connection failed: ${error.message}`);
        log('⚠️ Continuing server start without database...');
    }

    try {
        app.listen(Number(PORT), '0.0.0.0', async () => {
            log(`🚀 Server running on http://0.0.0.0:${PORT}`);
            log(`📖 API docs: http://localhost:${PORT}/api/health`);

            // Auto-seed admin user
            try {
                const adminEmail = 'admin@barmagly.com';
                const exists = await prisma.user.findUnique({ where: { email: adminEmail } });
                if (!exists) {
                    const hashedPassword = await bcrypt.hash('admin123', 12);
                    await prisma.user.create({
                        data: {
                            email: adminEmail,
                            password: hashedPassword,
                            name: 'Admin',
                            role: 'ADMIN',
                        }
                    });
                    log('✅ Default admin user created');
                } else {
                    log('ℹ️ Admin user already exists');
                }
            } catch (err: any) {
                log(`❌ Failed to auto-seed admin: ${err.message}`);
            }
        });
    } catch (error: any) {
        log(`❌ Failed to start server: ${error.message}`);
        process.exit(1);
    }
}

main();

// Graceful shutdown
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});

export { prisma };
export default app;

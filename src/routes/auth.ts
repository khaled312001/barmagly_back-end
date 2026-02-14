import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.isActive) {
            console.log(`[${new Date().toISOString()}] Login failed: User not found or inactive - ${email}`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            console.log(`[${new Date().toISOString()}] Login failed: Password mismatch - ${email}`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log(`[${new Date().toISOString()}] Login success: ${email}`);

        const accessToken = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            (process.env.JWT_SECRET || 'secret') as jwt.Secret,
            { expiresIn: (process.env.JWT_EXPIRATION || '15m') as any }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            (process.env.JWT_REFRESH_SECRET || 'refresh-secret') as jwt.Secret,
            { expiresIn: (process.env.JWT_REFRESH_EXPIRATION || '7d') as any }
        );

        res.json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token required' });
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET || 'refresh-secret'
        ) as { id: string };

        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user || !user.isActive) {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }

        const newAccessToken = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            (process.env.JWT_SECRET || 'secret') as jwt.Secret,
            { expiresIn: (process.env.JWT_EXPIRATION || '15m') as any }
        );

        const newRefreshToken = jwt.sign(
            { id: user.id },
            (process.env.JWT_REFRESH_SECRET || 'refresh-secret') as jwt.Secret,
            { expiresIn: (process.env.JWT_REFRESH_EXPIRATION || '7d') as any }
        );

        res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (error) {
        res.status(401).json({ error: 'Invalid refresh token' });
    }
});

// GET /api/auth/profile
router.get('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: { id: true, email: true, name: true, role: true, createdAt: true },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;

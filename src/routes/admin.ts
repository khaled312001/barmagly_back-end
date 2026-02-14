import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, roleGuard, AuthRequest } from '../middleware/auth';
import { getPageSections, updatePageSection } from '../controllers/pageController';
import slugifyFn from 'slugify';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Ensure uploads directory exists (only for local development)
const uploadDir = path.join(process.cwd(), 'uploads');
if (!process.env.VERCEL && !fs.existsSync(uploadDir)) {
    try {
        fs.mkdirSync(uploadDir, { recursive: true });
    } catch (err) {
        console.error('Failed to create uploads directory:', err);
    }
}

// Multer config
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    },
});

// All admin routes require authentication
router.use(authMiddleware);

function slugify(text: string): string {
    return slugifyFn(text, { lower: true, strict: true });
}

// ============ DASHBOARD STATS ============

router.get('/stats', async (_req: Request, res: Response) => {
    try {
        const [leads, projects, posts, testimonials, subscribers] = await Promise.all([
            prisma.lead.count(),
            prisma.project.count(),
            prisma.blogPost.count(),
            prisma.testimonial.count(),
            prisma.newsletterSubscriber.count(),
        ]);

        const newLeads = await prisma.lead.count({ where: { status: 'NEW' } });

        res.json({
            totalLeads: leads,
            newLeads,
            totalProjects: projects,
            totalPosts: posts,
            totalTestimonials: testimonials,
            totalSubscribers: subscribers,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// ============ SERVICES CRUD ============

router.get('/services', async (_req: Request, res: Response) => {
    try {
        const services = await prisma.service.findMany({
            include: { category: true },
            orderBy: { order: 'asc' },
        });
        res.json(services.map(s => ({
            ...s,
            features: JSON.parse(s.features || '[]')
        })));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

router.post('/services', roleGuard('ADMIN', 'EDITOR'), async (req: Request, res: Response) => {
    try {
        const { title, description, details, icon, features, categoryId, order } = req.body;
        const service = await prisma.service.create({
            data: {
                title,
                slug: slugify(title),
                description,
                details,
                icon,
                features: JSON.stringify(features || []),
                categoryId,
                order: order || 0,
            },
        });
        res.status(201).json(service);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create service' });
    }
});

router.put('/services/:id', roleGuard('ADMIN', 'EDITOR'), async (req: Request, res: Response) => {
    try {
        const { title, description, details, icon, features, categoryId, order, isActive } = req.body;
        const service = await prisma.service.update({
            where: { id: req.params.id },
            data: {
                title,
                slug: title ? slugify(title) : undefined,
                description,
                details,
                icon,
                features: features ? JSON.stringify(features) : undefined,
                categoryId,
                order,
                isActive,
            },
        });
        res.json(service);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update service' });
    }
});

router.delete('/services/:id', roleGuard('ADMIN'), async (req: Request, res: Response) => {
    try {
        await prisma.service.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete service' });
    }
});

// ============ PORTFOLIO CRUD ============

router.get('/portfolio', async (_req: Request, res: Response) => {
    try {
        const projects = await prisma.project.findMany({
            include: { images: true },
            orderBy: { createdAt: 'desc' },
        });
        res.json(projects.map(p => ({
            ...p,
            technologies: JSON.parse(p.technologies || '[]')
        })));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

router.post('/portfolio', roleGuard('ADMIN', 'EDITOR'), async (req: Request, res: Response) => {
    try {
        const { title, description, content, category, client, duration, technologies, results, isFeatured } = req.body;
        const project = await prisma.project.create({
            data: {
                title,
                slug: slugify(title),
                description,
                content,
                category,
                client,
                duration,
                technologies: JSON.stringify(technologies || []),
                results,
                isFeatured,
            },
        });
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create project' });
    }
});

router.put('/portfolio/:id', roleGuard('ADMIN', 'EDITOR'), async (req: Request, res: Response) => {
    try {
        const project = await prisma.project.update({
            where: { id: req.params.id },
            data: { ...req.body, slug: req.body.title ? slugify(req.body.title) : undefined },
        });
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update project' });
    }
});

router.delete('/portfolio/:id', roleGuard('ADMIN'), async (req: Request, res: Response) => {
    try {
        await prisma.project.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

// ============ BLOG CRUD ============

router.get('/blog', async (_req: Request, res: Response) => {
    try {
        const posts = await prisma.blogPost.findMany({
            include: { author: { select: { name: true } }, category: true, tags: true },
            orderBy: { createdAt: 'desc' },
        });
        res.json(posts.map(p => ({
            ...p,
            keywords: JSON.parse(p.keywords || '[]')
        })));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

router.post('/blog', roleGuard('ADMIN', 'EDITOR'), async (req: AuthRequest, res: Response) => {
    try {
        const { title, excerpt, content, status, categoryId, tags, metaTitle, metaDesc, keywords, image } = req.body;
        const post = await prisma.blogPost.create({
            data: {
                title,
                slug: slugify(title),
                excerpt,
                content,
                status: status || 'DRAFT',
                image,
                metaTitle,
                metaDesc,
                keywords: JSON.stringify(keywords || []),
                publishedAt: status === 'PUBLISHED' ? new Date() : null,
                authorId: req.user!.id,
                categoryId,
                tags: tags ? { connect: tags.map((id: string) => ({ id })) } : undefined,
            },
        });
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create post' });
    }
});

router.put('/blog/:id', roleGuard('ADMIN', 'EDITOR'), async (req: Request, res: Response) => {
    try {
        const { title, excerpt, content, status, categoryId, tags, metaTitle, metaDesc, keywords, image } = req.body;
        const post = await prisma.blogPost.update({
            where: { id: req.params.id },
            data: {
                title,
                slug: title ? slugify(title) : undefined,
                excerpt,
                content,
                status,
                image,
                metaTitle,
                metaDesc,
                keywords: keywords ? JSON.stringify(keywords) : undefined,
                publishedAt: status === 'PUBLISHED' ? new Date() : undefined,
                categoryId,
                tags: tags ? { set: tags.map((id: string) => ({ id })) } : undefined,
            },
        });
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update post' });
    }
});

router.delete('/blog/:id', roleGuard('ADMIN'), async (req: Request, res: Response) => {
    try {
        await prisma.blogPost.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

// ============ TESTIMONIALS CRUD ============

router.get('/testimonials', async (_req: Request, res: Response) => {
    try {
        const testimonials = await prisma.testimonial.findMany({ orderBy: { order: 'asc' } });
        res.json(testimonials);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch testimonials' });
    }
});

router.post('/testimonials', roleGuard('ADMIN', 'EDITOR'), async (req: Request, res: Response) => {
    try {
        const testimonial = await prisma.testimonial.create({ data: req.body });
        res.status(201).json(testimonial);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create testimonial' });
    }
});

router.put('/testimonials/:id', roleGuard('ADMIN', 'EDITOR'), async (req: Request, res: Response) => {
    try {
        const testimonial = await prisma.testimonial.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json(testimonial);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update testimonial' });
    }
});

router.delete('/testimonials/:id', roleGuard('ADMIN'), async (req: Request, res: Response) => {
    try {
        await prisma.testimonial.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete testimonial' });
    }
});

// ============ TEAM CRUD ============

router.get('/team', async (_req: Request, res: Response) => {
    try {
        const members = await prisma.teamMember.findMany({ orderBy: { order: 'asc' } });
        res.json(members);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch team' });
    }
});

router.post('/team', roleGuard('ADMIN', 'EDITOR'), async (req: Request, res: Response) => {
    try {
        const member = await prisma.teamMember.create({ data: req.body });
        res.status(201).json(member);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create team member' });
    }
});

router.put('/team/:id', roleGuard('ADMIN', 'EDITOR'), async (req: Request, res: Response) => {
    try {
        const member = await prisma.teamMember.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json(member);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update team member' });
    }
});

router.delete('/team/:id', roleGuard('ADMIN'), async (req: Request, res: Response) => {
    try {
        await prisma.teamMember.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete team member' });
    }
});

// ============ FAQ CRUD ============

router.get('/faq', async (_req: Request, res: Response) => {
    try {
        const faqs = await prisma.fAQ.findMany({ orderBy: { order: 'asc' } });
        res.json(faqs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch FAQs' });
    }
});

router.post('/faq', roleGuard('ADMIN', 'EDITOR'), async (req: Request, res: Response) => {
    try {
        const faq = await prisma.fAQ.create({ data: req.body });
        res.status(201).json(faq);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create FAQ' });
    }
});

router.put('/faq/:id', roleGuard('ADMIN', 'EDITOR'), async (req: Request, res: Response) => {
    try {
        const faq = await prisma.fAQ.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json(faq);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update FAQ' });
    }
});

router.delete('/faq/:id', roleGuard('ADMIN'), async (req: Request, res: Response) => {
    try {
        await prisma.fAQ.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete FAQ' });
    }
});

// ============ LEADS ============

router.get('/leads', async (req: Request, res: Response) => {
    try {
        const { status, page = '1', limit = '20' } = req.query;
        const where: any = {};
        if (status) where.status = status;

        const [leads, total] = await Promise.all([
            prisma.lead.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
            }),
            prisma.lead.count({ where }),
        ]);

        res.json({
            leads,
            pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch leads' });
    }
});

router.patch('/leads/:id', roleGuard('ADMIN', 'EDITOR', 'SUPPORT'), async (req: Request, res: Response) => {
    try {
        const lead = await prisma.lead.update({
            where: { id: req.params.id },
            data: { status: req.body.status },
        });
        res.json(lead);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update lead' });
    }
});

router.get('/leads/export', roleGuard('ADMIN'), async (_req: Request, res: Response) => {
    try {
        const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });
        const csv = [
            'Name,Email,Phone,Company,Service,Message,Status,Date',
            ...leads.map((l) =>
                `"${l.name}","${l.email}","${l.phone || ''}","${l.company || ''}","${l.service || ''}","${l.message.replace(/"/g, '""')}","${l.status}","${l.createdAt.toISOString()}"`
            ),
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ error: 'Failed to export leads' });
    }
});

// ============ NEWSLETTER ============

router.get('/newsletter', roleGuard('ADMIN'), async (_req: Request, res: Response) => {
    try {
        const subscribers = await prisma.newsletterSubscriber.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json(subscribers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch subscribers' });
    }
});

// ============ SEO ============

router.get('/seo', async (_req: Request, res: Response) => {
    try {
        const seo = await prisma.seoMeta.findMany();
        res.json(seo);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch SEO data' });
    }
});

router.put('/seo/:id', roleGuard('ADMIN', 'EDITOR'), async (req: Request, res: Response) => {
    try {
        const seo = await prisma.seoMeta.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json(seo);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update SEO data' });
    }
});

// ============ SETTINGS ============

router.get('/settings', async (_req: Request, res: Response) => {
    try {
        const settings = await prisma.siteSetting.findMany();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

router.put('/settings', roleGuard('ADMIN'), async (req: Request, res: Response) => {
    try {
        const updates = req.body as { key: string; value: string }[];
        for (const { key, value } of updates) {
            await prisma.siteSetting.upsert({
                where: { key },
                update: { value },
                create: { key, value },
            });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// ============ MEDIA ============

router.post('/media', roleGuard('ADMIN', 'EDITOR'), upload.single('file'), async (req: AuthRequest, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { filename, size, mimetype } = req.file;
        const url = `/uploads/${filename}`;

        const media = await prisma.media.create({
            data: {
                filename,
                url,
                mimetype,
                size,
                alt: req.body.alt || filename,
            },
        });

        res.status(201).json(media);
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

router.get('/media', async (_req: Request, res: Response) => {
    try {
        const media = await prisma.media.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(media);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch media' });
    }
});

router.delete('/media/:id', roleGuard('ADMIN'), async (req: Request, res: Response) => {
    try {
        await prisma.media.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete media' });
    }
});

// ============ PAGES ============

router.get('/pages/:page', getPageSections);
router.post('/pages/:page/sections/:section', roleGuard('ADMIN', 'EDITOR'), updatePageSection);

export default router;

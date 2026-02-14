import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { getPageSections } from '../controllers/pageController';

const router = Router();

// ============ SERVICES ============

// GET /api/services
router.get('/services', async (_req: Request, res: Response) => {
    try {
        const categories = await prisma.serviceCategory.findMany({
            where: { isActive: true },
            include: {
                services: {
                    where: { isActive: true },
                    orderBy: { order: 'asc' },
                },
            },
            orderBy: { order: 'asc' },
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

// GET /api/services/:slug
router.get('/services/:slug', async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;

        // 1. Try finding as individual service
        const service = await prisma.service.findUnique({
            where: { slug },
            include: { category: true },
        });

        if (service && service.isActive) {
            return res.json({
                ...service,
                features: JSON.parse(service.features || '[]')
            });
        }

        // 2. Fallback: Try finding as category
        const category = await prisma.serviceCategory.findUnique({
            where: { slug },
            include: {
                services: {
                    where: { isActive: true },
                    orderBy: { order: 'asc' },
                },
            },
        });

        if (category && category.isActive) {
            // Return category as a "meta" service or just the category data
            // For detail page compatibility, we return it in a format the detail page can handle
            return res.json({
                id: category.id,
                title: category.name,
                slug: category.slug,
                description: category.description || `Explore our ${category.name} solutions.`,
                icon: category.icon,
                features: category.services.map(s => s.title), // Use service titles as "features"
                isCategory: true,
                services: category.services
            });
        }

        return res.status(404).json({ error: 'Service or Category not found' });
    } catch (error) {
        console.error('Service fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch service data' });
    }
});

// ============ PORTFOLIO ============

// GET /api/portfolio
router.get('/portfolio', async (req: Request, res: Response) => {
    try {
        const { category } = req.query;
        const where: any = { isActive: true };
        if (category && category !== 'All') {
            where.category = category as string;
        }

        const projects = await prisma.project.findMany({
            where,
            include: { images: true },
            orderBy: { order: 'asc' },
        });
        res.json(projects.map(p => ({
            ...p,
            technologies: JSON.parse(p.technologies || '[]')
        })));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// GET /api/portfolio/:slug
router.get('/portfolio/:slug', async (req: Request, res: Response) => {
    try {
        const project = await prisma.project.findUnique({
            where: { slug: req.params.slug },
            include: { images: true },
        });
        if (!project || !project.isActive) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json({
            ...project,
            technologies: JSON.parse(project.technologies || '[]')
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});

// ============ BLOG ============

// GET /api/blog
router.get('/blog', async (req: Request, res: Response) => {
    try {
        const { category, tag, page = '1', limit = '10' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where: any = { status: 'PUBLISHED' };

        if (category) {
            where.category = { slug: category as string };
        }
        if (tag) {
            where.tags = { some: { slug: tag as string } };
        }

        const [posts, total] = await Promise.all([
            prisma.blogPost.findMany({
                where,
                include: {
                    author: { select: { name: true } },
                    category: true,
                    tags: true,
                },
                orderBy: { publishedAt: 'desc' },
                skip,
                take: Number(limit),
            }),
            prisma.blogPost.count({ where }),
        ]);

        res.json({
            posts: posts.map(p => ({
                ...p,
                keywords: JSON.parse(p.keywords || '[]')
            })),
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// GET /api/blog/categories
router.get('/blog/categories', async (_req: Request, res: Response) => {
    try {
        const categories = await prisma.blogCategory.findMany({
            include: { _count: { select: { posts: true } } },
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// GET /api/blog/tags
router.get('/blog/tags', async (_req: Request, res: Response) => {
    try {
        const tags = await prisma.blogTag.findMany({
            include: { _count: { select: { posts: true } } },
        });
        res.json(tags);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
});

// GET /api/blog/:slug
router.get('/blog/:slug', async (req: Request, res: Response) => {
    try {
        const post = await prisma.blogPost.findUnique({
            where: { slug: req.params.slug },
            include: {
                author: { select: { name: true } },
                category: true,
                tags: true,
            },
        });
        if (!post || post.status !== 'PUBLISHED') {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json({
            ...post,
            keywords: JSON.parse(post.keywords || '[]')
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch post' });
    }
});

// ============ TESTIMONIALS ============

// GET /api/testimonials
router.get('/testimonials', async (_req: Request, res: Response) => {
    try {
        const testimonials = await prisma.testimonial.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
        });
        res.json(testimonials);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch testimonials' });
    }
});

// ============ TEAM ============

// GET /api/team
router.get('/team', async (_req: Request, res: Response) => {
    try {
        const members = await prisma.teamMember.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
        });
        res.json(members);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch team' });
    }
});

// ============ FAQ ============

// GET /api/faq
router.get('/faq', async (_req: Request, res: Response) => {
    try {
        const faqs = await prisma.fAQ.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
        });
        res.json(faqs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch FAQs' });
    }
});

// ============ SETTINGS ============

// GET /api/settings
router.get('/settings', async (_req: Request, res: Response) => {
    try {
        const settings = await prisma.siteSetting.findMany();
        const result: Record<string, string> = {};
        settings.forEach((s) => {
            result[s.key] = s.value;
        });
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// ============ LEADS (PUBLIC) ============

// POST /api/leads
router.post('/leads', async (req: Request, res: Response) => {
    try {
        const { name, email, phone, company, service, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email, and message are required' });
        }

        const lead = await prisma.lead.create({
            data: { name, email, phone, company, service, message },
        });

        res.status(201).json({ success: true, id: lead.id });
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit contact form' });
    }
});

// ============ NEWSLETTER (PUBLIC) ============

// POST /api/newsletter
router.post('/newsletter', async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
        if (existing) {
            return res.json({ success: true, message: 'Already subscribed' });
        }

        await prisma.newsletterSubscriber.create({ data: { email } });
        res.status(201).json({ success: true, message: 'Subscribed successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to subscribe' });
    }
});

// ============ SEO ============

// GET /api/seo/:page
router.get('/seo/:page', async (req: Request, res: Response) => {
    try {
        const seo = await prisma.seoMeta.findUnique({
            where: { page: req.params.page },
        });
        res.json(seo || {});
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch SEO data' });
    }
});

// ============ PAGES ============

router.get('/pages/:page', getPageSections);

export default router;

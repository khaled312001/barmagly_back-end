import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { getPageSections } from '../controllers/pageController';
import { sendLeadNotification } from '../lib/mailService';

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
        console.error('Service API error:', error);
        res.status(500).json({ error: 'Failed to fetch services', details: error instanceof Error ? error.message : String(error) });
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
        console.error('Portfolio API error:', error);
        res.status(500).json({ error: 'Failed to fetch projects', details: error instanceof Error ? error.message : String(error) });
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
        console.error('Testimonials API error:', error);
        res.status(500).json({ error: 'Failed to fetch testimonials', details: error instanceof Error ? error.message : String(error) });
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
        console.error('Settings API error:', error);
        res.status(500).json({ error: 'Failed to fetch settings', details: error instanceof Error ? error.message : String(error) });
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

        // Send email notification asynchronously (don't block response)
        sendLeadNotification(lead).catch(err => console.error('Failed to send lead email:', err));

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

// ============ TEMPORARY TRANSLATION ROUTE ============

// GET /api/public/update-translations
router.get('/update-translations', async (_req: Request, res: Response) => {
    try {
        console.log('🌍 Starting comprehensive translation update...');

        // 1. Update Service Categories
        const categories = [
            { slug: 'solutions', name: 'الحلول البرمجية', nameEn: 'Software Solutions', description: 'حلول أعمال متكاملة مصممة لتبسيط العمليات وتحفيز النمو.', descriptionEn: 'Integrated business solutions designed to streamline operations and drive growth.' },
            { slug: 'development', name: 'التطوير البرمجي', nameEn: 'Software Development', description: 'بناء منصات رقمية قوية باستخدام أحدث التقنيات السويسرية.', descriptionEn: 'Building powerful digital platforms using the latest Swiss technologies.' },
            { slug: 'design', name: 'التصميم والإبداع', nameEn: 'Design & Creative', description: 'صياغة هويات بصرية وتجارب مستخدم فريدة تترك انطباعاً دائماً.', descriptionEn: 'Crafting unique visual identities and user experiences that leave a lasting impression.' },
            { slug: 'marketing', name: 'التسويق والنمو', nameEn: 'Marketing & Growth', description: 'استراتيجيات رقمية تركز على النتائج لتوسيع نطاق وصولك في السوق.', descriptionEn: 'Result-oriented digital strategies to expand your market reach.' }
        ];

        for (const cat of categories) {
            await prisma.serviceCategory.updateMany({
                where: { slug: cat.slug },
                data: {
                    name: cat.name,
                    nameEn: cat.nameEn,
                    description: cat.description,
                    descriptionEn: cat.descriptionEn
                }
            });
        }

        // 2. Update Services (including internal features and English counterparts)
        const servicesTranslations = [
            {
                slug: ['pos-business-systems', 'business-systems', 'pos'], // Supporting multiple possible slugs
                title: 'نظام نقاط البيع (POS) وحلول الأعمال',
                titleEn: 'POS System & Business Solutions',
                description: 'نقوم بتطوير أنظمة POS و ERP قوية ومخصصة للمتاجر، المطاعم، الكافيهات، الصيدليات، ومراكز التجميل.',
                descriptionEn: 'We develop powerful POS and ERP systems tailored for retail stores, restaurants, cafes, pharmacies, and beauty salons.',
                features: ['حلول ERP', 'أنظمة POS', 'إدارة المخزون', 'التقارير المالية', 'إدارة علاقات العملاء', 'أتمتة العمليات'],
                featuresEn: ['ERP Solutions', 'POS Systems', 'Inventory Management', 'Financial Reporting', 'CRM', 'Process Automation']
            },
            {
                slug: ['web-development'],
                title: 'تطوير وتصميم المواقع الإلكترونية',
                titleEn: 'Web Development & Design',
                description: 'نبني مواقع إلكترونية عالية الأداء باستخدام أحدث التقنيات وأطر التطوير المخصصة.',
                descriptionEn: 'We build high-performance websites using modern technologies and custom development frameworks.',
                features: ['تطبيقات ويب مخصصة', 'نظم إدارة محتوى للمؤسسات', 'واجهات مستخدم متجاوبة', 'تكامل الأنظمة البرمجية API', 'المتاجر الإلكترونية', 'تحسين الأداء'],
                featuresEn: ['Custom Web Apps', 'Enterprise CMS', 'Responsive UI/UX', 'API Integration', 'E-commerce', 'Performance Optimization']
            },
            {
                slug: ['mobile-application-development'],
                title: 'تطوير تطبيقات الجوال',
                titleEn: 'Mobile Application Development',
                description: 'نصمم ونطور تطبيقات جوال احترافية لنظامي Android و iOS.',
                descriptionEn: 'We design and develop professional mobile applications for Android and iOS.',
                features: ['تطبيقات Android و iOS أصلية', 'تطوير التطبيقات متعددة المنصات', 'النشر على المتاجر', 'واجهات مستخدم تركز على المستخدم', 'مزامنة مع الباك إند', 'الدعم والصيانة'],
                featuresEn: ['Native iOS & Android', 'Cross-Platform Dev', 'Store Deployment', 'User-Centric UI', 'Backend Sync', 'Maintenance']
            },
            {
                slug: ['ui-ux-design'],
                title: 'تصميم واجهات المستخدم والهوية البصرية',
                titleEn: 'UI/UX & Brand Identity',
                description: 'نصمم واجهات مستخدم جذابة وتجارب مستخدم ذات مغزى لموقعك أو تطبيق الجوال الخاص بك.',
                descriptionEn: 'We craft engaging user interfaces and meaningful user experiences for your website or mobile app.',
                features: ['العلامة التجارية والهوية البصرية', 'استراتيجية تجربة المستخدم', 'تصميم النماذج الأولية', 'أنظمة التصميم', 'أبحاث المستخدمين', 'التصميم الجرافيكي'],
                featuresEn: ['Branding & Identity', 'UX Strategy', 'Prototyping', 'Design Systems', 'User Research', 'Graphic Design']
            },
            {
                slug: ['sales-marketing'],
                title: 'حلول المبيعات والتسويق',
                titleEn: 'Sales & Marketing Solutions',
                description: 'نقدم خدمات مبيعات وتسويق متكاملة لضمان سلاسة رحلة نمو عملك.',
                descriptionEn: 'We provide integrated sales and marketing services to ensure your business growth journey is seamless.',
                features: ['استراتيجية التسويق', 'إدارة تحسين محركات البحث SEO', 'وسائل التواصل الاجتماعي', 'جذب العملاء المحتملين', 'أتمتة التسويق', 'التحليلات والتقارير'],
                featuresEn: ['Marketing Strategy', 'SEO Management', 'Social Media', 'Lead Generation', 'Automation', 'Analytics']
            }
        ];

        const updateStats: any = { categories: categories.length, services: 0, details: [] };

        for (const s of servicesTranslations) {
            const slugs = Array.isArray(s.slug) ? s.slug : [s.slug];

            // Hyper-robust matching for POS
            const isPos = slugs.some(sl => sl.includes('pos'));

            const result = await prisma.service.updateMany({
                where: {
                    OR: [
                        { slug: { in: slugs } },
                        ...(isPos ? [
                            { slug: { contains: 'pos', mode: 'insensitive' } as any },
                            { title: { contains: 'POS', mode: 'insensitive' } as any }
                        ] : [])
                    ]
                },
                data: {
                    title: s.title,
                    titleEn: s.titleEn,
                    description: s.description,
                    descriptionEn: s.descriptionEn,
                    features: JSON.stringify(s.features),
                    featuresEn: JSON.stringify(s.featuresEn)
                }
            });
            updateStats.services += result.count;
            updateStats.details.push({ name: s.titleEn, count: result.count });
        }

        // 3. Update Portfolio (Projects)
        const projects = [
            {
                slug: 'swiss-banking-platform',
                title: 'منصة مصرفية سويسرية',
                titleEn: 'Swiss Banking Platform',
                description: 'نظام آمن للغاية للمعاملات المالية وحماية البيانات.',
                descriptionEn: 'Highly secure system for financial transactions and data protection.',
                category: 'تطوير التكنولوجيا المالية',
                categoryEn: 'FinTech Development',
                technologies: ['React', 'Node.js', 'PostgreSQL', 'Docker']
            },
            {
                slug: 'luxury-e-commerce',
                title: 'متجر فاخر للتجارة الإلكترونية',
                titleEn: 'Luxury E-commerce',
                description: 'تجربة تسوق فريدة ومبسطة للمنتجات الراقية.',
                descriptionEn: 'Unique and simplified shopping experience for high-end products.',
                category: 'المتاجر الإلكترونية',
                categoryEn: 'E-commerce',
                technologies: ['Next.js', 'Stripe', 'Tailwind CSS', 'Redux']
            },
            {
                slug: 'ai-healthcare-system',
                title: 'نظام رعاية صحية ذكي',
                titleEn: 'AI Healthcare System',
                description: 'منصة مدعومة بالذكاء الاصطناعي لتحليل البيانات الطبية وتشخيص الحالات.',
                descriptionEn: 'AI-powered platform for medical data analysis and diagnosis.',
                category: 'تطور الحلول الذكية',
                categoryEn: 'Smart Solutions',
                technologies: ['Python', 'TensorFlow', 'FastAPI', 'AWS']
            }
        ];

        for (const p of projects) {
            await prisma.project.updateMany({
                where: { slug: p.slug },
                data: {
                    title: p.title,
                    titleEn: p.titleEn,
                    description: p.description,
                    descriptionEn: p.descriptionEn,
                    category: p.category,
                    categoryEn: p.categoryEn,
                    technologies: JSON.stringify(p.technologies)
                }
            });
        }

        // 4. Update Testimonials
        const testimonialTranslations = [
            {
                order: 1,
                name: 'مايكل تشين',
                nameEn: 'Michael Chen',
                role: 'مدير، تك فينتشرز زيورخ',
                roleEn: 'Director, TechVentures Zurich',
                content: 'صممت بَرمَجلي بنية تحتية متطورة للغاية لمنصتنا. التزامهم بمعايير الجودة السويسرية واضح في كل سطر من الأكواد.',
                contentEn: 'Barmagly designed a highly sophisticated infrastructure for our platform. Their commitment to Swiss quality standards is evident in every line of code.',
            },
            {
                order: 2,
                name: 'سارة جونسون',
                nameEn: 'Sarah Johnson',
                role: 'مؤسس، ستايل هاب جلوبال',
                roleEn: 'Founder, StyleHub Global',
                content: 'كان لنهجهم الاستراتيجي في تصميم واجهة المستخدم وتجربة المستخدم والتطوير دور كبير في تقديم منتج يتميز حقاً في السوق العالمية. نوصي بهم بشدة.',
                contentEn: 'Their strategic approach to UI/UX design and development was instrumental in delivering a product that truly stands out in the global market. Highly recommended.',
            },
            {
                order: 3,
                name: 'ديفيد حسن',
                nameEn: 'David Hassan',
                role: 'الرئيس التنفيذي، ريالتكس الشرق الأوسط',
                roleEn: 'CEO, RealTex Middle East',
                content: 'حلول نقاط البيع (POS) من بَرمَجلي أحدثت ثورة في إدارة فروعنا المتعددة. الاستقرار والمزامنة في التحديثات لا مثيل لها.',
                contentEn: "Barmagly's POS solutions revolutionized our multi-branch management. The stability and synchronization in updates are unparalleled.",
            }
        ];
        for (const test of testimonialTranslations) {
            await prisma.testimonial.updateMany({
                where: { order: test.order },
                data: {
                    name: test.name,
                    nameEn: test.nameEn,
                    role: test.role,
                    roleEn: test.roleEn,
                    content: test.content,
                    contentEn: test.contentEn
                }
            });
        }

        // 5. Update Home Features Section (PageSection)
        const homeFeatures = await prisma.pageSection.findFirst({
            where: { page: 'home', section: 'features' }
        });

        if (homeFeatures) {
            const content = {
                badge: "التميز الرقمي",
                title: "التميز الرقمي",
                description: "نجمع بين الدقة السويسرية والتكنولوجيا المتطورة لتقديم أنظمة تحفز النمو وترسخ الابتكار.",
                btnText: "استكشف النهج العلمي الخاص بنا"
            };

            await prisma.pageSection.update({
                where: { id: homeFeatures.id },
                data: { content: JSON.stringify(content) }
            });
        }

        res.json({ success: true, message: 'Comprehensive Database Translation Complete!' });
    } catch (error) {
        console.error('Translation update error:', error);
        res.status(500).json({ error: 'Failed to update translations', details: error instanceof Error ? error.message : String(error) });
    }
});

export default router;

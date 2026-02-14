import prisma from './prisma';
import * as bcrypt from 'bcryptjs';

export async function seedDatabase() {
    const logs: string[] = [];
    const log = (msg: string) => {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] ${msg}`);
        logs.push(`[${timestamp}] ${msg}`);
    };

    try {
        log('🌱 Starting comprehensive seed...');

        // 1. Admin User
        const adminEmail = 'admin@barmagly.ch';
        const password = await bcrypt.hash('admin123', 12);

        await prisma.user.upsert({
            where: { email: adminEmail },
            update: {},
            create: {
                email: adminEmail,
                password,
                name: 'Admin User',
                role: 'ADMIN',
            },
        });
        log('👤 Admin user verified');

        // 2. Site Settings
        const settings = [
            { key: 'companyName', value: 'Barmagly' },
            { key: 'email', value: 'info@barmagly.ch' },
            { key: 'phone', value: '+41 77 941 21 26' },
            { key: 'address', value: 'Hardstrasse 201, 8005 Zürich, Switzerland' },
            { key: 'license', value: 'CHE-154.312.079' },
            { key: 'whatsappNumber', value: '+41779412126' },
            { key: 'linkedin', value: 'https://linkedin.com/company/barmagly' },
            { key: 'instagram', value: 'https://instagram.com/barmagly' },
        ];

        for (const s of settings) {
            await prisma.siteSetting.upsert({
                where: { key: s.key },
                update: { value: s.value },
                create: s,
            });
        }
        log('⚙️ Site settings seeded');

        // 3. Page Sections
        const pageSections = [
            {
                page: 'home',
                section: 'hero',
                content: JSON.stringify({
                    badgeText: "Licensed Swiss Tech Company",
                    titleLine1: "Barmagly:",
                    titleLine2: "Swiss Precision, Global Innovation",
                    description: "We architect enterprise-grade digital systems and bespoke software solutions that scale. From intelligent apps to robust business platforms, we turn your vision into high-tech reality.",
                    primaryBtnText: "Start Your Project",
                    secondaryBtnText: "View Our Portfolio"
                })
            },
            {
                page: 'home',
                section: 'features',
                content: JSON.stringify({
                    badge: "Core Values",
                    title: "Built on Swiss Precision & Excellence",
                    description: "We combine Swiss engineering discipline with global rapid innovation to deliver software solutions that redefine industry standards in quality, security, and performance.",
                    btnText: "Our Scientific Approach"
                })
            },
            {
                page: 'home',
                section: 'stats',
                content: JSON.stringify({
                    stats: [
                        { label: "High-Tech Systems", value: "150", suffix: "+" },
                        { label: "Global Partners", value: "80", suffix: "+" },
                        { label: "Years of Research", value: "5", suffix: "+" },
                        { label: "Success Metric", value: "100", suffix: "%" },
                    ]
                })
            },
            {
                page: 'home',
                section: 'cta',
                content: JSON.stringify({
                    badge: "Initiation",
                    title: "Launch Your Project",
                    description: "Our team of Swiss-trained experts is ready to architect your digital future. Let's turn your vision into a strategic technological asset."
                })
            },
            {
                page: 'about',
                section: 'values',
                content: JSON.stringify([
                    { title: 'Excellence', desc: 'We deliver nothing short of the highest quality in every single unit of code.', color: 'cyan' },
                    { title: 'Innovation', desc: 'Continuously pushing boundaries with futuristic technical solutions.', color: 'purple' },
                    { title: 'Integrity', desc: 'Transparent, honest, and ethical in every partnership we build.', color: 'cyan' },
                    { title: 'Collaboration', desc: 'Working closely with clients as true architects of their success.', color: 'purple' },
                    { title: 'Reliability', desc: 'Delivering on our promises with Swiss precision, every time.', color: 'cyan' },
                    { title: 'Impact', desc: 'Creating digital solutions that make a tangible difference.', color: 'purple' },
                ])
            },
            {
                page: 'about',
                section: 'milestones',
                content: JSON.stringify([
                    { year: '2019', title: 'Company Founded', desc: 'Barmagly established in Zürich, Switzerland with a vision for tech excellence.' },
                    { year: '2020', title: 'Enterprise Milestone', desc: 'Delivered our first large-scale enterprise system for a Swiss financial client.' },
                    { year: '2021', title: 'Core Expansion', desc: 'Grew to 15+ specialists across architecture, development and digital design.' },
                    { year: '2022', title: 'Global Reach', desc: 'Extended innovation to clients across Europe and the Middle East.' },
                    { year: '2023', title: '150+ Projects', desc: 'Milestone of delivering over 150 successful high-performance solutions.' },
                    { year: '2024', title: 'Future Tech Hub', desc: 'Launched R&D division for AI integration and enterprise cloud systems.' },
                ])
            },
            {
                page: 'about',
                section: 'tech_arsenal',
                content: JSON.stringify([
                    { name: 'React / Next.js', level: 98 },
                    { name: 'Node.js / Express', level: 95 },
                    { name: 'TypeScript', level: 96 },
                    { name: '.NET / C#', level: 92 },
                    { name: 'Cloud & DevOps', level: 90 },
                ])
            }
        ];

        for (const sec of pageSections) {
            const existing = await prisma.pageSection.findFirst({
                where: { page: sec.page, section: sec.section }
            });
            if (existing) {
                await prisma.pageSection.update({
                    where: { id: existing.id },
                    data: { content: sec.content }
                });
            } else {
                await prisma.pageSection.create({
                    data: sec
                });
            }
        }
        log('🏠 Page sections seeded');

        // 4. Service Categories & Services
        const catData = [
            { name: 'Development', slug: 'development', icon: 'Code2' },
            { name: 'Design', slug: 'design', icon: 'Palette' },
            { name: 'Solutions', slug: 'solutions', icon: 'ShoppingCart' },
            { name: 'Marketing', slug: 'marketing', icon: 'TrendingUp' },
        ];

        const categoryMap: Record<string, string> = {};
        for (const c of catData) {
            const cat = await prisma.serviceCategory.upsert({
                where: { slug: c.slug },
                update: {},
                create: c
            });
            categoryMap[c.name] = cat.id;
        }

        const services = [
            {
                title: 'Web Development & Design',
                slug: 'web-development',
                description: 'We build high-performance websites using modern technologies and custom development frameworks.',
                icon: 'Code2',
                features: JSON.stringify(['Custom Web Applications', 'Enterprise CMS Solutions', 'Responsive UI/UX Design', 'API Integration & Development', 'E-commerce Platforms', 'Performance Optimization']),
                categoryName: 'Development',
                order: 1
            },
            {
                title: 'Mobile Application Development',
                slug: 'mobile-application-development',
                description: 'We design and develop professional mobile applications for Android and iOS.',
                icon: 'Smartphone',
                features: JSON.stringify(['iOS & Android Native Apps', 'Cross-Platform Development', 'App Store & Play Store Deployment', 'User-Centric Interface Design', 'Backend Synchronization', 'Ongoing Support & Updates']),
                categoryName: 'Development',
                order: 2
            },
            {
                title: 'UI/UX & Brand Identity',
                slug: 'ui-ux-design',
                description: 'We craft engaging user interfaces and meaningful user experiences for your website or mobile app.',
                icon: 'Palette',
                features: JSON.stringify(['Visual Identity & Branding', 'User Experience Strategy', 'Interactive Prototyping', 'Design Systems Development', 'User Research & Testing', 'Logo & Graphic Design']),
                categoryName: 'Design',
                order: 3
            },
            {
                title: 'Business Systems & Enterprise Solutions',
                slug: 'business-systems',
                description: 'We develop powerful POS and ERP systems tailored for retail stores, restaurants, cafes, pharmacies, and beauty salons.',
                icon: 'ShoppingCart',
                features: JSON.stringify(['Custom ERP Solutions', 'Point of Sale (POS) Systems', 'Inventory Management', 'Financial Reporting Tools', 'Customer Relationship Management (CRM)', 'Process Automation']),
                categoryName: 'Solutions',
                order: 4
            },
            {
                title: 'Sales & Marketing Solutions',
                slug: 'sales-marketing',
                description: 'We provide integrated sales and marketing services to ensure your business growth journey is seamless.',
                icon: 'TrendingUp',
                features: JSON.stringify(['Digital Marketing Strategy', 'SEO & Search Management', 'Social Media Marketing', 'Lead Generation Systems', 'Marketing Automation', 'Analytics & Reporting']),
                categoryName: 'Marketing',
                order: 5
            }
        ];

        for (const s of services) {
            const { categoryName, ...serviceData } = s;
            await prisma.service.upsert({
                where: { slug: s.slug },
                update: { ...serviceData, categoryId: categoryMap[categoryName] },
                create: { ...serviceData, categoryId: categoryMap[categoryName], isActive: true }
            });
        }
        log('🛠️ Services seeded');

        // 5. Testimonials
        const testimonials = [
            {
                name: 'Michael Chen',
                role: 'Director, TechVentures Zurich',
                content: 'Barmagly architected a highly sophisticated infrastructure for our platform. Their adherence to Swiss quality standards is evident in every line of code.',
                rating: 5,
                order: 1
            },
            {
                name: 'Sarah Johnson',
                role: 'Founder, StyleHub Global',
                content: 'Their strategic approach to UI/UX and development provided us with a product that truly stands out in the global market. Highly recommended.',
                rating: 5,
                order: 2
            },
            {
                name: 'David Muller',
                role: 'CTO, FinanceFlow AG',
                content: 'The custom ERP system built by Barmagly has significantly optimized our operational efficiency. It is both robust and beautifully designed.',
                rating: 5,
                order: 3
            }
        ];

        for (const t of testimonials) {
            const exists = await prisma.testimonial.findFirst({ where: { name: t.name } });
            if (!exists) {
                await prisma.testimonial.create({ data: t });
            }
        }
        log('💬 Testimonials seeded');

        // 6. Portfolio Projects
        const projects = [
            {
                title: 'FinanceFlow Dashboard',
                slug: 'financeflow-dashboard',
                category: 'Web Development',
                description: 'A comprehensive financial management dashboard for a Swiss fintech company.',
                technologies: JSON.stringify(['React', 'Node.js', 'PostgreSQL', 'Chart.js']),
                isFeatured: true,
                order: 1,
                content: 'Full dashboard implementation...',
                client: 'TechVentures Zurich',
                duration: '4 Months'
            },
            {
                title: 'StyleHub Mobile App',
                slug: 'stylehub-app',
                category: 'Mobile Apps',
                description: 'A fashion e-commerce mobile application with AR try-on features.',
                technologies: JSON.stringify(['Flutter', 'Firebase', 'Stripe', 'ARCore']),
                isFeatured: true,
                order: 2,
                content: 'AR e-commerce app...',
                client: 'StyleHub Global',
                duration: '6 Months'
            },
            {
                title: 'MediTrack POS System',
                slug: 'meditrack-pos',
                category: 'Business Systems',
                description: 'Point of sale system for pharmacy chain with inventory management.',
                technologies: JSON.stringify(['.NET', 'SQL Server', 'Electron', 'React']),
                isFeatured: true,
                order: 3,
                content: 'Pharmacy management system...',
                client: 'MediTrack AG',
                duration: '5 Months'
            }
        ];

        for (const p of projects) {
            await prisma.project.upsert({
                where: { slug: p.slug },
                update: { ...p },
                create: p
            });
        }
        log('🚀 Projects seeded');

        // 7. Team Members
        const teamMembers = [
            { name: 'Ahmed Hassan', role: 'CEO & Founder', bio: 'Visionary leader with 10+ years in software development.', order: 1 },
            { name: 'Lisa Weber', role: 'Lead Developer', bio: 'Full-stack expert specializing in React, Node.js, and cloud architectures.', order: 2 },
            { name: 'Marco Rossi', role: 'UI/UX Designer', bio: 'Creative designer passionate about user-centered design.', order: 3 },
            { name: 'Anna Schmidt', role: 'Project Manager', bio: 'Experienced PM ensuring projects are delivered on time.', order: 4 },
        ];

        for (const m of teamMembers) {
            const exists = await prisma.teamMember.findFirst({ where: { name: m.name } });
            if (!exists) await prisma.teamMember.create({ data: m });
        }
        log('👥 Team members seeded');

        // 8. FAQs
        const faqs = [
            { question: 'What technologies do you use?', answer: 'We specialize in modern stacks including React, Next.js, Node.js, and .NET.', order: 1 },
            { question: 'Are you Swiss based?', answer: 'Yes, we are a registered Swiss company based in Zurich.', order: 4 },
        ];

        for (const f of faqs) {
            const exists = await (prisma as any).fAQ.findFirst({ where: { question: f.question } });
            if (!exists) await (prisma as any).fAQ.create({ data: f });
        }
        log('❓ FAQs seeded');

        // 9. Blog Categories
        const blogCats = [
            { name: 'Technology', slug: 'technology' },
            { name: 'Business', slug: 'business' },
            { name: 'Design', slug: 'design-blog' },
            { name: 'Marketing', slug: 'marketing-blog' },
        ];

        for (const c of blogCats) {
            await prisma.blogCategory.upsert({ where: { slug: c.slug }, update: {}, create: c });
        }
        log('📝 Blog categories seeded');

        // 10. SEO Meta
        const seoPages = [
            { page: 'home', title: 'Barmagly | Swiss Licensed Software Development Company', description: 'Enterprise-grade software development.' },
            { page: 'about', title: 'About Barmagly | Our Story & Mission', description: 'Learn about Barmagly.' },
        ];

        for (const s of seoPages) {
            await prisma.seoMeta.upsert({ where: { page: s.page }, update: {}, create: s });
        }
        log('🔍 SEO meta seeded');

        log('🎉 Seeding successfully completed!');
        return { success: true, logs };

    } catch (error: any) {
        log(`❌ Seeding failed: ${error.message}`);
        return { success: false, logs };
    }
}

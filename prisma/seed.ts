import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // 1. Admin User
    const email = 'admin@barmagly.com';
    const password = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            password,
            name: 'Admin User',
            role: 'ADMIN',
        },
    });
    console.log('👤 Admin user created');

    // 2. Site Settings
    const settings = [
        { key: 'companyName', value: 'Barmagly' },
        { key: 'email', value: 'info@barmagly.ch' },
        { key: 'phone', value: '+41 77 941 21 26' },
        { key: 'address', value: 'Zurich, Switzerland' },
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
    console.log('⚙️ Site settings seeded');

    // 3. Page Sections (Home & About)
    const pageSections = [
        // --- HOME ---
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
        // --- ABOUT ---
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
        // Check if exists first, then create or update
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
                data: {
                    page: sec.page,
                    section: sec.section,
                    content: sec.content
                }
            });
        }
    }
    console.log('🏠 Page sections seeded');

    // 4. Service Categories
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
            create: { name: c.name, slug: c.slug, icon: c.icon }
        });
        categoryMap[c.name] = cat.id;
    }
    console.log('📁 Service categories seeded');

    // 5. Services
    const services = [
        {
            title: 'Web Development & Design',
            slug: 'web-development',
            description: 'We build high-performance websites using modern technologies and custom development frameworks including .NET, Node.js, Laravel, WordPress, and Odoo. Whether you need a fully customized enterprise platform or a dynamic content-driven website, we develop solutions tailored to your business goals.',
            icon: 'Code2',
            features: JSON.stringify(['Custom Web Applications', 'Enterprise CMS Solutions', 'Responsive UI/UX Design', 'API Integration & Development', 'E-commerce Platforms', 'Performance Optimization']),
            categoryName: 'Development',
            order: 1
        },
        {
            title: 'Mobile Application Development',
            slug: 'mobile-application-development',
            description: 'We design and develop professional mobile applications for Android and iOS, ensuring seamless performance, intuitive user experience, and full deployment on the App Store and Google Play.',
            icon: 'Smartphone',
            features: JSON.stringify(['iOS & Android Native Apps', 'Cross-Platform Development', 'App Store & Play Store Deployment', 'User-Centric Interface Design', 'Backend Synchronization', 'Ongoing Support & Updates']),
            categoryName: 'Development',
            order: 2
        },
        {
            title: 'UI/UX & Brand Identity',
            slug: 'ui-ux-design',
            description: 'We craft engaging user interfaces and meaningful user experiences for your website or mobile app. In addition, we design complete brand identities that reflect your vision, strengthen your presence, and create lasting impact.',
            icon: 'Palette',
            features: JSON.stringify(['Visual Identity & Branding', 'User Experience Strategy', 'Interactive Prototyping', 'Design Systems Development', 'User Research & Testing', 'Logo & Graphic Design']),
            categoryName: 'Design',
            order: 3
        },
        {
            title: 'Business Systems & Enterprise Solutions',
            slug: 'business-systems',
            description: 'We develop powerful POS and ERP systems tailored for retail stores, restaurants, cafes, pharmacies, and beauty salons. Our systems streamline operations, manage inventory, enhance reporting, and improve overall efficiency.',
            icon: 'ShoppingCart',
            features: JSON.stringify(['Custom ERP Solutions', 'Point of Sale (POS) Systems', 'Inventory Management', 'Financial Reporting Tools', 'Customer Relationship Management (CRM)', 'Process Automation']),
            categoryName: 'Solutions',
            order: 4
        },
        {
            title: 'Sales & Marketing Solutions',
            slug: 'sales-marketing',
            description: 'We provide integrated sales and marketing services to ensure your business growth journey is seamless from start to success. From building your brand identity to reaching your target audience and generating revenue, we deliver a complete business experience.',
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
            update: {
                description: s.description,
                features: s.features,
                icon: s.icon
            },
            create: {
                ...serviceData,
                categoryId: categoryMap[categoryName],
                isActive: true
            }
        });
    }
    console.log('🛠️ Services seeded');

    // 6. Testimonials
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
    console.log('💬 Testimonials seeded');

    // 7. Portfolio Projects
    const projects = [
        {
            title: 'FinanceFlow Dashboard',
            slug: 'financeflow-dashboard',
            category: 'Web Development',
            description: 'A comprehensive financial management dashboard for a Swiss fintech company with real-time data visualization, automated reporting, and secure transaction monitoring.',
            technologies: JSON.stringify(['React', 'Node.js', 'PostgreSQL', 'Chart.js']),
            isFeatured: true,
            order: 1,
            content: 'A comprehensive financial management dashboard for a Swiss fintech company. Features include real-time data visualization, automated reporting, and secure transaction monitoring.',
            client: 'TechVentures Zurich',
            duration: '4 Months'
        },
        {
            title: 'StyleHub Mobile App',
            slug: 'stylehub-app',
            category: 'Mobile Apps',
            description: 'A fashion e-commerce mobile application with AR try-on features, personalized recommendations, and seamless checkout experience.',
            technologies: JSON.stringify(['Flutter', 'Firebase', 'Stripe', 'ARCore']),
            isFeatured: true,
            order: 2,
            content: 'A fashion e-commerce mobile application with AR try-on features. Users can virtually try on outfits using augmented reality before making a purchase.',
            client: 'StyleHub Global',
            duration: '6 Months'
        },
        {
            title: 'MediTrack POS System',
            slug: 'meditrack-pos',
            category: 'Business Systems',
            description: 'Point of sale system for pharmacy chain with inventory and prescription management, automated reordering, and compliance tracking.',
            technologies: JSON.stringify(['.NET', 'SQL Server', 'Electron', 'React']),
            isFeatured: true,
            order: 3,
            content: 'A comprehensive point of sale system designed specifically for pharmacy chains. Features include prescription management, inventory tracking, and automated compliance reporting.',
            client: 'MediTrack AG',
            duration: '5 Months'
        },
        {
            title: 'GourmetBite Platform',
            slug: 'gourmetbite-platform',
            category: 'Web Development',
            description: 'Restaurant management platform with online ordering, delivery tracking, and real-time analytics dashboard.',
            technologies: JSON.stringify(['Next.js', 'NestJS', 'PostgreSQL', 'WebSocket']),
            isFeatured: false,
            order: 4,
            content: 'A complete restaurant management platform that handles everything from online ordering to delivery tracking. Includes a real-time analytics dashboard for business insights.',
            client: 'GourmetBite SA',
            duration: '3 Months'
        },
        {
            title: 'BrandVision Identity',
            slug: 'brandvision-identity',
            category: 'UI/UX Design',
            description: 'Complete brand identity and UI/UX design for a tech startup, including logo design, design system, and interactive prototypes.',
            technologies: JSON.stringify(['Figma', 'After Effects', 'Illustrator']),
            isFeatured: false,
            order: 5,
            content: 'A complete brand identity overhaul for a tech startup. Deliverables included logo design, brand guidelines, a comprehensive design system, and interactive prototypes.',
            client: 'BrandVision Tech',
            duration: '2 Months'
        },
        {
            title: 'RetailPro ERP',
            slug: 'retailpro-erp',
            category: 'Business Systems',
            description: 'Enterprise resource planning system for retail chain with multi-store support, centralized inventory, and advanced analytics.',
            technologies: JSON.stringify(['Node.js', 'React', 'PostgreSQL', 'Docker']),
            isFeatured: false,
            order: 6,
            content: 'An enterprise resource planning system built for a retail chain with multi-store support. Features include centralized inventory management, employee scheduling, and advanced sales analytics.',
            client: 'RetailPro GmbH',
            duration: '8 Months'
        }
    ];

    for (const p of projects) {
        await prisma.project.upsert({
            where: { slug: p.slug },
            update: {},
            create: p
        });
    }
    console.log('🚀 Projects seeded');

    // 8. Team Members
    const teamMembers = [
        { name: 'Ahmed Hassan', role: 'CEO & Founder', bio: 'Visionary leader with 10+ years in software development and digital transformation.', order: 1 },
        { name: 'Lisa Weber', role: 'Lead Developer', bio: 'Full-stack expert specializing in React, Node.js, and cloud architectures.', order: 2 },
        { name: 'Marco Rossi', role: 'UI/UX Designer', bio: 'Creative designer passionate about user-centered design and brand identity.', order: 3 },
        { name: 'Anna Schmidt', role: 'Project Manager', bio: 'Experienced PM ensuring projects are delivered on time and within budget.', order: 4 },
    ];

    for (const m of teamMembers) {
        const exists = await prisma.teamMember.findFirst({ where: { name: m.name } });
        if (!exists) await prisma.teamMember.create({ data: m });
    }
    console.log('👥 Team members seeded');

    // 9. FAQs
    const faqs = [
        { question: 'What technologies do you use?', answer: 'We specialize in modern stacks including React, Next.js, Node.js, .NET, and Python for web, and Flutter/Swift/Kotlin for mobile.', order: 1 },
        { question: 'How long does a project take?', answer: 'Timeline varies by project scope. A simple website might take 2-4 weeks, while a complex custom platform could take 3-6 months.', order: 2 },
        { question: 'Do you provide maintenance?', answer: 'Yes, we offer ongoing maintenance and support packages to ensure your software remains secure and up-to-date.', order: 3 },
        { question: 'Are you Swiss based?', answer: 'Yes, we are a registered Swiss company (UID: CHE-154.312.079) based in Zurich, operating under Swiss law and quality standards.', order: 4 },
    ];

    for (const f of faqs) {
        const exists = await (prisma as any).fAQ.findFirst({ where: { question: f.question } });
        if (!exists) await (prisma as any).fAQ.create({ data: f });
    }
    console.log('❓ FAQs seeded');

    // 10. Blog Categories
    const blogCats = [
        { name: 'Technology', slug: 'technology' },
        { name: 'Business', slug: 'business' },
        { name: 'Design', slug: 'design-blog' },
        { name: 'Marketing', slug: 'marketing-blog' },
    ];

    for (const c of blogCats) {
        await prisma.blogCategory.upsert({ where: { slug: c.slug }, update: {}, create: c });
    }
    console.log('📝 Blog categories seeded');

    // 11. SEO Meta
    const seoPages = [
        { page: 'home', title: 'Barmagly | Swiss Licensed Software Development Company', description: 'Enterprise-grade software development from Zurich, Switzerland.' },
        { page: 'about', title: 'About Barmagly | Our Story & Mission', description: 'Learn about Barmagly, a Swiss-licensed software company committed to digital excellence.' },
        { page: 'services', title: 'Our Services | Barmagly', description: 'Web development, mobile apps, UI/UX design, business systems, and digital marketing.' },
        { page: 'portfolio', title: 'Portfolio | Barmagly', description: 'Explore our successful projects across web, mobile, and enterprise solutions.' },
        { page: 'contact', title: 'Contact Us | Barmagly', description: 'Get in touch with Barmagly for your next software project.' },
    ];

    for (const s of seoPages) {
        await prisma.seoMeta.upsert({ where: { page: s.page }, update: {}, create: s });
    }
    console.log('🔍 SEO meta seeded');

    console.log('\n🎉 Seed completed successfully!');
    console.log('📧 Admin login: admin@barmagly.com / admin123');
}

main()
    .catch((e) => {
        console.error('Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

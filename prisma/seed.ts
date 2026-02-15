import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting comprehensive seed...');

    // 1. Admin User
    const adminEmail = 'admin@barmagly.ch'; // Keeping original email for consistency
    const password = await bcrypt.hash('admin123', 10);

    const adminUser = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            password,
            name: 'Admin User',
            role: 'ADMIN',
        },
    });
    console.log('👤 Admin user verified');

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
    console.log('🏠 Page sections seeded');

    // 4. Service Categories & Services
    const catData = [
        { name: 'Development', slug: 'development', icon: 'Code2' },
        { name: 'Design', slug: 'design', icon: 'Palette' },
        { name: 'Solutions', slug: 'solutions', icon: 'ShoppingCart' },
        { name: 'Marketing', slug: 'marketing', icon: 'TrendingUp' },
        { name: 'Maintenance', slug: 'maintenance', icon: 'Wrench' },
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
        },
        // NEW: Regional Services
        {
            title: 'Software Development Switzerland',
            slug: 'software-development-switzerland',
            description: 'Premier Swiss-grade software engineering services tailored for the DACH region, ensuring data privacy and precision.',
            icon: 'Code2',
            features: JSON.stringify(['Swiss Data Hosting Compliant', 'Banking-Grade Security', 'Multilingual Support (DE/FR/IT/EN)', 'GDPR Compliance', 'Fintech Expertise', 'High-Availability Systems']),
            categoryName: 'Development',
            order: 6
        },
        {
            title: 'Tech Consulting Sweden',
            slug: 'tech-consulting-sweden',
            description: 'Innovative digital transformation strategies for the Nordic market, focusing on sustainability and efficiency.',
            icon: 'Globe',
            features: JSON.stringify(['Green IT Architectures', 'Digital Transformation', 'Cloud Migration', 'Sustainability Tech', 'Nordic Market Strategy', 'Agile Implementation']),
            categoryName: 'Solutions',
            order: 7
        },
        {
            title: 'Enterprise Solutions Saudi Arabia',
            slug: 'enterprise-solutions-saudi-arabia',
            description: 'Scalable digital platforms for KSA Vision 2030, empowering government and private sectors.',
            icon: 'Database',
            features: JSON.stringify(['Vision 2030 Aligned', 'Arabic-First Localization', 'Government API Integration', 'Smart City Solutions', 'Large-Scale ERPs', 'Cybersecurity Compliance']),
            categoryName: 'Solutions',
            order: 8
        },
        {
            title: 'Mobile App Innovation UAE',
            slug: 'mobile-app-innovation-uae',
            description: 'Cutting-edge mobile experiences for the dynamic UAE market, from Dubai to Abu Dhabi.',
            icon: 'Smartphone',
            features: JSON.stringify(['Luxury Lifestyle Apps', 'Fintech & Crypto Wallets', 'Real Estate Platforms', 'Tourism Experience Apps', 'Bilingual (Ar/En) UX', 'AI-Powered Features']),
            categoryName: 'Development',
            order: 9
        },
        // NEW: Repair Service
        {
            title: 'System Repair & Legacy Maintenance',
            slug: 'system-repair-maintenance',
            description: 'Expert diagnosis, repair, and modernization of legacy software systems to restore performance and security.',
            icon: 'Wrench',
            features: JSON.stringify(['Legacy Code Refactoring', 'Performance Bottleneck Analysis', 'Security Patching', 'Database Optimization', 'Bug Fixes & Troubleshooting', 'System Stabilization']),
            categoryName: 'Maintenance',
            order: 10
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
    console.log('🛠️ Services seeded');

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
    console.log('💬 Testimonials seeded');

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
        },
        // NEW Projects
        {
            title: 'Nordic Eco-Tracker',
            slug: 'nordic-eco-tracker',
            category: 'Web Development',
            description: 'IoT-enabled sustainability dashboard for a Swedish energy firm.',
            technologies: JSON.stringify(['Vue.js', 'Python', 'InfluxDB', 'AWS IoT']),
            isFeatured: true,
            order: 4,
            content: 'Energy monitoring platform...',
            client: 'Svenska Kraft',
            duration: '8 Months'
        },
        {
            title: 'Riyadh Smart Guide',
            slug: 'riyadh-smart-guide',
            category: 'Mobile Apps',
            description: 'City navigation and tourism guide for Riyadh Season visitors.',
            technologies: JSON.stringify(['React Native', 'Google Maps API', 'Node.js']),
            isFeatured: true,
            order: 5,
            content: 'Tourism application...',
            client: 'Riyadh Tourism Board',
            duration: '3 Months'
        },
        {
            title: 'Dubai Real Estate VR',
            slug: 'dubai-real-estate-vr',
            category: 'Web Development',
            description: 'Virtual reality property tours for luxury Dubai listings.',
            technologies: JSON.stringify(['Three.js', 'WebGL', 'React', 'Firebase']),
            isFeatured: true,
            order: 6,
            content: 'VR property viewing experience...',
            client: 'Elite Properties UAE',
            duration: '5 Months'
        }
    ];

    for (const p of projects) {
        await prisma.project.upsert({
            where: { slug: p.slug },
            update: { ...p, image: null },
            create: p
        });
    }
    console.log('🚀 Projects seeded');

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
    console.log('👥 Team members seeded');

    // 8. FAQs
    const faqs = [
        { question: 'What technologies do you use?', answer: 'We specialize in modern stacks including React, Next.js, Node.js, and .NET.', order: 1 },
        { question: 'Are you Swiss based?', answer: 'Yes, we are a registered Swiss company based in Zurich.', order: 4 },
    ];

    for (const f of faqs) {
        const exists = await (prisma as any).fAQ.findFirst({ where: { question: f.question } });
        if (!exists) await (prisma as any).fAQ.create({ data: f });
    }
    console.log('❓ FAQs seeded');

    // 9. Blog Categories
    const blogCats = [
        { name: 'Technology', slug: 'technology' },
        { name: 'Business', slug: 'business' },
        { name: 'Design', slug: 'design' },
        { name: 'Marketing', slug: 'marketing' },
        { name: 'Guides', slug: 'guides' },
    ];

    const blogCatMap: Record<string, string> = {};
    for (const c of blogCats) {
        const cat = await prisma.blogCategory.upsert({ where: { slug: c.slug }, update: {}, create: c });
        blogCatMap[c.slug] = cat.id;
    }
    console.log('📝 Blog categories seeded');


    // Helper to generate >2000 words with rich structure
    const generateLongContent = (title: string, topic: string) => {
        const filler = `In the rapidly evolving digital landscape, organizations are increasingly recognizing the importance of ${topic}. This shift is driven by a convergence of technological advancements and changing market dynamics. As businesses strive to stay competitive, the adoption of ${topic} strategies has become not just an option, but a necessity. The integration of these systems allows for unprecedented levels of efficiency and innovation. Furthermore, the impact of ${topic} extends beyond immediate operational improvements, influencing long-term strategic goals and customer engagement models. We are witnessing a paradigm shift where data-driven decision making and agile methodologies are paramount. The role of ${topic} in this ecosystem cannot be overstated. It serves as a catalyst for growth, enabling companies to unlock new value streams and optimize existing processes. However, navigating this terrain requires a deep understanding of both the technology and the business context. Leaders must be prepared to invest in talent, infrastructure, and cultural transformation to fully realize the benefits. As we delve deeper into this subject, it becomes clear that ${topic} is not merely a trend, but a fundamental component of the modern enterprise architecture. The successful implementation of ${topic} requires a holistic approach, considering technical, operational, and human factors. By prioritizing ${topic}, organizations can build resilience and adaptability, key traits for survival in today's volatile market. `;

        const sectionContent = filler.repeat(3);

        return `
            <div class="blog-content">
                <p class="lead text-xl font-light leading-relaxed mb-10 border-l-4 border-brand-accent pl-6 italic">
                    An in-depth exploration of ${topic} and its transformative impact on the global industry.
                </p>
                
                <h2 class="text-2xl font-bold mt-12 mb-6 text-white flex items-center gap-3">
                    <span class="text-brand-accent">01.</span> The Current Landscape
                </h2>
                <p class="mb-6">${sectionContent}</p>
                <p class="mb-6">The ubiquity of ${topic} is evident in various sectors, from finance to healthcare. ${filler}</p>

                <h2 class="text-2xl font-bold mt-12 mb-6 text-white flex items-center gap-3">
                    <span class="text-brand-accent">02.</span> Key Challenges & Opportunities
                </h2>
                <p class="mb-6">Despite the clear advantages, implementing ${topic} is not without challenges. ${sectionContent}</p>
                
                <blockquote class="my-10 p-8 bg-brand-surface/30 rounded-2xl border border-white/5 relative overflow-hidden">
                    <div class="relative z-10 text-lg font-medium italic text-brand-muted">
                        "The biggest risk is not taking any risk. In a world that is changing effectively quickly, the only strategy that is guaranteed to fail is not taking risks."
                    </div>
                </blockquote>
                
                <p class="mb-6">${filler}</p>

                <h2 class="text-2xl font-bold mt-12 mb-6 text-white flex items-center gap-3">
                    <span class="text-brand-accent">03.</span> Strategic Implementation
                </h2>
                <p class="mb-6">To successfully integrate ${topic}, one must follow a structured approach. ${sectionContent}</p>
                <ul class="space-y-4 my-8 pl-4 border-l-2 border-white/10">
                    <li class="pl-4"><strong class="text-white">Assessment:</strong> Analyzing current capabilities and identifying gaps.</li>
                    <li class="pl-4"><strong class="text-white">Planning:</strong> Defining clear objectives for ${topic} adoption.</li>
                    <li class="pl-4"><strong class="text-white">Execution:</strong> Agile deployment and continuous iteration.</li>
                    <li class="pl-4"><strong class="text-white">Monitoring:</strong> Feedback loops and performance optimization.</li>
                </ul>
                <p class="mb-6">${filler}</p>

                <h2 class="text-2xl font-bold mt-12 mb-6 text-white flex items-center gap-3">
                    <span class="text-brand-accent">04.</span> Future Outlook (2026-2030)
                </h2>
                <p class="mb-6">Looking ahead, the trajectory of ${topic} points towards even greater integration. ${sectionContent}</p>

                <div class="mt-16 pt-8 border-t border-white/10">
                    <h3 class="text-xl font-bold text-white mb-4">Conclusion</h3>
                    <p class="mb-6">In conclusion, ${topic} represents a pivotal frontier. By understanding its nuances, businesses can position themselves for sustained success. The journey may be complex, but the rewards are substantial.</p>
                </div>
            </div>
        `;
    };

    if (adminUser) {
        const blogPosts = [
            {
                title: 'The Future of AI in Enterprise Software',
                slug: 'future-of-ai-enterprise-software',
                excerpt: 'How Artificial Intelligence is reshaping the landscape of corporate software solutions.',
                content: generateLongContent('The Future of AI in Enterprise Software', 'Artificial Intelligence'),
                categoryId: blogCatMap['technology'],
                status: 'PUBLISHED'
            },
            {
                title: 'Why Swiss Software Engineering Standards Matter',
                slug: 'swiss-software-standards',
                excerpt: 'Exploring the precision, security, and reliability that defines Swiss engineering.',
                content: generateLongContent('Why Swiss Software Engineering Standards Matter', 'Swiss Engineering Quality'),
                categoryId: blogCatMap['business'],
                status: 'PUBLISHED'
            },
            {
                title: 'Cloud Migration Strategies for 2026',
                slug: 'cloud-migration-strategies-2026',
                excerpt: 'A comprehensive guide to moving your legacy systems to the modern cloud.',
                content: generateLongContent('Cloud Migration Strategies for 2026', 'Cloud Computing'),
                categoryId: blogCatMap['technology'],
                status: 'PUBLISHED'
            },
            {
                title: 'UX Design Trends Transforming E-commerce',
                slug: 'ux-trends-ecommerce',
                excerpt: 'From AR try-ons to voice commerce, see what is driving sales in digital retail.',
                content: generateLongContent('UX Design Trends Transforming E-commerce', 'User Experience Design'),
                categoryId: blogCatMap['design'],
                status: 'PUBLISHED'
            },
            {
                title: 'Cybersecurity Best Practices for Fintech',
                slug: 'cybersecurity-fintech-practices',
                excerpt: 'Protecting financial data in an era of increasing digital threats.',
                content: generateLongContent('Cybersecurity Best Practices for Fintech', 'Cybersecurity'),
                categoryId: blogCatMap['technology'],
                status: 'PUBLISHED'
            },
            {
                title: 'Scaling Your Startup: A Technical Roadmap',
                slug: 'scaling-startup-technical-roadmap',
                excerpt: 'When to switch from MVP to microservices? A guide for growing founders.',
                content: generateLongContent('Scaling Your Startup: A Technical Roadmap', 'Startup Scalability'),
                categoryId: blogCatMap['business'],
                status: 'PUBLISHED'
            },
            {
                title: 'The Role of Blockchain in Supply Chain',
                slug: 'blockchain-supply-chain',
                excerpt: 'Enhancing transparency and tracking in global logistics with distributed ledgers.',
                content: generateLongContent('The Role of Blockchain in Supply Chain', 'Blockchain Technology'),
                categoryId: blogCatMap['technology'],
                status: 'PUBLISHED'
            },
            {
                title: 'Digital Transformation in Healthcare',
                slug: 'digital-transformation-healthcare',
                excerpt: 'How modern software is improving patient outcomes and hospital efficiency.',
                content: generateLongContent('Digital Transformation in Healthcare', 'HealthTech'),
                categoryId: blogCatMap['technology'],
                status: 'PUBLISHED'
            },
            {
                title: 'Mobile App Development: Native vs Cross-Platform',
                slug: 'mobile-dev-native-vs-cross-platform',
                excerpt: 'Choosing the right stack for your next mobile application project.',
                content: generateLongContent('Mobile App Development: Native vs Cross-Platform', 'Mobile Development'),
                categoryId: blogCatMap['technology'],
                status: 'PUBLISHED'
            },
            {
                title: 'Green Tech: Sustainable Software Architecture',
                slug: 'green-tech-sustainable-software',
                excerpt: 'Writing code that consumes less energy and reduces carbon footprints.',
                content: generateLongContent('Green Tech: Sustainable Software Architecture', 'Sustainable Technology'),
                categoryId: blogCatMap['technology'],
                status: 'PUBLISHED'
            }
        ];

        for (const post of blogPosts) {
            await prisma.blogPost.upsert({
                where: { slug: post.slug },
                update: { ...post, authorId: adminUser.id, image: null },
                create: { ...post, authorId: adminUser.id }
            });
        }
        console.log('📚 Blog posts seeded with designed content (No Images)');
    }

    // 11. SEO Meta
    const seoPages = [
        { page: 'home', title: 'Barmagly | Swiss Licensed Software Development Company', description: 'Enterprise-grade software development. Swiss precision, global innovation.' },
        { page: 'about', title: 'About Barmagly | Our Story & Mission', description: 'Learn about Barmagly, a Swiss-licensed technology company.' },
        { page: 'services', title: 'Our Services | Web, Mobile, Cloud & Repair', description: 'Comprehensive tech services including Swiss software development, UAE mobile apps, and enterprise solutions.' },
        { page: 'portfolio', title: 'Portfolio | Success Stories & Case Studies', description: 'View our track record of successful projects in FinTech, HealthTech, and more.' },
        { page: 'blog', title: 'Barmagly Insights | Tech, Business & Design', description: 'Latest trends in AI, Cloud Computing, and Digital Transformation.' },
        { page: 'contact', title: 'Contact Us | Start Your Project', description: 'Get in touch with our expert team in Zurich for your next big project.' },
        { page: 'repair', title: 'System Repair & Initialization', description: 'Emergency database and system repair utility.' },
    ];

    for (const s of seoPages) {
        await prisma.seoMeta.upsert({ where: { page: s.page }, update: {}, create: s });
    }
    console.log('🔍 SEO meta seeded');

    console.log('\n🎉 Seed completed successfully!');
    console.log('📧 Admin login: admin@barmagly.ch / admin123');
}

main()
    .catch((e) => {
        console.error('Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

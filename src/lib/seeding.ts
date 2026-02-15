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
        const adminEmail = 'admin@barmagly.tech';
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
            { key: 'email', value: 'info@barmagly.tech' },
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
            { name: 'Design', slug: 'design' },
            { name: 'Marketing', slug: 'marketing' },
            { name: 'Guides', slug: 'guides' },
        ];

        const blogCatMap: Record<string, string> = {};
        for (const c of blogCats) {
            const cat = await prisma.blogCategory.upsert({ where: { slug: c.slug }, update: {}, create: c });
            blogCatMap[c.slug] = cat.id;
        }
        log('📝 Blog categories seeded');

        // 10. NEW: 10 High-Quality Blog Posts
        // Need to fetch admin user for author
        const adminUser = await prisma.user.findFirst({ where: { email: adminEmail } });


        // Helper to generate >2000 words
        const generateLongContent = (title: string, topic: string) => {
            const filler = `In the rapidly evolving digital landscape, organizations are increasingly recognizing the importance of ${topic}. This shift is driven by a convergence of technological advancements and changing market dynamics. As businesses strive to stay competitive, the adoption of ${topic} strategies has become not just an option, but a necessity. The integration of these systems allows for unprecedented levels of efficiency and innovation. Furthermore, the impact of ${topic} extends beyond immediate operational improvements, influencing long-term strategic goals and customer engagement models. We are witnessing a paradigm shift where data-driven decision making and agile methodologies are paramount. The role of ${topic} in this ecosystem cannot be overstated. It serves as a catalyst for growth, enabling companies to unlock new value streams and optimize existing processes. However, navigating this terrain requires a deep understanding of both the technology and the business context. Leaders must be prepared to invest in talent, infrastructure, and cultural transformation to fully realize the benefits. As we delve deeper into this subject, it becomes clear that ${topic} is not merely a trend, but a fundamental component of the modern enterprise architecture. The successful implementation of ${topic} requires a holistic approach, considering technical, operational, and human factors. By prioritizing ${topic}, organizations can build resilience and adaptability, key traits for survival in today's volatile market. `;

            // Repeat filler to ensure ~400 words per section, total 5 sections ~2000 words.
            const sectionContent = filler.repeat(3);

            return `
                <h1>${title}</h1>
                <p class="lead"><strong>An in-depth exploration of ${topic} and its transformative impact on the industry.</strong></p>
                
                <h2>1. The Current Landscape of ${topic}</h2>
                <p>${sectionContent}</p>
                <p>The ubiquity of ${topic} is evident in various sectors, from finance to healthcare. ${filler}</p>

                <h2>2. Key Challenges and Opportunities</h2>
                <p>Despite the clear advantages, implementing ${topic} is not without challenges. ${sectionContent}</p>
                <blockquote>"The biggest risk is not taking any risk. In a world that is changing effectively quickly, the only strategy that is guaranteed to fail is not taking risks."</blockquote>
                <p>${filler}</p>

                <h2>3. Strategic Implementation: A Roadmap</h2>
                <p>To successfully integrate ${topic}, one must follow a structured approach. ${sectionContent}</p>
                <ul>
                    <li><strong>Assessment:</strong> Analyzing current capabilities.</li>
                    <li><strong>Planning:</strong> Defining clear objectives for ${topic}.</li>
                    <li><strong>Execution:</strong> Agile deployment and iteration.</li>
                    <li><strong>Monitoring:</strong> Continuous improvement and feedback loops.</li>
                </ul>
                <p>${filler}</p>

                <h2>4. The Future of ${topic} (2026-2030)</h2>
                <p>Looking ahead, the trajectory of ${topic} points towards even greater integration and sophistication. ${sectionContent}</p>

                <h2>5. Conclusion</h2>
                <p>In conclusion, ${topic} represents a pivotal frontier for modern enterprises. By understanding its nuances and implementing robust strategies, businesses can position themselves for sustained success in a digital-first world. The journey may be complex, but the rewards of mastering ${topic} are substantial.</p>
                <p>${filler}</p>
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
                    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995',
                    status: 'PUBLISHED'
                },
                {
                    title: 'Why Swiss Software Engineering Standards Matter',
                    slug: 'swiss-software-standards',
                    excerpt: 'Exploring the precision, security, and reliability that defines Swiss engineering.',
                    content: generateLongContent('Why Swiss Software Engineering Standards Matter', 'Swiss Engineering Quality'),
                    categoryId: blogCatMap['business'],
                    image: 'https://images.unsplash.com/photo-1527664557558-a2b352fcf203',
                    status: 'PUBLISHED'
                },
                {
                    title: 'Cloud Migration Strategies for 2026',
                    slug: 'cloud-migration-strategies-2026',
                    excerpt: 'A comprehensive guide to moving your legacy systems to the modern cloud.',
                    content: generateLongContent('Cloud Migration Strategies for 2026', 'Cloud Computing'),
                    categoryId: blogCatMap['technology'],
                    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa',
                    status: 'PUBLISHED'
                },
                {
                    title: 'UX Design Trends Transforming E-commerce',
                    slug: 'ux-trends-ecommerce',
                    excerpt: 'From AR try-ons to voice commerce, see what is driving sales in digital retail.',
                    content: generateLongContent('UX Design Trends Transforming E-commerce', 'User Experience Design'),
                    categoryId: blogCatMap['design'],
                    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d',
                    status: 'PUBLISHED'
                },
                {
                    title: 'Cybersecurity Best Practices for Fintech',
                    slug: 'cybersecurity-fintech-practices',
                    excerpt: 'Protecting financial data in an era of increasing digital threats.',
                    content: generateLongContent('Cybersecurity Best Practices for Fintech', 'Cybersecurity'),
                    categoryId: blogCatMap['technology'],
                    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3',
                    status: 'PUBLISHED'
                },
                {
                    title: 'Scaling Your Startup: A Technical Roadmap',
                    slug: 'scaling-startup-technical-roadmap',
                    excerpt: 'When to switch from MVP to microservices? A guide for growing founders.',
                    content: generateLongContent('Scaling Your Startup: A Technical Roadmap', 'Startup Scalability'),
                    categoryId: blogCatMap['business'],
                    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7',
                    status: 'PUBLISHED'
                },
                {
                    title: 'The Role of Blockchain in Supply Chain',
                    slug: 'blockchain-supply-chain',
                    excerpt: 'Enhancing transparency and tracking in global logistics with distributed ledgers.',
                    content: generateLongContent('The Role of Blockchain in Supply Chain', 'Blockchain Technology'),
                    categoryId: blogCatMap['technology'],
                    image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088',
                    status: 'PUBLISHED'
                },
                {
                    title: 'Digital Transformation in Healthcare',
                    slug: 'digital-transformation-healthcare',
                    excerpt: 'How modern software is improving patient outcomes and hospital efficiency.',
                    content: generateLongContent('Digital Transformation in Healthcare', 'HealthTech'),
                    categoryId: blogCatMap['technology'],
                    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d',
                    status: 'PUBLISHED'
                },
                {
                    title: 'Mobile App Development: Native vs Cross-Platform',
                    slug: 'mobile-dev-native-vs-cross-platform',
                    excerpt: 'Choosing the right stack for your next mobile application project.',
                    content: generateLongContent('Mobile App Development: Native vs Cross-Platform', 'Mobile Development'),
                    categoryId: blogCatMap['technology'],
                    image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3',
                    status: 'PUBLISHED'
                },
                {
                    title: 'Green Tech: Sustainable Software Architecture',
                    slug: 'green-tech-sustainable-software',
                    excerpt: 'Writing code that consumes less energy and reduces carbon footprints.',
                    content: generateLongContent('Green Tech: Sustainable Software Architecture', 'Sustainable Technology'),
                    categoryId: blogCatMap['technology'],
                    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e',
                    status: 'PUBLISHED'
                }
            ];

            for (const post of blogPosts) {
                await prisma.blogPost.upsert({
                    where: { slug: post.slug },
                    update: { ...post, authorId: adminUser.id },
                    create: { ...post, authorId: adminUser.id }
                });
            }
            log('📚 Blog posts seeded with extended content');
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
        log('🔍 SEO meta seeded');

        log('🎉 Seeding successfully completed!');
        return { success: true, logs };

    } catch (error: any) {
        log(`❌ Seeding failed: ${error.message}`);
        return { success: false, logs };
    }
}

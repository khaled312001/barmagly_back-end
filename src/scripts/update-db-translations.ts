import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function main() {
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
        console.log(`Updated category: ${cat.slug}`);
    }

    // 2. Update Portfolio (Projects)
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
        console.log(`Updated project: ${p.slug}`);
    }

    // 3. Update Testimonials
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
        console.log(`Updated testimonial for: ${test.nameEn}`);
    }

    console.log('✅ Translation update complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

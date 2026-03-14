import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌍 Starting translation update script...');

    // 1. Update Services
    const servicesTranslations = [
        {
            slug: 'web-development',
            title: 'تطوير وتصميم المواقع الإلكترونية',
            description: 'نبني مواقع إلكترونية عالية الأداء باستخدام أحدث التقنيات وأطر التطوير المخصصة.',
        },
        {
            slug: 'mobile-application-development',
            title: 'تطوير تطبيقات الجوال',
            description: 'نصمم ونطور تطبيقات جوال احترافية لنظامي Android و iOS.',
        },
        {
            slug: 'pos-business-systems',
            title: 'نظام نقاط البيع (POS) وحلول الأعمال',
            description: 'نقوم بتطوير أنظمة POS و ERP قوية ومخصصة للمتاجر، المطاعم، الكافيهات، الصيدليات، ومراكز التجميل.',
        },
        {
            slug: 'sales-marketing',
            title: 'حلول المبيعات والتسويق',
            description: 'نقدم خدمات مبيعات وتسويق متكاملة لضمان سلاسة رحلة نمو عملك.',
        }
    ];

    for (const t of servicesTranslations) {
        await prisma.service.updateMany({
            where: { slug: t.slug },
            data: {
                title: t.title,
                description: t.description,
            }
        });
        console.log(`✅ Updated Service: ${t.slug}`);
    }

    // 2. Update Home Features Section
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
        console.log(`✅ Updated Home Features Section`);
    }

    // 3. Updating Testimonials
    const existingTestimonials = await prisma.testimonial.findMany();

    // We update them based on order as a simple hack since name could change and no slugs exist.
    // Assuming standard seed order
    const testimonialTranslations = [
        {
            order: 1, // Michael Chen
            name: 'مايكل تشين',
            role: 'مدير، تك فينتشرز زيورخ',
            content: 'صممت بَرمَجلي بنية تحتية متطورة للغاية لمنصتنا. التزامهم بمعايير الجودة السويسرية واضح في كل سطر من الأكواد.',
        },
        {
            order: 2, // Sarah Johnson
            name: 'سارة جونسون',
            role: 'مؤسس، ستايل هاب جلوبال',
            content: 'كان لنهجهم الاستراتيجي في تصميم واجهة المستخدم وتجربة المستخدم والتطوير دور كبير في تقديم منتج يتميز حقاً في السوق العالمية. نوصي بهم بشدة.',
        },
        {
            order: 3, // David Hassan
            name: 'ديفيد حسن',
            role: 'الرئيس التنفيذي، ريالتكس الشرق الأوسط',
            content: 'حلول نقاط البيع (POS) من بَرمَجلي أحدثت ثورة في إدارة فروعنا المتعددة. الاستقرار والمزامنة في التحديثات لا مثيل لها.',
        }
    ];

    for (const test of testimonialTranslations) {
        // Attempting to match by order if possible, or we just map by index
        await prisma.testimonial.updateMany({
            where: { order: test.order },
            data: {
                name: test.name,
                role: test.role,
                content: test.content
            }
        });
        console.log(`✅ Updated Testimonial: ${test.name}`);
    }


    console.log('🎉 Translation update complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

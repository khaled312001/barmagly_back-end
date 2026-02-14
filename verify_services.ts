import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const services = await prisma.service.findMany({
        select: { title: true, slug: true }
    });
    console.log('Current Services in DB:', JSON.stringify(services, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

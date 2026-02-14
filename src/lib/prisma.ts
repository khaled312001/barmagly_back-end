import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const getUrl = () => {
    let url = process.env.MONGODB_URI || process.env.DATABASE_URL || '';

    // Fix for Vercel MongoDB integration missing DB name
    if (url.includes('mongodb.net') && url.includes('/?')) {
        url = url.replace('/?', '/barmagly?');
    } else if (url.includes('mongodb.net') && url.endsWith('.net/')) {
        url = url + 'barmagly';
    } else if (url.includes('mongodb.net') && url.endsWith('.net')) {
        url = url + '/barmagly';
    }

    return url;
};

const url = getUrl();

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        datasources: {
            db: { url }
        },
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;

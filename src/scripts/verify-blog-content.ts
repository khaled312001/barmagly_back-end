
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const post = await prisma.blogPost.findUnique({
        where: { slug: 'future-of-ai-enterprise-software' },
        select: { title: true, content: true }
    });

    if (!post) {
        console.log('Post not found.');
    } else {
        console.log(`Title: ${post.title}`);
        console.log(`Content Length (chars): ${post.content.length}`);
        console.log(`Word Count (approx): ${post.content.split(/\s+/).length}`);
        console.log(`Preview: ${post.content.substring(0, 100)}...`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });

/**
 * Page Controller
 * Handles CRUD operations for Page Sections
 */
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all sections for a page
export const getPageSections = async (req: Request, res: Response) => {
    try {
        const { page } = req.params;
        const sections = await prisma.pageSection.findMany({
            where: { page },
            orderBy: { order: 'asc' },
        });

        // Convert db format to convenient JSON object map
        // Response format: { "hero": { ... }, "about": { ... } }
        const result: Record<string, any> = {};
        sections.forEach(section => {
            try {
                result[section.section] = JSON.parse(section.content || '{}');
            } catch (e) {
                result[section.section] = {};
            }
        });

        res.json(result);
    } catch (error) {
        console.error('Error fetching page sections:', error);
        res.status(500).json({ error: 'Failed to fetch page sections' });
    }
};

// Update a specific section
export const updatePageSection = async (req: Request, res: Response) => {
    try {
        const { page, section } = req.params;
        const content = req.body;

        const updatedSection = await prisma.pageSection.upsert({
            where: {
                page_section: {
                    page,
                    section
                }
            },
            update: {
                content: JSON.stringify(content),
                updatedAt: new Date(),
            },
            create: {
                page,
                section,
                content: JSON.stringify(content),
                order: 0,
            },
        });

        res.json(updatedSection);
    } catch (error) {
        console.error('Error updating page section:', error);
        res.status(500).json({ error: 'Failed to update page section' });
    }
};

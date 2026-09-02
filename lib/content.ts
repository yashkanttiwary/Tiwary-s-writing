import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { z } from 'zod';
import { cache } from 'react';

// Define the content directory
const CONTENT_DIR = path.join(process.cwd(), 'content/writings');

export const presentationSchema = z.object({
  profile: z.enum(['poetry', 'prose', 'story', 'essay', 'letter', 'fragment', 'experimental']).optional(),
  alignment: z.enum(['left', 'center', 'right']).optional(),
  measure: z.enum(['narrow', 'standard', 'wide', 'book']).optional(),
  density: z.enum(['compact', 'comfortable', 'spacious']).optional(),
  textScale: z.enum(['small', 'standard', 'large', 'expressive']).optional(),
  stanzaSpacing: z.enum(['small', 'medium', 'large', 'generous']).optional(),
  dropCap: z.boolean().optional(),
}).optional();

export const writingSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  slug: z.string(),
  publishedAt: z.string().datetime().or(z.string()),
  createdAt: z.string().datetime().or(z.string()).optional(),
  updatedAt: z.string().datetime().or(z.string()).optional(),
  type: z.enum(['poetry', 'prose', 'story', 'essay', 'letter', 'fragment', 'experimental']),
  language: z.string().default('en'),
  tags: z.array(z.string()).default([]),
  themes: z.array(z.string()).default([]),
  collections: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
  excerpt: z.string().optional(),
  originalPublicationDate: z.string().optional(),
  coverImage: z.string().optional(),
  presentation: presentationSchema,
});

export type WritingMetadata = z.infer<typeof writingSchema>;

export interface Writing {
  metadata: WritingMetadata;
  content: string;
  year: string;
  month: string;
}

export const getWritings = cache(async (includeDrafts = false): Promise<Writing[]> => {
  const writings: Writing[] = [];
  
  try {
    // Check if directory exists first
    try {
      await fs.access(CONTENT_DIR);
    } catch {
      console.warn(`Content directory not found: ${CONTENT_DIR}. Returning empty array.`);
      return [];
    }

    const years = await fs.readdir(CONTENT_DIR);
    
    for (const year of years) {
      if (year.startsWith('.')) continue; // skip hidden
      const yearPath = path.join(CONTENT_DIR, year);
      const isDir = (await fs.stat(yearPath)).isDirectory();
      if (!isDir) continue;

      const months = await fs.readdir(yearPath);
      for (const month of months) {
        if (month.startsWith('.')) continue; // skip hidden
        const monthPath = path.join(yearPath, month);
        const isMonthDir = (await fs.stat(monthPath)).isDirectory();
        if (!isMonthDir) continue;

        const files = await fs.readdir(monthPath);
        for (const file of files) {
          if (!file.endsWith('.md') && !file.endsWith('.mdx')) continue;
          
          const filePath = path.join(monthPath, file);
          let fileContent = '';
          try {
             fileContent = await fs.readFile(filePath, 'utf-8');
          } catch(err) {
             console.error(`Failed to read file ${filePath}:`, err);
             continue;
          }
          
          let data, content;
          try {
             const parsed = matter(fileContent);
             data = parsed.data;
             content = parsed.content;
          } catch(err) {
             console.error(`Failed to parse frontmatter in ${filePath}:`, err);
             continue;
          }
          
          try {
            const metadata = writingSchema.parse(data);
            
            if (!includeDrafts && metadata.draft) {
              continue;
            }
            
            writings.push({
              metadata,
              content,
              year,
              month,
            });
          } catch (e) {
            console.error(`Validation error in ${filePath}:`, e);
            // We gracefully continue if a single file has malformed YAML
          }
        }
      }
    }
  } catch (e) {
    console.error("Error reading writings directory:", e);
  }
  
  // Sort by publishedAt descending
  return writings.sort((a, b) => {
    return new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime();
  });
});

export async function getWritingBySlug(slug: string): Promise<Writing | null> {
  const writings = await getWritings(true);
  return writings.find(w => w.metadata.slug === slug) || null;
}

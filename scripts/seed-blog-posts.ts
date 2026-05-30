/**
 * Seed Blog Posts Script
 * 
 * This script seeds sample blog posts into the TửTế Fund database.
 * It uses the blog.service.ts directly to handle both PostgreSQL and MongoDB.
 * 
 * Usage: npx tsx scripts/seed-blog-posts.ts
 * 
 * Safety: This script uses the existing blog.service.ts which properly handles
 * the hybrid database architecture (PostgreSQL metadata + MongoDB content).
 */

import { createBlogPost } from '@/lib/blog/blog.service';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

const ADMIN_ID = 'cmphnhw980003so1ufgn8czgk';
const CREATOR_ID = 'cmphnhw8e0002so1uh16dwpvn';

interface BlogPostData {
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  status: string;
  type: string;
  visibility: string;
  authorId: string;
  campaignId?: string;
  publishedAt: string | null;
  readingTimeMinutes: number;
  tags: string[];
  categories: string[];
  content: string;
  richContent?: {
    blocks: any[];
  };
}

async function loadBlogPosts(): Promise<BlogPostData[]> {
  const jsonDir = path.join(process.cwd(), 'scripts/sample-blog-posts/json');
  const files = fs.readdirSync(jsonDir).filter(f => f.endsWith('.json'));

  const posts: BlogPostData[] = [];
  for (const file of files) {
    const filePath = path.join(jsonDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    posts.push(JSON.parse(content));
  }

  return posts;
}

async function checkSlugExists(slug: string): Promise<boolean> {
  const existing = await prisma.blog_posts.findUnique({
    where: { slug },
  });
  return existing !== null;
}

async function seedBlogPosts() {
  console.log('🌱 Starting blog posts seeding...\n');

  try {
    // Load sample blog posts
    const posts = await loadBlogPosts();
    console.log(`📄 Loaded ${posts.length} sample blog posts\n`);

    // Check if both users exist
    const admin = await prisma.users.findUnique({
      where: { id: ADMIN_ID },
    });

    const creator = await prisma.users.findUnique({
      where: { id: CREATOR_ID },
    });

    if (!admin) {
      console.error(`❌ Admin with ID ${ADMIN_ID} not found in database`);
      console.log('⚠️  Please create an admin user with this ID first or update the ADMIN_ID in the script');
      process.exit(1);
    }

    if (!creator) {
      console.error(`❌ Creator with ID ${CREATOR_ID} not found in database`);
      console.log('⚠️  Please create a creator user with this ID first or update the CREATOR_ID in the script');
      process.exit(1);
    }

    console.log(`✅ Admin found: ${admin.name} (${admin.id}) - isAdmin: ${admin.isAdmin}`);
    console.log(`✅ Creator found: ${creator.name} (${creator.id}) - isAdmin: ${creator.isAdmin}\n`);

    // Seed each post
    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const postData of posts) {
      try {
        // Check if slug already exists
        const slugExists = await checkSlugExists(postData.slug);
        if (slugExists) {
          console.log(`⏭️  Skipping "${postData.title}" - slug already exists`);
          skipped++;
          continue;
        }

        // Determine authorId based on post type
        let authorId: string;
        const postType = postData.type.toUpperCase();

        if (postType === 'PLATFORM' || postType === 'ANNOUNCEMENT') {
          // PLATFORM and ANNOUNCEMENT must use admin
          authorId = ADMIN_ID;
          console.log(`👮 Using admin for ${postType} post: "${postData.title}"`);
        } else if (postType === 'STORY' || postType === 'IMPACT_REPORT') {
          // STORY and IMPACT_REPORT can use creator
          authorId = CREATOR_ID;
          console.log(`👤 Using creator for ${postType} post: "${postData.title}"`);
        } else if (postType === 'CAMPAIGN_UPDATE') {
          // CAMPAIGN_UPDATE requires campaignId and must be campaign creator
          if (!postData.campaignId) {
            console.log(`⚠️  Skipping "${postData.title}" - CAMPAIGN_UPDATE requires campaignId`);
            skipped++;
            continue;
          }
          // For now, use admin for CAMPAIGN_UPDATE (should verify campaign ownership in production)
          authorId = ADMIN_ID;
          console.log(`👮 Using admin for ${postType} post: "${postData.title}"`);
        } else {
          // Default to creator for unknown types
          authorId = CREATOR_ID;
          console.log(`👤 Using creator for unknown type ${postType} post: "${postData.title}"`);
        }

        // Prepare data for createBlogPost
        const createData = {
          title: postData.title,
          excerpt: postData.excerpt,
          coverImage: postData.coverImage,
          status: postData.status as any,
          type: postData.type as any,
          visibility: postData.visibility as any,
          content: postData.content,
          richContent: postData.richContent,
          tags: postData.tags,
          categoryIds: [], // Will create categories if needed
          campaignId: undefined, // No campaign for sample posts
        };

        // Create blog post using blog.service.ts
        const post = await createBlogPost(authorId, createData);

        console.log(`✅ Created: "${postData.title}" (ID: ${post.id})`);
        created++;

      } catch (error: any) {
        console.error(`❌ Error creating "${postData.title}":`, error.message);
        errors++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Seeding Summary:');
    console.log(`✅ Created: ${created}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log('='.repeat(50));

    if (created > 0) {
      console.log('\n🎉 Blog posts seeded successfully!');
    } else if (skipped > 0) {
      console.log('\nℹ️  All blog posts already exist in database');
    } else {
      console.log('\n⚠️  No blog posts were created');
    }

  } catch (error: any) {
    console.error('\n❌ Fatal error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
seedBlogPosts();

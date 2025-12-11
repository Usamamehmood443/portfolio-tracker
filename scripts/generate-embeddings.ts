/**
 * Script to generate embeddings for all existing projects
 * Run with: npx ts-node scripts/generate-embeddings.ts
 *
 * Or alternatively:
 * npx tsx scripts/generate-embeddings.ts
 */

import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

// Load environment variables
require('dotenv').config();

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ProjectWithRelations {
  id: string;
  projectTitle: string;
  clientName: string;
  shortDescription: string;
  tagline: string | null;
  proposal: string | null;
  category: string;
  platform: string;
  features: { feature: { name: string } }[];
  developers: { developer: { name: string } }[];
}

/**
 * Generate embedding using OpenAI's text-embedding-3-small model
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

/**
 * Create searchable text from project fields
 */
function createSearchableText(project: ProjectWithRelations): string {
  const parts: string[] = [];

  if (project.projectTitle) {
    parts.push(`Project: ${project.projectTitle}`);
  }

  if (project.tagline) {
    parts.push(`Tagline: ${project.tagline}`);
  }

  if (project.shortDescription) {
    parts.push(`Description: ${project.shortDescription}`);
  }

  if (project.proposal) {
    parts.push(`Proposal: ${project.proposal}`);
  }

  if (project.category) {
    parts.push(`Category: ${project.category}`);
  }

  if (project.platform) {
    parts.push(`Platform: ${project.platform}`);
  }

  const features = project.features.map(f => f.feature.name);
  if (features.length > 0) {
    parts.push(`Features: ${features.join(', ')}`);
  }

  const developers = project.developers.map(d => d.developer.name);
  if (developers.length > 0) {
    parts.push(`Developers: ${developers.join(', ')}`);
  }

  return parts.join('\n\n');
}

async function main() {
  console.log('========================================');
  console.log('  Embedding Generation Script');
  console.log('========================================\n');

  // Check for API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY is not set in environment variables.');
    console.error('Please add your OpenAI API key to the .env file:');
    console.error('OPENAI_API_KEY=sk-...\n');
    process.exit(1);
  }

  console.log('Fetching projects from database...\n');

  // Fetch all projects with relations
  const projects = await prisma.project.findMany({
    include: {
      features: {
        include: {
          feature: true,
        },
      },
      developers: {
        include: {
          developer: true,
        },
      },
    },
  });

  console.log(`Found ${projects.length} projects.\n`);

  if (projects.length === 0) {
    console.log('No projects found. Exiting.');
    process.exit(0);
  }

  let successCount = 0;
  let errorCount = 0;

  console.log('Generating embeddings...\n');
  console.log('----------------------------------------');

  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    const progress = `[${i + 1}/${projects.length}]`;

    try {
      // Create searchable text
      const searchableText = createSearchableText(project as unknown as ProjectWithRelations);

      // Generate embedding
      const embeddingVector = await generateEmbedding(searchableText);

      // Update project with embedding
      await prisma.project.update({
        where: { id: project.id },
        data: {
          searchableText,
          embedding: JSON.stringify(embeddingVector),
        },
      });

      console.log(`${progress} ✓ ${project.projectTitle}`);
      successCount++;

      // Rate limiting - wait 200ms between API calls to avoid rate limits
      if (i < projects.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (error: any) {
      console.error(`${progress} ✗ ${project.projectTitle}`);
      console.error(`   Error: ${error.message || 'Unknown error'}`);
      errorCount++;
    }
  }

  console.log('----------------------------------------\n');
  console.log('========================================');
  console.log('  Summary');
  console.log('========================================');
  console.log(`Total projects:     ${projects.length}`);
  console.log(`Successfully indexed: ${successCount}`);
  console.log(`Errors:             ${errorCount}`);
  console.log('========================================\n');

  if (successCount > 0) {
    console.log('✓ Embeddings generated successfully!');
    console.log('  You can now use the AI-powered search feature.');
  }

  if (errorCount > 0) {
    console.log('\n⚠ Some projects failed to generate embeddings.');
    console.log('  Please check the errors above and try again.');
  }
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

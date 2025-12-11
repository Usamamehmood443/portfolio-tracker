import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Project type for embedding generation
interface ProjectForEmbedding {
  projectTitle: string;
  clientName?: string;
  shortDescription: string;
  tagline?: string | null;
  proposal?: string | null;
  category: string;
  platform: string;
  features: string[];
  developers?: string[];
}

/**
 * Generate embedding using OpenAI's text-embedding-3-small model
 * @param text - The text to generate embedding for
 * @returns Array of numbers representing the embedding vector
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Create searchable text from project fields
 * Concatenates relevant project fields into a single searchable string
 * @param project - Project object with fields to concatenate
 * @returns Concatenated searchable text
 */
export function createSearchableText(project: ProjectForEmbedding): string {
  const parts: string[] = [];

  // Add title (important)
  if (project.projectTitle) {
    parts.push(`Project: ${project.projectTitle}`);
  }

  // Add tagline
  if (project.tagline) {
    parts.push(`Tagline: ${project.tagline}`);
  }

  // Add short description
  if (project.shortDescription) {
    parts.push(`Description: ${project.shortDescription}`);
  }

  // Add proposal/detailed description
  if (project.proposal) {
    parts.push(`Proposal: ${project.proposal}`);
  }

  // Add category
  if (project.category) {
    parts.push(`Category: ${project.category}`);
  }

  // Add platform
  if (project.platform) {
    parts.push(`Platform: ${project.platform}`);
  }

  // Add features
  if (project.features && project.features.length > 0) {
    parts.push(`Features: ${project.features.join(', ')}`);
  }

  // Add developers (optional)
  if (project.developers && project.developers.length > 0) {
    parts.push(`Developers: ${project.developers.join(', ')}`);
  }

  return parts.join('\n\n');
}

/**
 * Calculate cosine similarity between two vectors
 * @param vectorA - First vector
 * @param vectorB - Second vector
 * @returns Cosine similarity score between -1 and 1
 */
export function cosineSimilarity(vectorA: number[], vectorB: number[]): number {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    normA += vectorA[i] * vectorA[i];
    normB += vectorB[i] * vectorB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

/**
 * Generate embedding for a project and return both searchable text and embedding
 * @param project - Project object
 * @returns Object with searchableText and embedding (as JSON string)
 */
export async function generateProjectEmbedding(project: ProjectForEmbedding): Promise<{
  searchableText: string;
  embedding: string;
}> {
  const searchableText = createSearchableText(project);
  const embeddingVector = await generateEmbedding(searchableText);

  return {
    searchableText,
    embedding: JSON.stringify(embeddingVector),
  };
}

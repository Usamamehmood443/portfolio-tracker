import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateEmbedding, cosineSimilarity } from '@/lib/embeddings';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Type for project with embedding
interface ProjectWithEmbedding {
  id: string;
  projectTitle: string;
  clientName: string;
  projectSource: string;
  projectUrl: string | null;
  category: string;
  shortDescription: string;
  platform: string;
  status: string;
  proposedBudget: number | null;
  finalizedBudget: number | null;
  estimatedDuration: string;
  deliveredDuration: string | null;
  startDate: Date;
  endDate: Date | null;
  tagline: string | null;
  proposal: string | null;
  embedding: string | null;
  searchableText: string | null;
  features: { feature: { name: string } }[];
  developers: { developer: { name: string } }[];
}

interface SearchResult {
  project: any;
  similarity: number;
}

// POST /api/search - Semantic search for projects
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    // Generate embedding for the query
    let queryEmbedding: number[];
    try {
      queryEmbedding = await generateEmbedding(query);
    } catch (error) {
      console.error('Error generating query embedding:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to process query. Please try again.' },
        { status: 500 }
      );
    }

    // Fetch all projects with embeddings
    const projects = await prisma.project.findMany({
      where: {
        embedding: {
          not: null,
        },
      },
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
    }) as unknown as ProjectWithEmbedding[];

    if (projects.length === 0) {
      return NextResponse.json({
        success: true,
        analysis: 'No projects have been indexed for search yet. Please run the embedding generation script first.',
        projects: [],
        count: 0,
        similarityScores: {},
      });
    }

    // Calculate similarity scores
    const results: SearchResult[] = [];

    for (const project of projects) {
      if (!project.embedding) continue;

      try {
        const projectEmbedding = JSON.parse(project.embedding) as number[];
        const similarity = cosineSimilarity(queryEmbedding, projectEmbedding);

        // Only include projects with similarity above threshold (0.3 for better results)
        if (similarity > 0.3) {
          results.push({
            project: {
              id: project.id,
              projectTitle: project.projectTitle,
              clientName: project.clientName,
              projectSource: project.projectSource,
              projectUrl: project.projectUrl,
              category: project.category,
              shortDescription: project.shortDescription,
              platform: project.platform,
              status: project.status,
              proposedBudget: project.proposedBudget,
              finalizedBudget: project.finalizedBudget,
              estimatedDuration: project.estimatedDuration,
              deliveredDuration: project.deliveredDuration,
              startDate: project.startDate.toISOString(),
              endDate: project.endDate?.toISOString() || null,
              tagline: project.tagline,
              proposal: project.proposal,
              features: project.features.map((f) => f.feature.name),
              developers: project.developers.map((d) => d.developer.name),
            },
            similarity,
          });
        }
      } catch (e) {
        console.error(`Error processing embedding for project ${project.id}:`, e);
      }
    }

    // Sort by similarity (highest first)
    results.sort((a, b) => b.similarity - a.similarity);

    // Take top 20 results
    const topResults = results.slice(0, 20);

    if (topResults.length === 0) {
      return NextResponse.json({
        success: true,
        analysis: 'No matching projects found for your query. Try using different keywords or a more general description.',
        projects: [],
        count: 0,
        similarityScores: {},
      });
    }

    // Prepare context for GPT analysis
    const projectsContext = topResults
      .map((r, index) => {
        const p = r.project;
        return `${index + 1}. **${p.projectTitle}** (${Math.round(r.similarity * 100)}% match)
   - Category: ${p.category}
   - Platform: ${p.platform}
   - Description: ${p.shortDescription}
   - Features: ${p.features.join(', ')}
   - Budget: $${p.finalizedBudget || p.proposedBudget || 'N/A'}`;
      })
      .join('\n\n');

    // Generate AI analysis
    let analysis: string;
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant analyzing a freelancer's portfolio. The user will provide a client query or job post. Based on the matching projects found in the portfolio, provide a professional analysis to help the freelancer respond to the client.

Format your response as markdown with:

## Analysis
Brief analysis of what the client needs based on their query.

## Recommended Projects
For each relevant project (top 3-5), explain why it matches the client's requirements and how it demonstrates relevant experience.

## Summary
Overall assessment of how well the portfolio matches the client's needs, and any suggestions for the freelancer when responding to this inquiry.`,
          },
          {
            role: 'user',
            content: `Client Query/Job Post:
"${query}"

Matching Projects from Portfolio:
${projectsContext}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      analysis = completion.choices[0]?.message?.content || 'Unable to generate analysis.';
    } catch (error) {
      console.error('Error generating AI analysis:', error);
      analysis = '## Analysis\nUnable to generate AI analysis. Please review the matching projects below.\n\n## Matching Projects\nThe projects are sorted by relevance to your query.';
    }

    // Create similarity scores map
    const similarityScores: Record<string, number> = {};
    topResults.forEach((r) => {
      similarityScores[r.project.id] = r.similarity;
    });

    return NextResponse.json({
      success: true,
      analysis,
      projects: topResults.map((r) => r.project),
      count: topResults.length,
      similarityScores,
    });
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred while searching. Please try again.' },
      { status: 500 }
    );
  }
}

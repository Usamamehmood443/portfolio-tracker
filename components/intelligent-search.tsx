"use client";

import { useState } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChevronDown,
  ChevronUp,
  Search,
  Loader2,
  X,
  Sparkles,
  ExternalLink,
  Bot,
} from "lucide-react";
import Link from "next/link";

// Types for search results
interface SearchProject {
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
  startDate: string;
  endDate: string | null;
  tagline: string | null;
  proposal: string | null;
  features: string[];
  developers: string[];
}

interface SearchResults {
  success: boolean;
  analysis: string;
  projects: SearchProject[];
  count: number;
  similarityScores: Record<string, number>;
  error?: string;
}

// Category color mapping
const categoryColors: Record<string, string> = {
  "E-commerce": "bg-purple-100 text-purple-800",
  "Healthcare": "bg-green-100 text-green-800",
  "Real Estate": "bg-blue-100 text-blue-800",
  "Corporate": "bg-gray-100 text-gray-800",
  "Education": "bg-orange-100 text-orange-800",
  "Restaurant": "bg-red-100 text-red-800",
  "Portfolio": "bg-indigo-100 text-indigo-800",
  "Non-Profit": "bg-teal-100 text-teal-800",
};

// Platform color mapping
const platformColors: Record<string, string> = {
  "Wix": "bg-blue-500 text-white",
  "WordPress": "bg-sky-500 text-white",
  "MERN": "bg-green-500 text-white",
  "Next.js": "bg-black text-white",
  "React": "bg-cyan-500 text-white",
  "Shopify": "bg-lime-500 text-white",
};

// Simple markdown renderer for the AI analysis
function renderMarkdown(text: string): JSX.Element[] {
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  let currentList: string[] = [];
  let listKey = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${listKey++}`} className="list-disc list-inside space-y-1 mb-4 text-sm text-muted-foreground">
          {currentList.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Headers
    if (trimmedLine.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={index} className="text-lg font-semibold mt-4 mb-2 text-foreground">
          {trimmedLine.replace('## ', '')}
        </h2>
      );
    }
    // Bold text handling
    else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
      flushList();
      elements.push(
        <p key={index} className="font-semibold text-sm mb-1">
          {trimmedLine.replace(/\*\*/g, '')}
        </p>
      );
    }
    // List items
    else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      currentList.push(trimmedLine.slice(2));
    }
    // Numbered lists
    else if (/^\d+\.\s/.test(trimmedLine)) {
      flushList();
      elements.push(
        <p key={index} className="text-sm text-muted-foreground mb-1">
          {trimmedLine}
        </p>
      );
    }
    // Regular paragraphs
    else if (trimmedLine.length > 0) {
      flushList();
      // Handle inline bold
      const parts = trimmedLine.split(/\*\*(.*?)\*\*/g);
      elements.push(
        <p key={index} className="text-sm text-muted-foreground mb-2">
          {parts.map((part, i) => (
            i % 2 === 1 ? <strong key={i}>{part}</strong> : part
          ))}
        </p>
      );
    }
    // Empty lines
    else {
      flushList();
    }
  });

  flushList();
  return elements;
}

export default function IntelligentSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Please enter a search query");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Search failed");
      }

      setResults(data);
    } catch (err: any) {
      setError(err.message || "An error occurred while searching");
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults(null);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSearch();
    }
  };

  return (
    <Card className="mb-8 shadow-sm border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
      <Collapsible.Root open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <Collapsible.Trigger asChild>
            <div className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    AI-Powered Search
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Paste a client job post or describe project requirements
                  </CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="gap-1">
                {isOpen ? (
                  <>
                    Collapse <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Expand <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </Collapsible.Trigger>
        </CardHeader>

        <Collapsible.Content>
          <CardContent className="space-y-4">
            {/* Search Input */}
            <div className="space-y-3">
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Paste a client job post or describe what they need...&#10;&#10;Example: 'Need a rental booking system with calendar integration, payment processing, and admin dashboard for managing properties'"
                className="min-h-[120px] resize-none"
                disabled={loading}
              />
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl</kbd> +{" "}
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter</kbd> to search
                </p>
                <div className="flex gap-2">
                  {(query || results) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClear}
                      disabled={loading}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={handleSearch}
                    disabled={loading || !query.trim()}
                    className="gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4" />
                        Search Portfolio
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Results */}
            {results && (
              <div className="space-y-6 pt-4">
                <Separator />

                {/* AI Analysis */}
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      AI Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-sm max-w-none">
                    {renderMarkdown(results.analysis)}
                  </CardContent>
                </Card>

                {/* Matching Projects */}
                {results.projects.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">
                        Matching Projects
                      </h3>
                      <Badge variant="secondary" className="text-sm">
                        {results.count} found
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {results.projects.map((project) => {
                        const similarity = results.similarityScores[project.id] || 0;
                        const matchPercent = Math.round(similarity * 100);

                        return (
                          <Card
                            key={project.id}
                            className="hover:shadow-md transition-shadow"
                          >
                            <CardHeader className="pb-2">
                              <div className="flex items-start justify-between gap-2">
                                <Link
                                  href={`/projects/${project.id}`}
                                  className="hover:text-primary transition-colors"
                                >
                                  <CardTitle className="text-base leading-tight line-clamp-2">
                                    {project.projectTitle}
                                  </CardTitle>
                                </Link>
                                <Badge
                                  variant="default"
                                  className={`shrink-0 ${
                                    matchPercent >= 80
                                      ? "bg-green-500"
                                      : matchPercent >= 60
                                      ? "bg-yellow-500"
                                      : "bg-orange-500"
                                  }`}
                                >
                                  {matchPercent}%
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                <Badge
                                  className={
                                    categoryColors[project.category] ||
                                    "bg-gray-100 text-gray-800"
                                  }
                                  variant="secondary"
                                >
                                  {project.category}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={
                                    platformColors[project.platform] ||
                                    "bg-gray-500 text-white"
                                  }
                                >
                                  {project.platform}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {project.shortDescription}
                              </p>

                              {/* Features Preview */}
                              {project.features.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {project.features.slice(0, 3).map((feature) => (
                                    <Badge
                                      key={feature}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {feature}
                                    </Badge>
                                  ))}
                                  {project.features.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{project.features.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}

                              {/* Budget */}
                              <div className="text-sm">
                                <span className="text-muted-foreground">Budget: </span>
                                <span className="font-semibold text-primary">
                                  $
                                  {(
                                    project.finalizedBudget ||
                                    project.proposedBudget ||
                                    0
                                  ).toLocaleString()}
                                </span>
                              </div>

                              <Link href={`/projects/${project.id}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full mt-2 gap-2"
                                >
                                  View Project
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </Link>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                {results.projects.length === 0 && !error && (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      No matching projects found. Try different keywords.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Collapsible.Content>
      </Collapsible.Root>
    </Card>
  );
}

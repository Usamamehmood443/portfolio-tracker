"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";
import type { ProjectWithRelations } from "@/types";
import IntelligentSearch from "@/components/intelligent-search";

// Category color mapping for badges
const categoryColors: Record<string, string> = {
  "E-commerce": "bg-purple-100 text-purple-800 hover:bg-purple-200",
  "Healthcare": "bg-green-100 text-green-800 hover:bg-green-200",
  "Real Estate": "bg-blue-100 text-blue-800 hover:bg-blue-200",
  "Corporate": "bg-gray-100 text-gray-800 hover:bg-gray-200",
  "Education": "bg-orange-100 text-orange-800 hover:bg-orange-200",
  "Restaurant": "bg-red-100 text-red-800 hover:bg-red-200",
  "Portfolio": "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
  "Non-Profit": "bg-teal-100 text-teal-800 hover:bg-teal-200",
};

// Project Source color mapping
const sourceColors: Record<string, string> = {
  "Fiverr": "bg-green-500 text-white hover:bg-green-600",
  "Upwork": "bg-sky-500 text-white hover:bg-sky-600",
  "WhatsApp": "bg-emerald-500 text-white hover:bg-emerald-600",
  "Wix Marketplace": "bg-purple-500 text-white hover:bg-purple-600",
  "Email": "bg-gray-500 text-white hover:bg-gray-600",
  "Outsourced": "bg-orange-500 text-white hover:bg-orange-600",
  "Copied": "bg-slate-500 text-white hover:bg-slate-600",
};

// Status color mapping
const statusColors: Record<string, string> = {
  "Completed": "bg-green-500 text-white hover:bg-green-600",
  "In Progress": "bg-blue-500 text-white hover:bg-blue-600",
  "Pending": "bg-yellow-500 text-white hover:bg-yellow-600",
  "On Hold": "bg-orange-500 text-white hover:bg-orange-600",
  "Cancelled": "bg-red-500 text-white hover:bg-red-600",
};

export default function Home() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Fetch projects from API
  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        const response = await fetch('/api/projects');
        const result = await response.json();

        if (result.success) {
          setProjects(result.data);
        } else {
          setError(result.error || 'Failed to fetch projects');
        }
      } catch (err) {
        setError('Failed to fetch projects');
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  // Extract unique values for filters
  const sources = useMemo(() => {
    const unique = Array.from(new Set(projects.map((p) => p.projectSource)));
    return ["all", ...unique];
  }, [projects]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(projects.map((p) => p.category)));
    return ["all", ...unique];
  }, [projects]);

  const platforms = useMemo(() => {
    const unique = Array.from(new Set(projects.map((p) => p.platform)));
    return ["all", ...unique];
  }, [projects]);

  const statuses = useMemo(() => {
    const unique = Array.from(new Set(projects.map((p) => p.status)));
    return ["all", ...unique];
  }, [projects]);

  // Filter projects based on search and filters
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        project.projectTitle.toLowerCase().includes(searchLower) ||
        project.clientName.toLowerCase().includes(searchLower) ||
        project.features.some((f) => f.toLowerCase().includes(searchLower)) ||
        project.shortDescription.toLowerCase().includes(searchLower) ||
        (project.tagline && project.tagline.toLowerCase().includes(searchLower));

      // Source filter
      const matchesSource =
        selectedSource === "all" || project.projectSource === selectedSource;

      // Category filter
      const matchesCategory =
        selectedCategory === "all" || project.category === selectedCategory;

      // Platform filter
      const matchesPlatform =
        selectedPlatform === "all" || project.platform === selectedPlatform;

      // Status filter
      const matchesStatus =
        selectedStatus === "all" || project.status === selectedStatus;

      return matchesSearch && matchesSource && matchesCategory && matchesPlatform && matchesStatus;
    });
  }, [searchQuery, selectedSource, selectedCategory, selectedPlatform, selectedStatus, projects]);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedSource("all");
    setSelectedCategory("all");
    setSelectedPlatform("all");
    setSelectedStatus("all");
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Portfolio Tracker
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and showcase your projects
            </p>
          </div>
          <Link href="/projects/new">
            <Button className="w-full sm:w-auto gap-2">
              <Plus className="h-4 w-4" />
              Add New Project
            </Button>
          </Link>
        </div>

        {/* AI-Powered Search */}
        <IntelligentSearch />

        {/* Search and Filters */}
        <Card className="mb-8 shadow-sm">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search projects by title, client, or features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <Select value={selectedSource} onValueChange={setSelectedSource}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    {sources.slice(1).map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.slice(1).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Platforms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    {platforms.slice(1).map((platform) => (
                      <SelectItem key={platform} value={platform}>
                        {platform}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {statuses.slice(1).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="p-12 text-center border-red-200 bg-red-50">
            <div className="flex flex-col items-center gap-4">
              <p className="text-red-600 font-medium">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </Card>
        )}

        {/* Results Count */}
        {!loading && !error && (
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredProjects.length} of {projects.length} projects
          </div>
        )}

        {/* Projects Grid */}
        {!loading && !error && filteredProjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                onClick={() => router.push(`/projects/${project.id}`)}
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl leading-tight group-hover:text-primary transition-colors">
                      {project.projectTitle}
                    </CardTitle>
                    <Badge
                      className={statusColors[project.status]}
                      variant="default"
                    >
                      {project.status}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Client:</span> {project.clientName}
                  </p>

                  {/* Source, Platform, Category Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      className={sourceColors[project.projectSource]}
                      variant="default"
                    >
                      {project.projectSource}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {project.platform}
                    </Badge>
                    <Badge
                      className={categoryColors[project.category] || "bg-gray-100"}
                      variant="secondary"
                    >
                      {project.category}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <CardDescription className="line-clamp-2">
                    {project.shortDescription}
                  </CardDescription>

                  {/* Features */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Features
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {project.features.slice(0, 3).map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {project.features.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="text-sm">
                    <span className="font-medium text-muted-foreground">Budget: </span>
                    <span className="text-primary font-semibold">
                      ${(project.finalizedBudget || project.proposedBudget || 0).toLocaleString()}
                    </span>
                  </div>

                  {/* Duration */}
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Est: </span>
                    {project.estimatedDuration}
                    {project.deliveredDuration && (
                      <>
                        <span className="font-medium"> | Delivered: </span>
                        {project.deliveredDuration}
                      </>
                    )}
                  </div>

                  {/* Start Date */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(project.startDate)}</span>
                  </div>

                  <Button className="w-full" variant="outline">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && !error && filteredProjects.length === 0 && projects.length > 0 && (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-muted p-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">No projects found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search query.
                </p>
              </div>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear all filters
              </Button>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && projects.length === 0 && (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-muted p-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                <p className="text-muted-foreground">
                  Get started by creating your first project.
                </p>
              </div>
              <Link href="/projects/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Project
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

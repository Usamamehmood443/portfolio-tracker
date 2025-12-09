"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Edit,
  Trash2,
  ExternalLink,
  Calendar,
  Users,
  DollarSign,
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  Download,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import type { ProjectWithRelations } from "@/types";

// Color mappings
const sourceColors: Record<string, string> = {
  "Fiverr": "bg-green-500 text-white",
  "Upwork": "bg-sky-500 text-white",
  "WhatsApp": "bg-emerald-500 text-white",
  "Wix Marketplace": "bg-purple-500 text-white",
  "Email": "bg-gray-500 text-white",
  "Outsourced": "bg-orange-500 text-white",
  "Copied": "bg-slate-500 text-white",
};

const statusColors: Record<string, string> = {
  "Completed": "bg-green-500 text-white",
  "In Progress": "bg-blue-500 text-white",
  "Pending": "bg-yellow-500 text-white",
  "On Hold": "bg-orange-500 text-white",
  "Cancelled": "bg-red-500 text-white",
};

interface PageProps {
  params: { id: string };
}

export default function ProjectDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [project, setProject] = useState<ProjectWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isProposalExpanded, setIsProposalExpanded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string>("");
  const [imageZoom, setImageZoom] = useState(100);

  // Fetch project from API
  useEffect(() => {
    async function fetchProject() {
      try {
        setLoading(true);
        const response = await fetch(`/api/projects/${params.id}`);
        const result = await response.json();

        if (result.success) {
          setProject(result.data);
        } else {
          setError(result.error || 'Failed to fetch project');
        }
      } catch (err) {
        setError('Failed to fetch project');
        console.error('Error fetching project:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [params.id]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Loading project details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center">
        <Card className="max-w-md border-red-200 bg-red-50">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto" />
            <h2 className="text-2xl font-bold text-red-900">
              {error || 'Project Not Found'}
            </h2>
            <p className="text-red-700">
              {error || "The project you're looking for doesn't exist or may have been deleted."}
            </p>
            <Link href="/">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Projects
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "Not set";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateBudgetDifference = () => {
    if (project.proposedBudget && project.finalizedBudget) {
      const diff = project.finalizedBudget - project.proposedBudget;
      if (diff > 0) {
        return { text: `Over by: ${formatCurrency(Math.abs(diff))}`, color: "text-red-600" };
      } else if (diff < 0) {
        return { text: `Saved: ${formatCurrency(Math.abs(diff))}`, color: "text-green-600" };
      }
    }
    return null;
  };

  const calculateDurationComparison = () => {
    if (project.estimatedDuration && project.deliveredDuration) {
      // Simple text comparison for now - could be enhanced with actual duration parsing
      return { text: project.deliveredDuration, color: "text-muted-foreground" };
    }
    return null;
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (result.success) {
        toast.success("Project deleted successfully!");
        router.push("/");
      } else {
        toast.error(result.error || 'Failed to delete project');
        setIsDeleting(false);
      }
    } catch (err) {
      console.error('Error deleting project:', err);
      toast.error('Failed to delete project');
      setIsDeleting(false);
    }
  };

  // Handle opening image in lightbox
  const handleImageClick = (filePath: string, fileName: string) => {
    setSelectedImage(filePath);
    setSelectedImageName(fileName);
    setImageZoom(100);
  };

  // Handle closing lightbox
  const handleCloseLightbox = () => {
    setSelectedImage(null);
    setSelectedImageName("");
    setImageZoom(100);
  };

  // Zoom controls
  const handleZoomIn = () => {
    setImageZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setImageZoom(prev => Math.max(prev - 25, 50));
  };

  const handleResetZoom = () => {
    setImageZoom(100);
  };

  // Download handlers
  const handleDownloadImage = () => {
    if (selectedImage) {
      const link = document.createElement('a');
      link.href = selectedImage;
      link.download = selectedImageName || 'screenshot.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started');
    }
  };

  const handleDownloadVideo = (filePath: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = filePath;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started');
  };

  const budgetDiff = calculateBudgetDifference();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div className="space-y-4 flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {project.projectTitle}
            </h1>

            {/* Status and Source Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge className={statusColors[project.status]} variant="default">
                {project.status}
              </Badge>
              <Badge className={sourceColors[project.projectSource]} variant="default">
                {project.projectSource}
              </Badge>
              <Badge variant="outline">{project.platform}</Badge>
              <Badge variant="secondary">{project.category}</Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Link href={`/projects/${project.id}/edit`}>
              <Button variant="default">
                <Edit className="mr-2 h-4 w-4" />
                Edit Project
              </Button>
            </Link>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* SECTION 1: Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Client Name</label>
                <p className="text-lg">{project.clientName}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Project URL</label>
                {project.projectUrl ? (
                  <a
                    href={project.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg text-primary hover:underline flex items-center gap-2 w-fit"
                  >
                    {project.projectUrl}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : (
                  <p className="text-lg text-muted-foreground">No URL provided</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-lg">{project.shortDescription}</p>
              </div>

              {project.tagline && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tagline</label>
                  <p className="text-lg italic text-primary">{project.tagline}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SECTION 2: Classification */}
          <Card>
            <CardHeader>
              <CardTitle>Classification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Project Source</label>
                  <p className="text-lg">{project.projectSource}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category/Industry</label>
                  <p className="text-lg">{project.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Platform</label>
                  <p className="text-lg">{project.platform}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <p className="text-lg">{project.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 3: Features */}
          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent>
              {project.features.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {project.features.map((feature) => (
                    <Badge key={feature} variant="secondary">
                      {feature}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No features listed</p>
              )}
            </CardContent>
          </Card>

          {/* SECTION 4: Budget & Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Budget & Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Budget Column */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Budget
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-muted-foreground">Proposed Budget</label>
                      <p className="text-lg font-medium">{formatCurrency(project.proposedBudget)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Finalized Budget</label>
                      <p className="text-lg font-medium">{formatCurrency(project.finalizedBudget)}</p>
                    </div>
                    {budgetDiff && (
                      <div className="pt-2 border-t">
                        <p className={`text-sm font-medium ${budgetDiff.color}`}>
                          {budgetDiff.text}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeline Column */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Timeline
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Start Date
                      </label>
                      <p className="text-lg">{formatDate(project.startDate)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        End Date
                      </label>
                      <p className="text-lg">
                        {project.endDate ? formatDate(project.endDate) : "Ongoing"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Estimated Duration</label>
                      <p className="text-lg">{project.estimatedDuration}</p>
                    </div>
                    {project.deliveredDuration && (
                      <div>
                        <label className="text-sm text-muted-foreground">Delivered Duration</label>
                        <p className="text-lg">{project.deliveredDuration}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 5: Team */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project.developers.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {project.developers.map((dev) => (
                    <Badge key={dev} variant="outline" className="text-base py-1 px-3">
                      {dev}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No developers assigned</p>
              )}
            </CardContent>
          </Card>

          {/* SECTION 6: Proposal */}
          {(project.tagline || project.proposal) && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Proposal</CardTitle>
                  {project.proposal && project.proposal.length > 200 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsProposalExpanded(!isProposalExpanded)}
                    >
                      {isProposalExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          Collapse
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          Expand
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.proposal ? (
                  <div className="prose max-w-none">
                    <p className={`whitespace-pre-wrap ${!isProposalExpanded && project.proposal.length > 200 ? "line-clamp-6" : ""}`}>
                      {project.proposal}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No proposal added</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* SECTION 7: Media */}
          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Screenshots */}
              <div className="space-y-3">
                <h3 className="font-semibold">Screenshots</h3>
                {project.screenshots && project.screenshots.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {project.screenshots.map((screenshot) => (
                      <div
                        key={screenshot.id}
                        className="relative aspect-video rounded-lg overflow-hidden border bg-muted cursor-pointer hover:opacity-90 transition-opacity group"
                        onClick={() => handleImageClick(screenshot.filePath, screenshot.fileName)}
                      >
                        <Image
                          src={screenshot.filePath}
                          alt={screenshot.fileName}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-xs text-white truncate">{screenshot.fileName}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No screenshots uploaded</p>
                )}
              </div>

              {/* Video */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Video</h3>
                  {project.video && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadVideo(project.video!.filePath, project.video!.fileName)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
                {project.video ? (
                  <div className="space-y-2">
                    <video
                      src={project.video.filePath}
                      controls
                      className="w-full rounded-lg border"
                    />
                    <p className="text-xs text-muted-foreground">{project.video.fileName}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No video uploaded</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SECTION 8: Metadata */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Created:</span>{" "}
                  {formatDate(project.createdAt)}
                </div>
                {project.updatedAt && (
                  <div>
                    <span className="font-medium">Last Updated:</span>{" "}
                    {formatDate(project.updatedAt)}
                  </div>
                )}
                <div>
                  <span className="font-medium">Project ID:</span> {project.id}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{project.projectTitle}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Project'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Lightbox */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={handleCloseLightbox}>
          <DialogContent className="max-w-6xl max-h-[90vh] p-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-lg font-semibold truncate pr-4">
                  {selectedImageName}
                </DialogTitle>
                <div className="flex items-center gap-2">
                  {/* Zoom Controls */}
                  <div className="flex items-center gap-1 border rounded-lg p-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleZoomOut}
                      disabled={imageZoom <= 50}
                      className="h-8 w-8 p-0"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium min-w-[3rem] text-center">
                      {imageZoom}%
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleZoomIn}
                      disabled={imageZoom >= 200}
                      className="h-8 w-8 p-0"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResetZoom}
                      className="h-8 w-8 p-0"
                      title="Reset zoom"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Download Button */}
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleDownloadImage}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </DialogHeader>

            {/* Image Container with Scroll */}
            <div className="overflow-auto p-6 max-h-[calc(90vh-120px)] bg-muted/20">
              <div className="flex items-center justify-center min-h-[400px]">
                <div
                  className="relative transition-transform duration-200 origin-center"
                  style={{
                    transform: `scale(${imageZoom / 100})`,
                  }}
                >
                  <img
                    src={selectedImage}
                    alt="Screenshot preview"
                    className="max-w-[800px] w-full h-auto rounded-lg"
                  />
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

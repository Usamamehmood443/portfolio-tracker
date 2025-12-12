"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { TagInput } from "@/components/ui/tag-input";
import { DynamicSelect } from "@/components/ui/dynamic-select";
import { FileUpload } from "@/components/ui/file-upload";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Loader2, X, AlertCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { ProjectWithRelations, ScreenshotData, VideoData } from "@/types";

// Default options
const defaultProjectSources = ["Fiverr", "Upwork", "WhatsApp", "Wix Marketplace", "Email", "Outsourced", "Copied"];
const defaultCategories = ["Healthcare", "E-commerce", "Real Estate", "Corporate", "Education", "Restaurant", "Portfolio", "Non-Profit"];
const defaultPlatforms = ["Wix Classic", "Wix Studio", "MERN", "WordPress", "Shopify", "Custom"];
const defaultStatuses = ["Pending", "In Progress", "Completed", "On Hold", "Cancelled"];
const defaultFeatures = [
  "Custom Product Page",
  "Wix Bookings",
  "Dashboards",
  "Listings",
  "Rental Systems",
  "Plugins",
  "API Integrations",
  "Payment Gateways",
  "AI Automations",
  "CRM",
  "Calculators",
  "Multistates",
];
const defaultDevelopers = ["Usama"];

// Form validation schema
const projectFormSchema = z.object({
  projectTitle: z.string().min(3, "Project title must be at least 3 characters"),
  clientName: z.string().min(2, "Client name must be at least 2 characters"),
  projectUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  shortDescription: z.string().min(10, "Description must be at least 10 characters"),
  projectSource: z.string().min(1, "Project source is required"),
  category: z.string().min(1, "Category is required"),
  platform: z.string().min(1, "Platform is required"),
  status: z.string().min(1, "Status is required"),
  features: z.array(z.string()).min(1, "Select at least one feature"),
  estimatedDuration: z.string().min(1, "Estimated duration is required"),
  deliveredDuration: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  proposedBudget: z.string().optional(),
  finalizedBudget: z.string().optional(),
  developers: z.array(z.string()).min(1, "At least one developer is required"),
  tagline: z.string().optional(),
  proposal: z.string().optional(),
}).refine((data) => {
  if (data.endDate && data.startDate) {
    return new Date(data.endDate) >= new Date(data.startDate);
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface PageProps {
  params: { id: string };
}

export default function EditProjectPage({ params }: PageProps) {
  const router = useRouter();
  const [project, setProject] = useState<ProjectWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [video, setVideo] = useState<File[]>([]);
  const [existingScreenshots, setExistingScreenshots] = useState<ScreenshotData[]>([]);
  const [existingVideo, setExistingVideo] = useState<VideoData | null>(null);
  const [screenshotsToDelete, setScreenshotsToDelete] = useState<string[]>([]);
  const [deleteVideo, setDeleteVideo] = useState(false);

  // Dynamic options state
  const [projectSources, setProjectSources] = useState<string[]>(defaultProjectSources);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [platforms, setPlatforms] = useState<string[]>(defaultPlatforms);
  const [statuses, setStatuses] = useState<string[]>(defaultStatuses);
  const [featureSuggestions, setFeatureSuggestions] = useState<string[]>(defaultFeatures);
  const [developerSuggestions, setDeveloperSuggestions] = useState<string[]>(defaultDevelopers);

  // Initialize form
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      projectTitle: "",
      clientName: "",
      projectUrl: "",
      shortDescription: "",
      projectSource: "",
      category: "",
      platform: "",
      status: "Pending",
      features: [],
      estimatedDuration: "",
      deliveredDuration: "",
      startDate: "",
      endDate: "",
      proposedBudget: "",
      finalizedBudget: "",
      developers: [],
      tagline: "",
      proposal: "",
    },
  });

  // Fetch project and dropdown options
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch project details
        const projectResponse = await fetch(`/api/projects/${params.id}`);
        const projectResult = await projectResponse.json();

        if (!projectResult.success) {
          setError(projectResult.error || 'Failed to fetch project');
          setLoading(false);
          return;
        }

        const projectData = projectResult.data;
        setProject(projectData);
        setExistingScreenshots(projectData.screenshots || []);
        setExistingVideo(projectData.video || null);

        // Populate form with project data
        form.reset({
          projectTitle: projectData.projectTitle,
          clientName: projectData.clientName,
          projectUrl: projectData.projectUrl || "",
          shortDescription: projectData.shortDescription,
          projectSource: projectData.projectSource,
          category: projectData.category,
          platform: projectData.platform,
          status: projectData.status,
          features: projectData.features,
          estimatedDuration: projectData.estimatedDuration,
          deliveredDuration: projectData.deliveredDuration || "",
          startDate: projectData.startDate.split('T')[0],
          endDate: projectData.endDate ? projectData.endDate.split('T')[0] : "",
          proposedBudget: projectData.proposedBudget?.toString() || "",
          finalizedBudget: projectData.finalizedBudget?.toString() || "",
          developers: projectData.developers,
          tagline: projectData.tagline || "",
          proposal: projectData.proposal || "",
        });

        // Fetch dropdown options
        const [sourcesRes, categoriesRes, platformsRes, statusesRes, featuresRes, developersRes] = await Promise.all([
          fetch('/api/project-sources'),
          fetch('/api/categories'),
          fetch('/api/platforms'),
          fetch('/api/statuses'),
          fetch('/api/features'),
          fetch('/api/developers'),
        ]);

        const [sources, categories, platforms, statuses, features, developers] = await Promise.all([
          sourcesRes.json(),
          categoriesRes.json(),
          platformsRes.json(),
          statusesRes.json(),
          featuresRes.json(),
          developersRes.json(),
        ]);

        // API returns string arrays directly, not objects with name property
        // Use defaults as fallback if API returns empty or fails
        if (sources.success && sources.data.length > 0) {
          setProjectSources(sources.data.filter(Boolean));
        }
        if (categories.success && categories.data.length > 0) {
          setCategories(categories.data.filter(Boolean));
        }
        if (platforms.success && platforms.data.length > 0) {
          setPlatforms(platforms.data.filter(Boolean));
        }
        if (statuses.success && statuses.data.length > 0) {
          setStatuses(statuses.data.filter(Boolean));
        }
        if (features.success && features.data.length > 0) {
          setFeatureSuggestions(features.data.filter(Boolean));
        }
        if (developers.success && developers.data.length > 0) {
          setDeveloperSuggestions(developers.data.filter(Boolean));
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load project data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.id, form]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Loading project data...</p>
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
              {error || "The project you're trying to edit doesn't exist."}
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

  // Form submission handler
  const onSubmit = async (data: ProjectFormValues) => {
    try {
      const formData = new FormData();

      // Add basic fields
      formData.append('projectTitle', data.projectTitle);
      formData.append('clientName', data.clientName);
      formData.append('projectSource', data.projectSource);
      formData.append('category', data.category);
      formData.append('platform', data.platform);
      formData.append('status', data.status);
      formData.append('shortDescription', data.shortDescription);
      formData.append('estimatedDuration', data.estimatedDuration);
      formData.append('startDate', data.startDate);

      if (data.projectUrl) formData.append('projectUrl', data.projectUrl);
      if (data.deliveredDuration) formData.append('deliveredDuration', data.deliveredDuration);
      if (data.endDate) formData.append('endDate', data.endDate);
      if (data.proposedBudget) formData.append('proposedBudget', data.proposedBudget);
      if (data.finalizedBudget) formData.append('finalizedBudget', data.finalizedBudget);
      if (data.tagline) formData.append('tagline', data.tagline);
      if (data.proposal) formData.append('proposal', data.proposal);

      // Add arrays as JSON strings
      formData.append('features', JSON.stringify(data.features));
      formData.append('developers', JSON.stringify(data.developers));

      // Add screenshots to delete
      if (screenshotsToDelete.length > 0) {
        formData.append('screenshotsToDelete', JSON.stringify(screenshotsToDelete));
      }

      // Add delete video flag
      if (deleteVideo) {
        formData.append('deleteVideo', 'true');
      }

      // Add new screenshots
      screenshots.forEach(file => {
        formData.append('screenshots', file);
      });

      // Add new video
      if (video.length > 0) {
        formData.append('video', video[0]);
      }

      // Send update request
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Project updated successfully!");
        router.push(`/projects/${project.id}`);
      } else {
        toast.error(result.error || 'Failed to update project');
      }
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project. Please try again.");
    }
  };

  // Handle adding new feature
  const handleFeatureChange = (features: string[]) => {
    form.setValue("features", features, { shouldValidate: true, shouldDirty: true });
    features.forEach(feature => {
      if (!featureSuggestions.includes(feature)) {
        setFeatureSuggestions(prev => [...prev, feature]);
      }
    });
  };

  // Handle adding new developer
  const handleDeveloperChange = (developers: string[]) => {
    form.setValue("developers", developers, { shouldValidate: true, shouldDirty: true });
    developers.forEach(dev => {
      if (!developerSuggestions.includes(dev)) {
        setDeveloperSuggestions(prev => [...prev, dev]);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/projects/${project.id}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Project Details
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Edit Project
          </h1>
          <p className="text-muted-foreground mt-1">
            Update the details of "{project.projectTitle}"
          </p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* SECTION 1: Basic Information */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

                <FormField
                  control={form.control}
                  name="projectTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g., Luxury Jewelry Store" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g., Sarah's Gems" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="projectUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the business model and services..."
                          className="min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* SECTION 2: Classification */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h2 className="text-xl font-semibold mb-4">Project Classification</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="projectSource"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Source *</FormLabel>
                        <FormControl>
                          <DynamicSelect
                            value={field.value}
                            onValueChange={field.onChange}
                            options={projectSources}
                            onAddOption={(option) => setProjectSources(prev => [...prev, option])}
                            placeholder="Select source"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category/Industry *</FormLabel>
                        <FormControl>
                          <DynamicSelect
                            value={field.value}
                            onValueChange={field.onChange}
                            options={categories}
                            onAddOption={(option) => setCategories(prev => [...prev, option])}
                            placeholder="Select category"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform *</FormLabel>
                        <FormControl>
                          <DynamicSelect
                            value={field.value}
                            onValueChange={field.onChange}
                            options={platforms}
                            onAddOption={(option) => setPlatforms(prev => [...prev, option])}
                            placeholder="Select platform"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status *</FormLabel>
                        <FormControl>
                          <DynamicSelect
                            value={field.value}
                            onValueChange={field.onChange}
                            options={statuses}
                            onAddOption={(option) => setStatuses(prev => [...prev, option])}
                            placeholder="Select status"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* SECTION 3: Features */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h2 className="text-xl font-semibold mb-4">Features</h2>

                <FormField
                  control={form.control}
                  name="features"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Features *</FormLabel>
                      <FormControl>
                        <TagInput
                          value={field.value}
                          onChange={handleFeatureChange}
                          suggestions={featureSuggestions}
                          placeholder="Type to add features..."
                        />
                      </FormControl>
                      <FormDescription>
                        Type and press Enter to add features. Select from suggestions or add new ones.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* SECTION 4: Budget & Timeline */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h2 className="text-xl font-semibold mb-4">Budget & Timeline</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="proposedBudget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proposed Budget ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="850" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="finalizedBudget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Finalized Budget ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="800" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="estimatedDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Duration *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 2 weeks, 1 month" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deliveredDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivered Duration</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 12 days" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* SECTION 5: Team */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h2 className="text-xl font-semibold mb-4">Team</h2>

                <FormField
                  control={form.control}
                  name="developers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Developers *</FormLabel>
                      <FormControl>
                        <TagInput
                          value={field.value}
                          onChange={handleDeveloperChange}
                          suggestions={developerSuggestions}
                          placeholder="Type developer name and press Enter..."
                        />
                      </FormControl>
                      <FormDescription>
                        Add developer names one by one
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* SECTION 6: Proposal & Marketing */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h2 className="text-xl font-semibold mb-4">Proposal & Marketing</h2>

                <FormField
                  control={form.control}
                  name="tagline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tagline</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ready-to-go tagline for proposals..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="proposal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proposal</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Full proposal text..."
                          className="min-h-40"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* SECTION 7: Media */}
            <Card>
              <CardContent className="pt-6 space-y-6">
                <h2 className="text-xl font-semibold mb-4">Media</h2>

                {/* Existing Screenshots */}
                {existingScreenshots.length > 0 && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Existing Screenshots</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {existingScreenshots
                        .filter(s => !screenshotsToDelete.includes(s.id))
                        .map((screenshot) => (
                          <div key={screenshot.id} className="relative group">
                            <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                              <Image
                                src={screenshot.filePath}
                                alt={screenshot.fileName}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => setScreenshotsToDelete(prev => [...prev, screenshot.id])}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <p className="text-xs text-muted-foreground mt-1 truncate">{screenshot.fileName}</p>
                          </div>
                        ))}
                    </div>
                    {screenshotsToDelete.length > 0 && (
                      <p className="text-xs text-orange-600">
                        {screenshotsToDelete.length} screenshot(s) will be deleted on save
                      </p>
                    )}
                  </div>
                )}

                {/* Existing Video */}
                {existingVideo && !deleteVideo && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Existing Video</label>
                    <div className="relative group">
                      <video
                        src={existingVideo.filePath}
                        controls
                        className="w-full rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setDeleteVideo(true)}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Delete Video
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">{existingVideo.fileName}</p>
                    </div>
                  </div>
                )}

                {existingVideo && deleteVideo && (
                  <div className="space-y-2 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-600 font-medium">Video will be deleted on save</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteVideo(false)}
                    >
                      Undo Delete
                    </Button>
                  </div>
                )}

                {/* Upload New Screenshots */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Add New Screenshots</label>
                  <FileUpload
                    value={screenshots}
                    onChange={setScreenshots}
                    accept="image/*"
                    maxFiles={10}
                    maxSize={5 * 1024 * 1024}
                    multiple={true}
                    type="image"
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload additional screenshots. Maximum 10 files, 5MB each
                  </p>
                </div>

                {/* Upload New Video */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {existingVideo && !deleteVideo ? 'Replace Video' : 'Add New Video'}
                  </label>
                  <FileUpload
                    value={video}
                    onChange={setVideo}
                    accept="video/*"
                    maxFiles={1}
                    maxSize={100 * 1024 * 1024}
                    multiple={false}
                    type="video"
                  />
                  <p className="text-xs text-muted-foreground">
                    {existingVideo && !deleteVideo
                      ? 'Upload a new video to replace the existing one. Maximum 1 file, 100MB'
                      : 'Upload a video. Maximum 1 file, 100MB'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-3 justify-end">
                  <Link href={`/projects/${project.id}`}>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Updating..." : "Update Project"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}

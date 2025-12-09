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
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

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

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [video, setVideo] = useState<File[]>([]);

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

  // Fetch dropdown options
  useEffect(() => {
    async function fetchDropdownOptions() {
      try {
        console.log('🔄 Fetching dropdown options...');
        const [sourcesRes, categoriesRes, platformsRes, statusesRes, featuresRes, developersRes] = await Promise.all([
          fetch('/api/project-sources'),
          fetch('/api/categories'),
          fetch('/api/platforms'),
          fetch('/api/statuses'),
          fetch('/api/features'),
          fetch('/api/developers'),
        ]);

        console.log('📡 API responses received');

        const [sources, categories, platforms, statuses, features, developers] = await Promise.all([
          sourcesRes.json(),
          categoriesRes.json(),
          platformsRes.json(),
          statusesRes.json(),
          featuresRes.json(),
          developersRes.json(),
        ]);

        console.log('📊 Parsed data:', {
          sources: sources.success ? sources.data.length : 'failed',
          categories: categories.success ? categories.data.length : 'failed',
          platforms: platforms.success ? platforms.data.length : 'failed',
          statuses: statuses.success ? statuses.data.length : 'failed',
        });

        console.log('🔍 Raw data sample:', {
          firstSource: sources.success && sources.data[0] ? sources.data[0] : 'none',
          firstCategory: categories.success && categories.data[0] ? categories.data[0] : 'none',
        });

        // API returns strings directly, not objects with name property
        const newSources = sources.success ? sources.data.filter(Boolean) : [];
        const newCategories = categories.success ? categories.data.filter(Boolean) : [];
        const newPlatforms = platforms.success ? platforms.data.filter(Boolean) : [];
        const newStatuses = statuses.success ? statuses.data.filter(Boolean) : [];
        const newFeatures = features.success ? features.data.filter(Boolean) : [];
        const newDevelopers = developers.success ? developers.data.filter(Boolean) : [];

        console.log('📝 Setting state with values:', {
          sources: newSources,
          categories: newCategories,
          platforms: newPlatforms,
          statuses: newStatuses,
        });

        setProjectSources(newSources);
        setCategories(newCategories);
        setPlatforms(newPlatforms);
        setStatuses(newStatuses);
        setFeatureSuggestions(newFeatures);
        setDeveloperSuggestions(newDevelopers);

        console.log('✅ State updated');
      } catch (err) {
        console.error('❌ Error fetching dropdown options:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDropdownOptions();
  }, []);

  // Form submission handler
  const onSubmit = async (data: ProjectFormValues) => {
    try {
      // Step 1: Upload screenshots
      const uploadedScreenshots = [];
      for (const file of screenshots) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'screenshot');

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadResult = await uploadResponse.json();
        if (uploadResult.success) {
          uploadedScreenshots.push(uploadResult.data);
        } else {
          toast.error(`Failed to upload ${file.name}`);
          return;
        }
      }

      // Step 2: Upload video (if any)
      let uploadedVideo = null;
      if (video.length > 0) {
        const formData = new FormData();
        formData.append('file', video[0]);
        formData.append('type', 'video');

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadResult = await uploadResponse.json();
        if (uploadResult.success) {
          uploadedVideo = uploadResult.data;
        } else {
          toast.error(`Failed to upload video`);
          return;
        }
      }

      // Step 3: Create project with uploaded file URLs
      const projectData = {
        projectTitle: data.projectTitle,
        clientName: data.clientName,
        projectSource: data.projectSource,
        category: data.category,
        platform: data.platform,
        status: data.status,
        shortDescription: data.shortDescription,
        estimatedDuration: data.estimatedDuration,
        startDate: data.startDate,
        projectUrl: data.projectUrl || null,
        deliveredDuration: data.deliveredDuration || null,
        endDate: data.endDate || null,
        proposedBudget: data.proposedBudget || null,
        finalizedBudget: data.finalizedBudget || null,
        tagline: data.tagline || null,
        proposal: data.proposal || null,
        features: data.features,
        developers: data.developers,
        screenshots: uploadedScreenshots,
        video: uploadedVideo,
      };

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Project added successfully!");
        router.push("/");
      } else {
        toast.error(result.error || 'Failed to add project');
      }
    } catch (error) {
      console.error("Error adding project:", error);
      toast.error("Failed to add project. Please try again.");
    }
  };

  // Handle adding new feature
  const handleFeatureChange = (features: string[]) => {
    form.setValue("features", features);
    // Add new features to suggestions
    features.forEach(feature => {
      if (!featureSuggestions.includes(feature)) {
        setFeatureSuggestions(prev => [...prev, feature]);
      }
    });
  };

  // Handle adding new developer
  const handleDeveloperChange = (developers: string[]) => {
    form.setValue("developers", developers);
    // Add new developers to suggestions
    developers.forEach(dev => {
      if (!developerSuggestions.includes(dev)) {
        setDeveloperSuggestions(prev => [...prev, dev]);
      }
    });
  };

  // Show loading while fetching options
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Loading form options...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Add New Project
          </h1>
          <p className="text-muted-foreground mt-1">
            Fill in the details to add a new project to your portfolio
          </p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* SECTION 1: Basic Information */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

                {/* Project Title - Full Width */}
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

                {/* Client Name | Project URL */}
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

                {/* Short Description - Full Width */}
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

                {/* Project Source | Category */}
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

                {/* Platform | Status */}
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

                {/* Proposed Budget | Finalized Budget */}
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

                {/* Estimated Duration | Delivered Duration */}
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

                {/* Start Date | End Date */}
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

                <div className="space-y-2">
                  <label className="text-sm font-medium">Screenshots</label>
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
                    Optional. Maximum 10 files, 5MB each
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Video</label>
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
                    Optional. Maximum 1 file, 100MB
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Adding..." : "Add Project"}
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

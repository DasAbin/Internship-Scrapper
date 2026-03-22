"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/AuthContext";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { uploadResume, uploadLinkedIn, submitGithub, updateProfile } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { ResumeUploadResponse, UserPreferences } from "@/types";
import {
  Upload,
  FileText,
  Github,
  Linkedin,
  CheckCircle2,
  X,
  Plus,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  MapPin,
  Wifi,
  DollarSign,
  Tag,
  Eye,
} from "lucide-react";

const STEPS = [
  { label: "Upload Resume", icon: Upload },
  { label: "Enrichment", icon: Sparkles },
  { label: "Preferences", icon: Tag },
  { label: "Review", icon: Eye },
];

const LOCATION_OPTIONS = [
  "Bangalore",
  "Mumbai",
  "Delhi NCR",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Kolkata",
  "Remote",
  "International",
];

const DOMAIN_OPTIONS = [
  "AI/ML",
  "Web Development",
  "Data Science",
  "Mobile Development",
  "DevOps",
  "Cybersecurity",
  "Blockchain",
  "Cloud Computing",
  "IoT",
  "Design",
  "Product Management",
  "Research",
];

function OnboardingContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(0);

  // Step 1 - Resume state
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ResumeUploadResponse | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [domains, setDomains] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  // Step 2 - Enrichment
  const [linkedinFile, setLinkedinFile] = useState<File | null>(null);
  const [githubUsername, setGithubUsername] = useState("");
  const [linkedinUploaded, setLinkedinUploaded] = useState(false);
  const [githubConnected, setGithubConnected] = useState(false);

  // Step 3 - Preferences
  const [preferences, setPreferences] = useState<UserPreferences>({
    locations: [],
    remoteOnly: false,
    minimumStipend: 0,
    domainsOfInterest: [],
  });

  // Mutations
  const resumeMutation = useMutation({
    mutationFn: uploadResume,
    onSuccess: (data) => {
      setExtractedData(data);
      setSkills(data.skills);
      setDomains(data.domains);
      toast.success("Resume analyzed successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to analyze resume");
    },
  });

  const linkedinMutation = useMutation({
    mutationFn: uploadLinkedIn,
    onSuccess: () => {
      setLinkedinUploaded(true);
      toast.success("LinkedIn data imported!");
    },
    onError: () => toast.error("Failed to import LinkedIn data"),
  });

  const githubMutation = useMutation({
    mutationFn: submitGithub,
    onSuccess: () => {
      setGithubConnected(true);
      toast.success("GitHub connected!");
    },
    onError: () => toast.error("Failed to connect GitHub"),
  });

  const profileMutation = useMutation({
    mutationFn: (data: any) => updateProfile(user!.uid, data),
    onSuccess: () => {
      toast.success("Profile created! Finding your matches...");
      router.push("/feed");
    },
    onError: () => toast.error("Failed to save profile"),
  });

  // Handlers
  const handleResumeUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type === "application/pdf") {
        setResumeFile(file);
        resumeMutation.mutate(file);
      } else {
        toast.error("Please upload a PDF file");
      }
    },
    [resumeMutation]
  );

  const handleResumeDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file && file.type === "application/pdf") {
        setResumeFile(file);
        resumeMutation.mutate(file);
      } else {
        toast.error("Please upload a PDF file");
      }
    },
    [resumeMutation]
  );

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const toggleLocation = (loc: string) => {
    setPreferences((prev) => ({
      ...prev,
      locations: prev.locations.includes(loc)
        ? prev.locations.filter((l) => l !== loc)
        : [...prev.locations, loc],
    }));
  };

  const toggleDomain = (domain: string) => {
    setPreferences((prev) => ({
      ...prev,
      domainsOfInterest: prev.domainsOfInterest.includes(domain)
        ? prev.domainsOfInterest.filter((d) => d !== domain)
        : [...prev.domainsOfInterest, domain],
    }));
  };

  const handleFinish = () => {
    profileMutation.mutate({
      skills,
      domains,
      preferences,
      githubUsername: githubUsername || undefined,
      linkedinImported: linkedinUploaded,
      profileComplete: true,
    });
  };

  const canProceed = () => {
    if (step === 0) return skills.length > 0;
    return true;
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-mesh pointer-events-none" />
      <div className="fixed top-1/3 left-1/4 w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-3xl pointer-events-none" />

      {/* Progress Header */}
      <div className="relative z-10 w-full max-w-3xl mx-auto px-4 pt-8 pb-4">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">InternMatch</span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-2 text-xs font-medium transition-colors",
                  i <= step
                    ? "text-violet-400"
                    : "text-muted-foreground/50"
                )}
              >
                <div
                  className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center transition-all",
                    i < step
                      ? "bg-violet-600 text-white"
                      : i === step
                      ? "bg-violet-500/20 text-violet-400 ring-2 ring-violet-500/30"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {i < step ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span className="hidden sm:block">{s.label}</span>
              </div>
            );
          })}
        </div>
        <Progress value={((step + 1) / STEPS.length) * 100} className="h-1.5" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Step 0: Resume Upload */}
          {step === 0 && (
            <div className="glass rounded-2xl p-8 space-y-6 animate-fade-in">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">
                  Let&apos;s build your profile
                </h2>
                <p className="text-muted-foreground">
                  Upload your resume to automatically extract skills and experience
                </p>
              </div>

              {/* Drop Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleResumeDrop}
                className={cn(
                  "border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer group",
                  resumeFile
                    ? "border-violet-500/50 bg-violet-500/5"
                    : "border-border hover:border-violet-500/50 hover:bg-violet-500/5"
                )}
                onClick={() =>
                  document.getElementById("resume-input")?.click()
                }
              >
                <input
                  id="resume-input"
                  type="file"
                  accept=".pdf"
                  onChange={handleResumeUpload}
                  className="hidden"
                />
                {resumeMutation.isPending ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                    <p className="text-sm text-muted-foreground">
                      Analyzing your resume...
                    </p>
                  </div>
                ) : resumeFile ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-violet-500/15 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-violet-400" />
                    </div>
                    <p className="font-medium">{resumeFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Click to replace
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-14 w-14 rounded-xl bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/15 transition-colors">
                      <Upload className="h-7 w-7 text-violet-400" />
                    </div>
                    <div>
                      <p className="font-medium">
                        Drop your resume here or{" "}
                        <span className="text-violet-400">browse</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF files only, up to 10MB
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Extracted Skills */}
              {skills.length > 0 && (
                <div className="space-y-3 animate-fade-in">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Extracted Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-violet-500/10 text-violet-300 border border-violet-500/20"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="ml-1 hover:text-red-400 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill..."
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addSkill()}
                      className="h-9"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={addSkill}
                      className="h-9 px-3"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Extracted Domains */}
              {domains.length > 0 && (
                <div className="space-y-3 animate-fade-in">
                  <h3 className="text-sm font-semibold">Detected Domains</h3>
                  <div className="flex flex-wrap gap-2">
                    {domains.map((domain) => (
                      <span
                        key={domain}
                        className="px-3 py-1.5 rounded-lg text-sm bg-purple-500/10 text-purple-300 border border-purple-500/20"
                      >
                        {domain}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Enrichment */}
          {step === 1 && (
            <div className="glass rounded-2xl p-8 space-y-6 animate-fade-in">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">
                  Enrich your profile
                </h2>
                <p className="text-muted-foreground">
                  Optional: Connect more data sources for better matches
                </p>
              </div>

              {/* LinkedIn Upload */}
              <div className="p-5 rounded-xl bg-card/60 border border-border space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-sky-500/15 flex items-center justify-center">
                    <Linkedin className="h-5 w-5 text-sky-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">LinkedIn Data Export</h3>
                    <p className="text-xs text-muted-foreground">
                      Upload your LinkedIn data export ZIP
                    </p>
                  </div>
                  {linkedinUploaded && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept=".zip"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setLinkedinFile(file);
                        linkedinMutation.mutate(file);
                      }
                    }}
                    className="h-9 text-sm"
                    disabled={linkedinMutation.isPending}
                  />
                </div>
              </div>

              {/* GitHub */}
              <div className="p-5 rounded-xl bg-card/60 border border-border space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-500/15 flex items-center justify-center">
                    <Github className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">GitHub Profile</h3>
                    <p className="text-xs text-muted-foreground">
                      Connect your GitHub for project analysis
                    </p>
                  </div>
                  {githubConnected && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="your-username"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    className="h-9"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9"
                    onClick={() => {
                      if (githubUsername) githubMutation.mutate(githubUsername);
                    }}
                    disabled={!githubUsername || githubMutation.isPending}
                  >
                    {githubMutation.isPending ? (
                      <div className="w-4 h-4 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
                    ) : (
                      "Connect"
                    )}
                  </Button>
                </div>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                You can skip this step and add these later from your profile
              </p>
            </div>
          )}

          {/* Step 2: Preferences */}
          {step === 2 && (
            <div className="glass rounded-2xl p-8 space-y-6 animate-fade-in">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">
                  Set your preferences
                </h2>
                <p className="text-muted-foreground">
                  Tell us what you&apos;re looking for
                </p>
              </div>

              {/* Locations */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4 text-violet-400" />
                  Preferred Locations
                </label>
                <div className="flex flex-wrap gap-2">
                  {LOCATION_OPTIONS.map((loc) => {
                    const selected = preferences.locations.includes(loc);
                    return (
                      <button
                        key={loc}
                        onClick={() => toggleLocation(loc)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
                          selected
                            ? "bg-violet-500/15 text-violet-400 border-violet-500/30"
                            : "text-muted-foreground border-border hover:border-violet-500/30"
                        )}
                      >
                        {loc}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Remote Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-card/60 border border-border">
                <div className="flex items-center gap-3">
                  <Wifi className="h-5 w-5 text-teal-400" />
                  <div>
                    <p className="text-sm font-medium">Remote Only</p>
                    <p className="text-xs text-muted-foreground">
                      Show only remote opportunities
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences.remoteOnly}
                  onCheckedChange={(v) =>
                    setPreferences((p) => ({ ...p, remoteOnly: v }))
                  }
                />
              </div>

              {/* Stipend */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <DollarSign className="h-4 w-4 text-emerald-400" />
                  Minimum Stipend: ₹
                  {(preferences.minimumStipend / 1000).toFixed(0)}K/mo
                </label>
                <Slider
                  value={[preferences.minimumStipend]}
                  max={100000}
                  step={5000}
                  onValueChange={([val]) =>
                    setPreferences((p) => ({ ...p, minimumStipend: val }))
                  }
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₹0</span>
                  <span>₹100K</span>
                </div>
              </div>

              {/* Domains of Interest */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Tag className="h-4 w-4 text-purple-400" />
                  Domains of Interest
                </label>
                <div className="flex flex-wrap gap-2">
                  {DOMAIN_OPTIONS.map((domain) => {
                    const selected =
                      preferences.domainsOfInterest.includes(domain);
                    return (
                      <button
                        key={domain}
                        onClick={() => toggleDomain(domain)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
                          selected
                            ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                            : "text-muted-foreground border-border hover:border-purple-500/30"
                        )}
                      >
                        {domain}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="glass rounded-2xl p-8 space-y-6 animate-fade-in">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Review your profile</h2>
                <p className="text-muted-foreground">
                  Everything looks good? Let&apos;s find your matches!
                </p>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 rounded-lg text-sm bg-violet-500/10 text-violet-300 border border-violet-500/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Domains */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Domains
                </h3>
                <div className="flex flex-wrap gap-2">
                  {domains.map((d) => (
                    <span
                      key={d}
                      className="px-3 py-1.5 rounded-lg text-sm bg-purple-500/10 text-purple-300 border border-purple-500/20"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* Enrichment */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Connected Sources
                </h3>
                <div className="flex gap-3">
                  <div
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm",
                      linkedinUploaded
                        ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                        : "text-muted-foreground border-border"
                    )}
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                    {linkedinUploaded && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm",
                      githubConnected
                        ? "bg-gray-500/10 text-gray-300 border-gray-500/20"
                        : "text-muted-foreground border-border"
                    )}
                  >
                    <Github className="h-4 w-4" />
                    {githubUsername || "GitHub"}
                    {githubConnected && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Preferences
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-lg bg-card/60 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">
                      Locations
                    </p>
                    <p className="font-medium">
                      {preferences.locations.length > 0
                        ? preferences.locations.join(", ")
                        : "Any"}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-card/60 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">
                      Remote Only
                    </p>
                    <p className="font-medium">
                      {preferences.remoteOnly ? "Yes" : "No"}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-card/60 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">
                      Min. Stipend
                    </p>
                    <p className="font-medium">
                      ₹{(preferences.minimumStipend / 1000).toFixed(0)}K/mo
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-card/60 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">
                      Domains
                    </p>
                    <p className="font-medium">
                      {preferences.domainsOfInterest.length > 0
                        ? preferences.domainsOfInterest.length + " selected"
                        : "Any"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="ghost"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            {step < STEPS.length - 1 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="gap-2"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                disabled={profileMutation.isPending}
                className="gap-2"
              >
                {profileMutation.isPending ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Find My Matches
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <ProtectedRoute>
      <OnboardingContent />
    </ProtectedRoute>
  );
}

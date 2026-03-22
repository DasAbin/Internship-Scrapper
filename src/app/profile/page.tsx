"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/AuthContext";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { Navbar } from "@/components/layout/Navbar";
import { ProfileSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { getProfile, updateProfile, uploadResume } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { UserProfile } from "@/types";
import {
  User,
  Upload,
  Save,
  X,
  Plus,
  Github,
  Linkedin,
  CheckCircle2,
  MapPin,
  Wifi,
  DollarSign,
  Tag,
  Briefcase,
  GraduationCap,
  Edit3,
  FileText,
} from "lucide-react";

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

function ProfileContent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  const {
    data: profile,
    isLoading,
  } = useQuery({
    queryKey: ["profile", user?.uid],
    queryFn: () => getProfile(user!.uid),
    enabled: !!user,
  });

  const [editData, setEditData] = useState<Partial<UserProfile>>({});

  const updateMutation = useMutation({
    mutationFn: (data: Partial<UserProfile>) => updateProfile(user!.uid, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(["profile", user?.uid], updated);
      setIsEditing(false);
      toast.success("Profile updated!");
    },
    onError: () => toast.error("Failed to update profile"),
  });

  const resumeMutation = useMutation({
    mutationFn: uploadResume,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.uid] });
      toast.success("Resume re-uploaded! Skills updated.");
    },
    onError: () => toast.error("Failed to upload resume"),
  });

  const startEditing = useCallback(() => {
    if (profile) {
      setEditData({
        skills: [...profile.skills],
        domains: [...profile.domains],
        preferences: { ...profile.preferences },
        githubUsername: profile.githubUsername,
      });
      setIsEditing(true);
    }
  }, [profile]);

  const handleSave = () => {
    updateMutation.mutate(editData);
  };

  const addSkill = () => {
    if (newSkill.trim() && !editData.skills?.includes(newSkill.trim())) {
      setEditData((prev) => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setEditData((prev) => ({
      ...prev,
      skills: prev.skills?.filter((s) => s !== skill) || [],
    }));
  };

  const toggleLocation = (loc: string) => {
    setEditData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences!,
        locations: prev.preferences?.locations.includes(loc)
          ? prev.preferences.locations.filter((l) => l !== loc)
          : [...(prev.preferences?.locations || []), loc],
      },
    }));
  };

  const toggleDomain = (domain: string) => {
    setEditData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences!,
        domainsOfInterest: prev.preferences?.domainsOfInterest.includes(domain)
          ? prev.preferences.domainsOfInterest.filter((d) => d !== domain)
          : [...(prev.preferences?.domainsOfInterest || []), domain],
      },
    }));
  };

  const displayProfile = isEditing ? { ...profile, ...editData } as UserProfile : profile;

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <ProfileSkeleton />
        ) : profile ? (
          <div className="space-y-6 animate-fade-in">
            {/* Profile Header */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Avatar"
                      className="h-20 w-20 rounded-2xl ring-2 ring-violet-500/30 object-cover"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                      {user?.displayName?.[0] || user?.email?.[0] || "U"}
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl font-bold">
                      {user?.displayName || "User"}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                      {user?.email}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {profile.githubUsername && (
                        <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-gray-500/10 text-gray-400 border border-gray-500/20">
                          <Github className="h-3 w-3" />
                          {profile.githubUsername}
                        </span>
                      )}
                      {profile.linkedinImported && (
                        <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">
                          <Linkedin className="h-3 w-3" />
                          Connected
                          <CheckCircle2 className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={startEditing}
                      className="gap-1.5"
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                        className="gap-1.5"
                      >
                        <Save className="h-4 w-4" />
                        Save
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Re-upload Resume */}
              <div className="mt-4 pt-4 border-t border-border/50">
                <label
                  htmlFor="resume-reupload"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-violet-500/30 text-sm text-violet-400 cursor-pointer hover:bg-violet-500/5 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  Re-upload Resume
                  {resumeMutation.isPending && (
                    <div className="w-3.5 h-3.5 rounded-full border border-violet-400 border-t-transparent animate-spin" />
                  )}
                </label>
                <input
                  id="resume-reupload"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) resumeMutation.mutate(file);
                  }}
                />
              </div>
            </div>

            {/* Skills */}
            <div className="glass rounded-2xl p-6 space-y-4">
              <h2 className="flex items-center gap-2 font-semibold">
                <Tag className="h-4 w-4 text-violet-400" />
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {(displayProfile?.skills || []).map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-violet-500/10 text-violet-300 border border-violet-500/20"
                  >
                    {skill}
                    {isEditing && (
                      <button
                        onClick={() => removeSkill(skill)}
                        className="ml-1 hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {isEditing && (
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
                    className="h-9"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Domains */}
            <div className="glass rounded-2xl p-6 space-y-4">
              <h2 className="flex items-center gap-2 font-semibold">
                <Briefcase className="h-4 w-4 text-purple-400" />
                Domains
              </h2>
              <div className="flex flex-wrap gap-2">
                {(displayProfile?.domains || []).map((domain) => (
                  <span
                    key={domain}
                    className="px-3 py-1.5 rounded-lg text-sm bg-purple-500/10 text-purple-300 border border-purple-500/20"
                  >
                    {domain}
                  </span>
                ))}
              </div>
            </div>

            {/* Connected Accounts */}
            <div className="glass rounded-2xl p-6 space-y-4">
              <h2 className="font-semibold">Connected Accounts</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-card/50 border border-border">
                  <div className="h-10 w-10 rounded-lg bg-gray-500/15 flex items-center justify-center">
                    <Github className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">GitHub</p>
                    {isEditing ? (
                      <Input
                        value={editData.githubUsername || ""}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            githubUsername: e.target.value,
                          }))
                        }
                        placeholder="username"
                        className="h-7 text-xs mt-1"
                      />
                    ) : (
                      <p className="text-xs text-muted-foreground truncate">
                        {profile.githubUsername || "Not connected"}
                      </p>
                    )}
                  </div>
                  {profile.githubUsername && !isEditing && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-card/50 border border-border">
                  <div className="h-10 w-10 rounded-lg bg-sky-500/15 flex items-center justify-center">
                    <Linkedin className="h-5 w-5 text-sky-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">LinkedIn</p>
                    <p className="text-xs text-muted-foreground">
                      {profile.linkedinImported ? "Data imported" : "Not connected"}
                    </p>
                  </div>
                  {profile.linkedinImported && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  )}
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="glass rounded-2xl p-6 space-y-6">
              <h2 className="font-semibold">Preferences</h2>

              {/* Locations */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <MapPin className="h-4 w-4 text-violet-400" />
                  Preferred Locations
                </label>
                <div className="flex flex-wrap gap-2">
                  {isEditing
                    ? LOCATION_OPTIONS.map((loc) => {
                        const selected =
                          editData.preferences?.locations.includes(loc);
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
                      })
                    : (profile.preferences?.locations || []).map((loc) => (
                        <span
                          key={loc}
                          className="px-3 py-1.5 rounded-lg text-sm bg-violet-500/10 text-violet-300 border border-violet-500/20"
                        >
                          {loc}
                        </span>
                      ))}
                  {!isEditing &&
                    (!profile.preferences?.locations ||
                      profile.preferences.locations.length === 0) && (
                      <span className="text-sm text-muted-foreground">Any</span>
                    )}
                </div>
              </div>

              {/* Remote Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-card/50 border border-border">
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
                  checked={
                    isEditing
                      ? editData.preferences?.remoteOnly
                      : profile.preferences?.remoteOnly
                  }
                  onCheckedChange={(v) => {
                    if (isEditing) {
                      setEditData((prev) => ({
                        ...prev,
                        preferences: { ...prev.preferences!, remoteOnly: v },
                      }));
                    }
                  }}
                  disabled={!isEditing}
                />
              </div>

              {/* Stipend */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <DollarSign className="h-4 w-4 text-emerald-400" />
                  Minimum Stipend: ₹
                  {(
                    (isEditing
                      ? editData.preferences?.minimumStipend
                      : profile.preferences?.minimumStipend) || 0
                  ) / 1000}
                  K/mo
                </label>
                <Slider
                  value={[
                    (isEditing
                      ? editData.preferences?.minimumStipend
                      : profile.preferences?.minimumStipend) || 0,
                  ]}
                  max={100000}
                  step={5000}
                  onValueChange={([val]) => {
                    if (isEditing) {
                      setEditData((prev) => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences!,
                          minimumStipend: val,
                        },
                      }));
                    }
                  }}
                  disabled={!isEditing}
                />
              </div>

              {/* Domains of Interest */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Tag className="h-4 w-4 text-purple-400" />
                  Domains of Interest
                </label>
                <div className="flex flex-wrap gap-2">
                  {isEditing
                    ? DOMAIN_OPTIONS.map((domain) => {
                        const selected =
                          editData.preferences?.domainsOfInterest.includes(
                            domain
                          );
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
                      })
                    : (profile.preferences?.domainsOfInterest || []).map(
                        (domain) => (
                          <span
                            key={domain}
                            className="px-3 py-1.5 rounded-lg text-sm bg-purple-500/10 text-purple-300 border border-purple-500/20"
                          >
                            {domain}
                          </span>
                        )
                      )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Profile not found</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

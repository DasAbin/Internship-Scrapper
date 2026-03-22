"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/AuthContext";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { Navbar } from "@/components/layout/Navbar";
import { FeedSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getSavedListings, updateSavedStatus } from "@/lib/api";
import {
  cn,
  getMatchColor,
  getDeadlineUrgency,
  formatStipend,
  getSourceColor,
  getStatusColor,
} from "@/lib/utils";
import { toast } from "sonner";
import type { StatusType, SavedListing } from "@/types";
import {
  Bookmark,
  Clock,
  ExternalLink,
  Building2,
  Sparkles,
  ChevronDown,
  ArrowUpDown,
  Inbox,
  Trophy,
  MapPin,
  Wifi,
} from "lucide-react";
import { useState } from "react";

const STATUS_OPTIONS: { label: string; value: StatusType }[] = [
  { label: "Saved", value: "saved" },
  { label: "Applied", value: "applied" },
  { label: "Interviewing", value: "interviewing" },
  { label: "Rejected", value: "rejected" },
];

type SortBy = "deadline" | "dateSaved" | "matchScore";

function SavedContent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [sortBy, setSortBy] = useState<SortBy>("deadline");

  const { data: savedListings, isLoading } = useQuery({
    queryKey: ["saved", user?.uid],
    queryFn: () => getSavedListings(user!.uid),
    enabled: !!user,
  });

  const statusMutation = useMutation({
    mutationFn: ({
      listingId,
      status,
    }: {
      listingId: string;
      status: StatusType;
    }) => updateSavedStatus(user!.uid, listingId, status),
    onMutate: async ({ listingId, status }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["saved", user?.uid] });
      const prev = queryClient.getQueryData<SavedListing[]>(["saved", user?.uid]);
      queryClient.setQueryData<SavedListing[]>(
        ["saved", user?.uid],
        (old) =>
          old?.map((item) =>
            item.listing.id === listingId ? { ...item, status } : item
          ) || []
      );
      return { prev };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["saved", user?.uid], context?.prev);
      toast.error("Failed to update status");
    },
    onSuccess: () => {
      toast.success("Status updated!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["saved", user?.uid] });
    },
  });

  const sorted = [...(savedListings || [])].sort((a, b) => {
    switch (sortBy) {
      case "deadline":
        return (
          new Date(a.listing.deadline).getTime() -
          new Date(b.listing.deadline).getTime()
        );
      case "dateSaved":
        return (
          new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
        );
      case "matchScore":
        return b.listing.matchScore - a.listing.matchScore;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
              <Bookmark className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Saved Listings</h1>
              <p className="text-sm text-muted-foreground">
                {savedListings?.length || 0} opportunities saved
              </p>
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1 glass rounded-lg p-1">
            {(
              [
                { label: "Deadline", value: "deadline" as SortBy },
                { label: "Date Saved", value: "dateSaved" as SortBy },
                { label: "Match", value: "matchScore" as SortBy },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  sortBy === opt.value
                    ? "bg-violet-500/15 text-violet-400"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <FeedSkeleton />
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
              <Inbox className="h-8 w-8 text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              No saved listings yet
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Browse the feed to save interesting opportunities
            </p>
            <Button asChild>
              <a href="/feed" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Browse Feed
              </a>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {sorted.map((item) => {
              const { listing, status } = item;
              const deadline = getDeadlineUrgency(listing.deadline);
              const matchColor = getMatchColor(listing.matchScore);

              return (
                <div
                  key={item.id}
                  className="glass glass-hover rounded-xl p-5 animate-fade-in relative"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-5 w-5 text-violet-400" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate text-sm">
                          {listing.title}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {listing.organization}
                        </p>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border flex-shrink-0",
                        matchColor
                      )}
                    >
                      {listing.matchScore}%
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {listing.skillsRequired.slice(0, 3).map((skill: string) => (
                      <span
                        key={skill}
                        className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-violet-500/10 text-violet-300 border border-violet-500/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      {listing.isRemote ? (
                        <>
                          <Wifi className="h-3 w-3 text-teal-400" />
                          <span className="text-teal-400">Remote</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="h-3 w-3" />
                          {listing.location}
                        </>
                      )}
                    </span>
                    <span className={cn("flex items-center gap-1", deadline.color)}>
                      <Clock className="h-3 w-3" />
                      {deadline.text}
                    </span>
                    {listing.type === "internship" &&
                      (listing.stipendMin || listing.stipendMax) && (
                        <span className="text-emerald-400">
                          {formatStipend(listing.stipendMin, listing.stipendMax)}
                        </span>
                      )}
                    {listing.type === "hackathon" && listing.prizePool && (
                      <span className="flex items-center gap-1 text-amber-400">
                        <Trophy className="h-3 w-3" />
                        {listing.prizePool}
                      </span>
                    )}
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-border/50">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "flex-1 gap-1.5 h-8 text-xs",
                            getStatusColor(status)
                          )}
                        >
                          <span className="capitalize">{status}</span>
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <DropdownMenuItem
                            key={opt.value}
                            onClick={() =>
                              statusMutation.mutate({
                                listingId: listing.id,
                                status: opt.value,
                              })
                            }
                            className={cn(
                              "text-xs",
                              status === opt.value && "bg-accent"
                            )}
                          >
                            <span
                              className={cn(
                                "h-2 w-2 rounded-full mr-2",
                                opt.value === "saved" && "bg-gray-400",
                                opt.value === "applied" && "bg-blue-400",
                                opt.value === "interviewing" && "bg-amber-400",
                                opt.value === "rejected" && "bg-red-400"
                              )}
                            />
                            {opt.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                      size="sm"
                      className="flex-1 gap-1.5 h-8 text-xs"
                      onClick={() => {
                        if (listing.applyUrl)
                          window.open(listing.applyUrl, "_blank");
                      }}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Apply
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default function SavedPage() {
  return (
    <ProtectedRoute>
      <SavedContent />
    </ProtectedRoute>
  );
}

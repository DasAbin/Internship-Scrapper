"use client";

import type { Listing } from "@/types";
import { cn, getMatchColor, getDeadlineUrgency, formatStipend, getSourceColor } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Heart,
  ExternalLink,
  X,
  MapPin,
  Clock,
  Sparkles,
  Trophy,
  Building2,
  Wifi,
} from "lucide-react";
import { useState } from "react";

interface ListingCardProps {
  listing: Listing;
  onSave: (id: string) => void;
  onApply: (id: string) => void;
  onIgnore: (id: string) => void;
  isSaved?: boolean;
}

export function ListingCard({
  listing,
  onSave,
  onApply,
  onIgnore,
  isSaved = false,
}: ListingCardProps) {
  const [saved, setSaved] = useState(isSaved);
  const [dismissed, setDismissed] = useState(false);
  const deadline = getDeadlineUrgency(listing.deadline);
  const matchColorClass = getMatchColor(listing.matchScore);

  if (dismissed) return null;

  return (
    <div
      className="group glass glass-hover rounded-xl p-5 animate-fade-in relative overflow-hidden"
      id={`listing-${listing.id}`}
    >
      {/* Gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
            <Building2 className="h-5 w-5 text-violet-400" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground truncate group-hover:text-violet-400 transition-colors">
              {listing.title}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {listing.organization}
            </p>
          </div>
        </div>

        {/* Match Score */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border flex-shrink-0 cursor-help",
                matchColorClass
              )}
            >
              <Sparkles className="h-3 w-3" />
              {listing.matchScore}%
            </div>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-[200px]">
            <p className="font-medium mb-1">Match Reasons:</p>
            <ul className="text-xs space-y-0.5">
              {(listing.matchReasons || ["Skills match", "Domain alignment", "Location preference"]).map(
                (reason, i) => (
                  <li key={i} className="flex items-center gap-1">
                    <span className="text-violet-400">•</span> {reason}
                  </li>
                )
              )}
            </ul>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Skill Tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {listing.skillsRequired.slice(0, 4).map((skill) => (
          <span
            key={skill}
            className="px-2 py-0.5 rounded-md text-xs font-medium bg-violet-500/10 text-violet-300 border border-violet-500/20"
          >
            {skill}
          </span>
        ))}
        {listing.skillsRequired.length > 4 && (
          <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground">
            +{listing.skillsRequired.length - 4}
          </span>
        )}
      </div>

      {/* Meta Row */}
      <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
        {/* Location */}
        <span className="flex items-center gap-1 text-muted-foreground">
          {listing.isRemote ? (
            <Wifi className="h-3.5 w-3.5 text-teal-400" />
          ) : (
            <MapPin className="h-3.5 w-3.5" />
          )}
          <span className={listing.isRemote ? "text-teal-400" : ""}>
            {listing.isRemote ? "Remote" : listing.location}
          </span>
        </span>

        {/* Stipend (internship) */}
        {listing.type === "internship" && (listing.stipendMin || listing.stipendMax) && (
          <span className="text-emerald-400 font-medium">
            {formatStipend(listing.stipendMin, listing.stipendMax)}
          </span>
        )}

        {/* Prize Pool (hackathon) */}
        {listing.type === "hackathon" && listing.prizePool && (
          <span className="flex items-center gap-1 text-amber-400 font-medium">
            <Trophy className="h-3.5 w-3.5" />
            {listing.prizePool}
          </span>
        )}

        {/* Deadline */}
        <span className={cn("flex items-center gap-1", deadline.color)}>
          <Clock className="h-3.5 w-3.5" />
          {deadline.text}
          {deadline.urgent && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
        </span>

        {/* Source */}
        <span
          className={cn(
            "px-2 py-0.5 rounded-md text-xs font-medium border",
            getSourceColor(listing.source)
          )}
        >
          {listing.source}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-border/50">
        <Button
          variant={saved ? "default" : "outline"}
          size="sm"
          className={cn(
            "flex-1 gap-1.5",
            saved && "bg-pink-600 hover:bg-pink-700 shadow-none from-pink-600 to-pink-600"
          )}
          onClick={() => {
            setSaved(!saved);
            onSave(listing.id);
          }}
          id={`save-${listing.id}`}
        >
          <Heart className={cn("h-4 w-4", saved && "fill-current")} />
          {saved ? "Saved" : "Save"}
        </Button>
        <Button
          size="sm"
          className="flex-1 gap-1.5"
          onClick={() => onApply(listing.id)}
          id={`apply-${listing.id}`}
        >
          <ExternalLink className="h-4 w-4" />
          Apply
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-red-400 flex-shrink-0"
          onClick={() => {
            setDismissed(true);
            onIgnore(listing.id);
          }}
          id={`ignore-${listing.id}`}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

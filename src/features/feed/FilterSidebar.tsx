"use client";

import type { ListingFilters, DurationFilter } from "@/types";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  Wifi,
  Building,
  MapPin,
} from "lucide-react";
import { useState } from "react";

const DOMAIN_OPTIONS = [
  "AI/ML",
  "Web Dev",
  "Data Science",
  "Mobile",
  "DevOps",
  "Cybersecurity",
  "Blockchain",
  "Cloud",
  "IoT",
  "Design",
];

const SOURCE_OPTIONS = [
  "Internshala",
  "Devpost",
  "MLH",
  "LinkedIn",
  "Unstop",
  "AngelList",
];

const DURATION_OPTIONS: { label: string; value: DurationFilter }[] = [
  { label: "1-3 months", value: "1-3" },
  { label: "3-6 months", value: "3-6" },
  { label: "6+ months", value: "6+" },
];

const TYPE_OPTIONS = [
  { label: "Remote", value: "remote" as const, icon: Wifi },
  { label: "On-site", value: "onsite" as const, icon: Building },
  { label: "Hybrid", value: "hybrid" as const, icon: MapPin },
];

interface FilterSidebarProps {
  filters: ListingFilters;
  onFiltersChange: (filters: ListingFilters) => void;
  isInternship: boolean;
  isMobile?: boolean;
  onClose?: () => void;
}

export function FilterSidebar({
  filters,
  onFiltersChange,
  isInternship,
  isMobile = false,
  onClose,
}: FilterSidebarProps) {
  const updateFilter = <K extends keyof ListingFilters>(
    key: K,
    value: ListingFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayItem = <K extends keyof ListingFilters>(
    key: K,
    item: string
  ) => {
    const current = (filters[key] as string[]) || [];
    const updated = current.includes(item)
      ? current.filter((i) => i !== item)
      : [...current, item];
    updateFilter(key, updated as ListingFilters[K]);
  };

  const clearAll = () => {
    onFiltersChange({});
  };

  const hasFilters = Object.values(filters).some(
    (v) => v !== undefined && (Array.isArray(v) ? v.length > 0 : v !== undefined)
  );

  return (
    <div
      className={cn(
        "space-y-6",
        isMobile
          ? "p-4"
          : "w-72 glass rounded-xl p-5 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold text-sm">
          <SlidersHorizontal className="h-4 w-4 text-violet-400" />
          Filters
        </h3>
        <div className="flex items-center gap-1">
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
          {isMobile && onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Work Type */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Work Type
        </label>
        <div className="flex flex-wrap gap-2">
          {TYPE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const selected = filters.type?.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => toggleArrayItem("type", opt.value)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                  selected
                    ? "bg-violet-500/15 text-violet-400 border-violet-500/30"
                    : "bg-transparent text-muted-foreground border-border hover:border-violet-500/30 hover:text-violet-400"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Domains */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Domains
        </label>
        <div className="flex flex-wrap gap-1.5">
          {DOMAIN_OPTIONS.map((domain) => {
            const selected = filters.domains?.includes(domain);
            return (
              <button
                key={domain}
                onClick={() => toggleArrayItem("domains", domain)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all",
                  selected
                    ? "bg-violet-500/15 text-violet-400 border-violet-500/30"
                    : "bg-transparent text-muted-foreground border-border hover:border-violet-500/30"
                )}
              >
                {domain}
              </button>
            );
          })}
        </div>
      </div>

      {/* Duration (internship only) */}
      {isInternship && (
        <div className="space-y-3">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Duration
          </label>
          <div className="flex flex-wrap gap-2">
            {DURATION_OPTIONS.map((opt) => {
              const selected = filters.duration?.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => toggleArrayItem("duration", opt.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                    selected
                      ? "bg-violet-500/15 text-violet-400 border-violet-500/30"
                      : "bg-transparent text-muted-foreground border-border hover:border-violet-500/30"
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stipend Range (internship only) */}
      {isInternship && (
        <div className="space-y-3">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Min. Stipend
          </label>
          <Slider
            defaultValue={[filters.stipendMin || 0]}
            max={100000}
            step={5000}
            onValueChange={([val]) => updateFilter("stipendMin", val)}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>₹0</span>
            <span className="text-violet-400 font-medium">
              ₹{((filters.stipendMin || 0) / 1000).toFixed(0)}K+
            </span>
            <span>₹100K</span>
          </div>
        </div>
      )}

      {/* Hackathon Mode */}
      {!isInternship && (
        <div className="space-y-3">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Team Mode
          </label>
          <div className="flex gap-2">
            {(["solo", "team", "both"] as const).map((mode) => {
              const selected = filters.hackathonMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() =>
                    updateFilter(
                      "hackathonMode",
                      selected ? undefined : mode
                    )
                  }
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize",
                    selected
                      ? "bg-violet-500/15 text-violet-400 border-violet-500/30"
                      : "bg-transparent text-muted-foreground border-border hover:border-violet-500/30"
                  )}
                >
                  {mode}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Source */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Source
        </label>
        <div className="flex flex-wrap gap-1.5">
          {SOURCE_OPTIONS.map((source) => {
            const selected = filters.sources?.includes(source);
            return (
              <button
                key={source}
                onClick={() => toggleArrayItem("sources", source)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all",
                  selected
                    ? "bg-violet-500/15 text-violet-400 border-violet-500/30"
                    : "bg-transparent text-muted-foreground border-border hover:border-violet-500/30"
                )}
              >
                {source}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/AuthContext";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { Navbar } from "@/components/layout/Navbar";
import { ListingCard } from "@/features/feed/ListingCard";
import { FilterSidebar } from "@/features/feed/FilterSidebar";
import { FeedSkeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getListings, createInteraction } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { ListingType, ListingSort, ListingFilters } from "@/types";
import {
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  Clock,
  Timer,
  DollarSign,
  Inbox,
  RefreshCw,
} from "lucide-react";

const SORT_OPTIONS: { label: string; value: ListingSort; icon: typeof Sparkles }[] = [
  { label: "Best Match", value: "score", icon: Sparkles },
  { label: "Latest", value: "recency", icon: Clock },
  { label: "Deadline", value: "deadline", icon: Timer },
  { label: "Stipend", value: "stipend", icon: DollarSign },
];

function FeedContent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ListingType>("internship");
  const [sort, setSort] = useState<ListingSort>("score");
  const [filters, setFilters] = useState<ListingFilters>({});
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Fetch listings
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["listings", activeTab, sort, page, filters],
    queryFn: () =>
      getListings({
        type: activeTab,
        sort,
        page,
        limit: 20,
        filters,
      }),
  });

  // Interaction mutations
  const interactionMutation = useMutation({
    mutationFn: createInteraction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved"] });
    },
  });

  const handleSave = useCallback(
    (listingId: string) => {
      interactionMutation.mutate(
        { listing_id: listingId, action: "save" },
        {
          onSuccess: () => toast.success("Listing saved!"),
          onError: () => toast.error("Failed to save listing"),
        }
      );
    },
    [interactionMutation]
  );

  const handleApply = useCallback(
    (listingId: string) => {
      const listing = data?.listings.find((l) => l.id === listingId);
      if (listing?.applyUrl) {
        window.open(listing.applyUrl, "_blank");
      }
      interactionMutation.mutate(
        { listing_id: listingId, action: "apply" },
        {
          onSuccess: () => toast.success("Good luck with your application! 🎉"),
        }
      );
    },
    [data, interactionMutation]
  );

  const handleIgnore = useCallback(
    (listingId: string) => {
      interactionMutation.mutate(
        { listing_id: listingId, action: "ignore" },
        {
          onSuccess: () => toast("Listing dismissed", { icon: "👋" }),
        }
      );
    },
    [interactionMutation]
  );

  const handleTabChange = (value: string) => {
    setActiveTab(value as ListingType);
    setPage(1);
    setFilters({});
  };

  const handleFiltersChange = (newFilters: ListingFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="mb-6"
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <TabsList>
              <TabsTrigger value="internship" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Internships
              </TabsTrigger>
              <TabsTrigger value="hackathon" className="gap-2">
                <span className="text-base">🏆</span>
                Hackathons
              </TabsTrigger>
            </TabsList>

            {/* Sort & Mobile Filter Toggle */}
            <div className="flex items-center gap-2">
              {/* Sort */}
              <div className="flex items-center gap-1 glass rounded-lg p-1">
                {SORT_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isActive = sort === opt.value;
                  // Hide stipend sort for hackathons
                  if (opt.value === "stipend" && activeTab === "hackathon")
                    return null;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSort(opt.value);
                        setPage(1);
                      }}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                        isActive
                          ? "bg-violet-500/15 text-violet-400"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Mobile filter toggle */}
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden gap-1.5"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="flex gap-6 mt-6">
            {/* Desktop Filters */}
            <div className="hidden lg:block flex-shrink-0">
              <FilterSidebar
                filters={filters}
                onFiltersChange={handleFiltersChange}
                isInternship={activeTab === "internship"}
              />
            </div>

            {/* Listings */}
            <div className="flex-1 min-w-0">
              <TabsContent value="internship" className="mt-0">
                <ListingsGrid
                  listings={data?.listings || []}
                  isLoading={isLoading}
                  isError={isError}
                  onSave={handleSave}
                  onApply={handleApply}
                  onIgnore={handleIgnore}
                  onRetry={refetch}
                  onAdjustFilters={() => setMobileFiltersOpen(true)}
                />
              </TabsContent>
              <TabsContent value="hackathon" className="mt-0">
                <ListingsGrid
                  listings={data?.listings || []}
                  isLoading={isLoading}
                  isError={isError}
                  onSave={handleSave}
                  onApply={handleApply}
                  onIgnore={handleIgnore}
                  onRetry={refetch}
                  onAdjustFilters={() => setMobileFiltersOpen(true)}
                />
              </TabsContent>

              {/* Pagination */}
              {data && data.hasMore && (
                <div className="flex justify-center mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => p + 1)}
                    className="gap-2"
                  >
                    Load More
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Tabs>

        {/* Mobile Filters Dialog */}
        <Dialog open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Filters</DialogTitle>
            </DialogHeader>
            <FilterSidebar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              isInternship={activeTab === "internship"}
              isMobile
              onClose={() => setMobileFiltersOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

function ListingsGrid({
  listings,
  isLoading,
  isError,
  onSave,
  onApply,
  onIgnore,
  onRetry,
  onAdjustFilters,
}: {
  listings: any[];
  isLoading: boolean;
  isError: boolean;
  onSave: (id: string) => void;
  onApply: (id: string) => void;
  onIgnore: (id: string) => void;
  onRetry: () => void;
  onAdjustFilters: () => void;
}) {
  if (isLoading) {
    return <FeedSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-16 w-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
          <RefreshCw className="h-8 w-8 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
        <p className="text-muted-foreground text-sm mb-4">
          We couldn&apos;t load the listings. Please try again.
        </p>
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-16 w-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
          <Inbox className="h-8 w-8 text-violet-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No listings found</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Try adjusting your filters to see more results
        </p>
        <Button onClick={onAdjustFilters} variant="outline" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Adjust Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          onSave={onSave}
          onApply={onApply}
          onIgnore={onIgnore}
        />
      ))}
    </div>
  );
}

export default function FeedPage() {
  return (
    <ProtectedRoute>
      <FeedContent />
    </ProtectedRoute>
  );
}

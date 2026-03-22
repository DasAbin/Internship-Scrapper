import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getMatchColor(score: number): string {
  if (score >= 75) return "text-match-high bg-match-high/10 border-match-high/30";
  if (score >= 50) return "text-match-medium bg-match-medium/10 border-match-medium/30";
  return "text-match-low bg-match-low/10 border-match-low/30";
}

export function getMatchBgColor(score: number): string {
  if (score >= 75) return "bg-emerald-500";
  if (score >= 50) return "bg-yellow-500";
  return "bg-red-500";
}

export function getDeadlineUrgency(deadline: string): {
  text: string;
  color: string;
  urgent: boolean;
} {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffMs = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: "Expired", color: "text-red-500", urgent: true };
  }
  if (diffDays === 0) {
    return { text: "Today!", color: "text-red-500", urgent: true };
  }
  if (diffDays <= 3) {
    return {
      text: `${diffDays}d left`,
      color: "text-red-400",
      urgent: true,
    };
  }
  if (diffDays <= 7) {
    return {
      text: `${diffDays}d left`,
      color: "text-yellow-400",
      urgent: false,
    };
  }
  if (diffDays <= 30) {
    return {
      text: `${diffDays}d left`,
      color: "text-muted-foreground",
      urgent: false,
    };
  }
  return {
    text: deadlineDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    color: "text-muted-foreground",
    urgent: false,
  };
}

export function formatStipend(min?: number, max?: number): string {
  if (!min && !max) return "";
  const fmt = (n: number) => {
    if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
    return `₹${n}`;
  };
  if (min && max) return `${fmt(min)} - ${fmt(max)}/mo`;
  if (min) return `${fmt(min)}+/mo`;
  return `Up to ${fmt(max!)}/mo`;
}

export function getSourceColor(source: string): string {
  const colors: Record<string, string> = {
    internshala: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    devpost: "bg-teal-500/15 text-teal-400 border-teal-500/30",
    mlh: "bg-red-500/15 text-red-400 border-red-500/30",
    linkedin: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    unstop: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    default: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  };
  return colors[source.toLowerCase()] || colors.default;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    saved: "bg-gray-500/15 text-gray-400",
    applied: "bg-blue-500/15 text-blue-400",
    interviewing: "bg-amber-500/15 text-amber-400",
    rejected: "bg-red-500/15 text-red-400",
  };
  return colors[status] || colors.saved;
}

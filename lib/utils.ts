import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortAddress(value?: string, start = 6, end = 4) {
  if (!value) return "Not connected";
  if (value.length <= start + end) return value;
  return `${value.slice(0, start)}…${value.slice(-end)}`;
}

export function formatDate(value: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  }).format(new Date(value));
}

export function timeUntil(value: string) {
  const diff = new Date(value).getTime() - Date.now();
  if (diff <= 0) return "Voting ended";
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  if (days > 0) return `${days}d ${hours}h remaining`;
  return `${Math.max(hours, 1)}h remaining`;
}

export function proposalParticipation(
  proposal: Pick<
    import("./types").Proposal,
    "yesVotes" | "noVotes" | "abstainVotes" | "memberSnapshot"
  >,
) {
  const total = proposal.yesVotes + proposal.noVotes + proposal.abstainVotes;
  return Math.round((total / Math.max(proposal.memberSnapshot, 1)) * 100);
}

export function explorerUrl(type: "tx" | "address", value: string) {
  return `https://sepolia.etherscan.io/${type}/${value}`;
}

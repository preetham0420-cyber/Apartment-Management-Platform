/**
 * Standardized Date and Timestamp Formatting Utilities for Mobile App
 * Ensures robust handling of ISO strings, epoch numbers, and relative labels
 * without throwing errors or displaying "Invalid Date".
 */

export function parseDateSafe(input: string | number | Date | null | undefined): Date | null {
  if (!input) return null;
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }
  const parsed = new Date(input);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Format timestamp for inside a chat message bubble (e.g. "6:18 PM")
 */
export function formatMessageTime(input: string | number | Date | null | undefined, fallback = "Just now"): string {
  if (!input) return fallback;
  if (typeof input === "string" && (/^\d{1,2}:\d{2}\s*(AM|PM)?$/i.test(input.trim()) || /yesterday|today|just now/i.test(input.trim()))) {
    return input.trim();
  }
  const date = parseDateSafe(input);
  if (!date) return typeof input === "string" ? input : fallback;

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}

/**
 * Format timestamp for channel list conversations:
 * - If today: "6:18 PM"
 * - If yesterday: "Yesterday"
 * - Older: "24 Oct" or "24/10/26"
 */
export function formatConversationTime(input: string | number | Date | null | undefined, fallback = "Today"): string {
  if (!input) return fallback;
  if (typeof input === "string" && (/^\d{1,2}:\d{2}\s*(AM|PM)?$/i.test(input.trim()) || /yesterday|today|just now/i.test(input.trim()))) {
    return input.trim();
  }
  const date = parseDateSafe(input);
  if (!date) return typeof input === "string" ? input : fallback;

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short"
  });
}

/**
 * Format relative time for feeds and comments (e.g. "10 min ago", "2h ago", "Today, 4:15 PM")
 */
export function formatRelativeTime(input: string | number | Date | null | undefined, fallback = "Recently"): string {
  if (!input) return fallback;
  if (typeof input === "string" && (/ago$/i.test(input.trim()) || /yesterday|today|just now/i.test(input.trim()))) {
    return input.trim();
  }
  const date = parseDateSafe(input);
  if (!date) return typeof input === "string" ? input : fallback;

  const now = Date.now();
  const diffMs = now - date.getTime();
  if (diffMs < 0) return "Just now";

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "Just now";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short"
  });
}

/**
 * Format full date & time for ticket timeline & details:
 * e.g. "28 Oct 2026, 11:30 AM" or "Today, 11:30 AM"
 */
export function formatTicketDateTime(input: string | number | Date | null | undefined, fallback = "N/A"): string {
  if (!input) return fallback;
  const date = parseDateSafe(input);
  if (!date) return typeof input === "string" ? input : fallback;

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const timePart = date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });

  if (isToday) {
    return `Today, ${timePart}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return `Yesterday, ${timePart}`;
  }

  const datePart = date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  return `${datePart}, ${timePart}`;
}

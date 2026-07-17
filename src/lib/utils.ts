import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date | undefined | null) {
  if (!date) return "—"
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatDateTime(date: string | Date | undefined | null) {
  if (!date) return "—"
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function relativeTime(date: string | Date) {
  const d = new Date(date).getTime()
  const now = Date.now()
  const diff = Math.round((d - now) / 1000)
  const abs = Math.abs(diff)
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" })
  if (abs < 60) return rtf.format(Math.round(diff), "second")
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute")
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour")
  if (abs < 2592000) return rtf.format(Math.round(diff / 86400), "day")
  return rtf.format(Math.round(diff / 2592000), "month")
}

export function projectProgress(status: string) {
  switch (status) {
    case "completed":
      return 100
    case "active":
      return 60
    case "on-hold":
      return 35
    case "planning":
      return 15
    default:
      return 0
  }
}

export const COMPANY = "digiayudh"

export function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat("en-US").format(n)
}

export function getInitials(name?: string | null) {
  if (!name) return "?";

  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word[0])
    .join("")
    .toUpperCase();
}
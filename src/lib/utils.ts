export function cn(...classes: Array<string | boolean | undefined | null>): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function generateId(): string {
  return crypto.randomUUID();
}

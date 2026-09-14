import { formatINR } from "@/lib/format";

/**
 * Value formatting crosses the server/client boundary as a token, not a
 * callback — a Server Component cannot hand a function to a Client Component.
 */
export type ValueFormat = "number" | "inr";

export const FORMATTERS: Record<ValueFormat, (n: number) => string> = {
  number: (n) => n.toLocaleString("en-IN"),
  inr: (n) => (n === 0 ? "0" : formatINR(n)),
};

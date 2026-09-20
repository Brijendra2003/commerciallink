/**
 * Supabase rejects with a PostgrestError whose useful fields (`message`,
 * `code`) do not survive the dev overlay's serialisation — a failing read logs
 * as a bare `{}`, which says nothing. Flatten to a string at the call site so
 * the console names the actual failure.
 */
export function describeError(error: unknown): string {
  if (!error || typeof error !== "object") return String(error);

  const { message, code, hint } = error as {
    message?: unknown;
    code?: unknown;
    hint?: unknown;
  };

  const text =
    typeof message === "string" && message.length > 0
      ? message
      : error instanceof Error
        ? error.name
        : JSON.stringify(error);

  return [
    text,
    typeof code === "string" && code ? `[${code}]` : "",
    typeof hint === "string" && hint ? `— ${hint}` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

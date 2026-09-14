"use client";

/**
 * Last-resort boundary: catches errors thrown in the root layout itself, where
 * no other error.tsx applies. It replaces the whole document, so it ships its
 * own <html> and inline styles rather than relying on the app's stylesheet.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en-IN">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "2rem",
          background: "#fdfaf5",
          color: "#0a2624",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
        }}
      >
        <main style={{ maxWidth: "30rem", textAlign: "center" }}>
          <p
            style={{
              margin: 0,
              fontSize: "0.6875rem",
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#cf5730",
            }}
          >
            CommercialLink
          </p>
          <h1
            style={{
              margin: "0.75rem 0 0",
              fontSize: "1.75rem",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              fontWeight: 700,
            }}
          >
            Something went badly wrong.
          </h1>
          <p
            style={{
              margin: "1rem 0 0",
              fontSize: "0.9375rem",
              lineHeight: 1.6,
              color: "#2d5a55",
            }}
          >
            The site failed to load. Our desk is still reachable on{" "}
            <a href="tel:+912248901200" style={{ color: "#16544d", fontWeight: 600 }}>
              +91 22 4890 1200
            </a>
            .
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.75rem",
              border: 0,
              borderRadius: "999px",
              background: "#e0653a",
              color: "#fff",
              padding: "0.875rem 1.75rem",
              fontSize: "0.9375rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          {error.digest ? (
            <p
              style={{
                margin: "1.5rem 0 0",
                fontSize: "0.6875rem",
                color: "#7a9691",
              }}
            >
              Reference {error.digest}
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}

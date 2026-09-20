/**
 * Stand-in for a chart with nothing to plot. A blank panel reads as a broken
 * widget; saying so explicitly reads as a young dataset.
 */
export function ChartEmpty({
  message = "No data for this period yet.",
}: {
  message?: string;
}) {
  return (
    <div className="grid min-h-[8rem] place-items-center rounded-lg border border-dashed border-sand-300 px-4 py-8 text-center">
      <p className="text-[0.8125rem] text-ink-300">{message}</p>
    </div>
  );
}

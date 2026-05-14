/**
 * Centered spinning loader.
 * Usage: <Loader /> — fills the available space and centers a spinner.
 */
function Loader() {
  return (
    <div className="flex items-center justify-center w-full min-h-[200px]">
      <div
        className="w-10 h-10 border-4 border-yt-border border-t-yt-blue rounded-full animate-spin"
        role="status"
        aria-label="Loading…"
      />
    </div>
  );
}

export default Loader;

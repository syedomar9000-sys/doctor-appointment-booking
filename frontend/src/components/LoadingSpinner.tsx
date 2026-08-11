/**
 * Full-page loading spinner with animation.
 */

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-rose-100 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="text-gray-400 text-sm font-medium animate-pulse">Loading...</p>
      </div>
    </div>
  );
}

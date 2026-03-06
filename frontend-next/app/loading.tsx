export default function Loading() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-3 border-deepGreen/20 border-t-deepGreen rounded-full animate-spin" />
        <p className="text-charcoal/50 text-sm font-sans">Loading...</p>
      </div>
    </div>
  );
}

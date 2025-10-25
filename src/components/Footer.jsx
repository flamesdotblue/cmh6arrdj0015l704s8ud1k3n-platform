export default function Footer() {
  return (
    <footer className="mt-10 relative z-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 text-center text-white/60 text-sm">
        <p>Signals are generated algorithmically from public Bybit market data and refresh every 5 minutes by default.</p>
        <p className="mt-2">For futures only. Ensure cross/isolated margin and fees are accounted for before execution.</p>
      </div>
    </footer>
  );
}

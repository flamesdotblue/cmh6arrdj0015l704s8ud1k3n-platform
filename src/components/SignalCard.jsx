export default function SignalCard({ signal }) {
  if (signal.error) {
    return (
      <div className="border border-white/10 rounded-xl p-4 bg-white/5">
        <div className="text-white/80 font-semibold">{signal.symbol}</div>
        <div className="text-red-400 text-sm mt-2">{signal.error}</div>
      </div>
    );
  }

  const { symbol, side, entry, tp, sl, leverage, amountUSDT, profitTargetUSDT, riskUSDT, price, change24h, reasoning } = signal;

  return (
    <div className="border border-white/10 rounded-xl p-4 bg-gradient-to-b from-white/5 to-white/[0.03]">
      <div className="flex items-center justify-between">
        <div className="text-white/90 font-semibold text-lg">{side} {symbol}</div>
        <div className={`text-sm ${change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{change24h?.toFixed(2)}% 24h</div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
        <div className="bg-black/30 rounded-lg p-3 border border-white/10">
          <div className="text-white/60">Current Coin Live Market Price (Bybit)</div>
          <div className="text-white font-mono">{price?.toFixed(4)}</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3 border border-white/10">
          <div className="text-white/60">Recommended Amount</div>
          <div className="text-white font-mono">{amountUSDT} USDT @ {leverage}x</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3 border border-white/10">
          <div className="text-white/60">Profit Target / Risk</div>
          <div className="text-white font-mono">{profitTargetUSDT} / {riskUSDT} USDT</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3 border border-white/10">
          <div className="text-white/60">Capital Used</div>
          <div className="text-white font-mono">$20 USDT</div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
        <div className="bg-black/30 rounded-lg p-3 border border-white/10">
          <div className="text-white/60">Entry</div>
          <div className="text-white font-mono">{entry?.toFixed(4)}</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3 border border-white/10">
          <div className="text-white/60">Take Profit</div>
          <div className="text-white font-mono">{tp?.toFixed(4)}</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3 border border-white/10">
          <div className="text-white/60">Stop Loss</div>
          <div className="text-white font-mono">{sl?.toFixed(4)}</div>
        </div>
      </div>

      {reasoning && (
        <div className="mt-3 text-xs text-white/70">{reasoning}</div>
      )}

      <div className="mt-3 text-[11px] text-white/50">
        Not financial advice. Leverage can amplify gains and losses. Manage risk strictly.
      </div>
    </div>
  );
}

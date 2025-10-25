import { useEffect, useMemo, useRef, useState } from 'react';
import SignalCard from './SignalCard';

const BYBIT_BASE = 'https://api.bybit.com';

async function fetchTicker(symbol) {
  const url = `${BYBIT_BASE}/v5/market/tickers?category=linear&symbol=${symbol}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Ticker fetch failed');
  const data = await res.json();
  const item = data?.result?.list?.[0];
  if (!item) throw new Error('No ticker');
  return {
    symbol,
    price: parseFloat(item.lastPrice),
    markPrice: parseFloat(item.markPrice || item.lastPrice),
    change24h: parseFloat(item.price24hPcnt || 0) * 100,
    vol24h: parseFloat(item.turnover24h || 0),
  };
}

async function fetchKlines(symbol, interval = '5', limit = 20) {
  const url = `${BYBIT_BASE}/v5/market/kline?category=linear&symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Klines fetch failed');
  const data = await res.json();
  const list = data?.result?.list || [];
  // Each kline arr per docs: [start, open, high, low, close, volume, turnover]
  return list.map((k) => ({
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
  })).reverse();
}

function computeATR(klines, period = 14) {
  if (klines.length < period + 1) return 0;
  const trs = [];
  for (let i = 1; i < klines.length; i++) {
    const prevClose = klines[i - 1].close;
    const k = klines[i];
    const tr = Math.max(
      k.high - k.low,
      Math.abs(k.high - prevClose),
      Math.abs(k.low - prevClose)
    );
    trs.push(tr);
  }
  const slice = trs.slice(-period);
  const atr = slice.reduce((a, b) => a + b, 0) / slice.length;
  return atr;
}

function sma(values, period) {
  if (values.length < period) return null;
  const slice = values.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

function generateSignal({ symbol, ticker, klines, capital }) {
  const price = ticker.price;
  const closes = klines.map(k => k.close);
  const maFast = sma(closes, 3);
  const maSlow = sma(closes, 9);
  const atr = computeATR(klines, 14);

  // Direction: momentum cross
  let side = 'LONG';
  if (maFast !== null && maSlow !== null) {
    side = maFast >= maSlow ? 'LONG' : 'SHORT';
  }

  // Volatility-adaptive leverage within 20x - 75x
  let lev = 50;
  if (atr > 0) {
    const atrPct = (atr / price) * 100; // percent per 5m
    if (atrPct < 0.15) lev = 75;
    else if (atrPct < 0.3) lev = 60;
    else if (atrPct < 0.6) lev = 45;
    else lev = 30;
  }

  // Target: 100% profit potential on margin using leverage
  // For 100% PnL on margin, required price move ~= 100% / lev
  const requiredMovePct = 100 / lev; // e.g., 2% @ 50x
  const entry = price;
  const tp = side === 'LONG' ? entry * (1 + requiredMovePct / 100) : entry * (1 - requiredMovePct / 100);

  // Risk: half of reward distance or ATR-based stop, whichever tighter
  const halfMovePct = requiredMovePct / 2;
  const atrStopPct = atr > 0 ? (atr / entry) * 100 : halfMovePct;
  const stopPct = Math.min(halfMovePct, Math.max(atrStopPct * 0.8, halfMovePct * 0.6));
  const sl = side === 'LONG' ? entry * (1 - stopPct / 100) : entry * (1 + stopPct / 100);

  // Notional and risk/reward amounts
  const notional = capital * lev;
  const moveToTP = Math.abs(tp - entry) / entry; // fraction
  const moveToSL = Math.abs(entry - sl) / entry; // fraction
  const profitAmount = notional * moveToTP; // approx PnL
  const riskAmount = notional * moveToSL;

  const reasoning = `Momentum ${side === 'LONG' ? 'up' : 'down'}; atr=${atr.toFixed(4)}; rr ${(profitAmount / Math.max(riskAmount, 1e-9)).toFixed(2)}x`;

  return {
    symbol,
    side,
    entry,
    tp,
    sl,
    leverage: lev,
    amountUSDT: capital,
    profitTargetUSDT: Number(profitAmount.toFixed(2)),
    riskUSDT: Number(riskAmount.toFixed(2)),
    price: price,
    change24h: ticker.change24h,
    reasoning,
  };
}

export default function SignalList({ symbols, capital, refreshMs, isAuto }) {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.all(
        symbols.map(async (symbol) => {
          try {
            const [ticker, klines] = await Promise.all([
              fetchTicker(symbol),
              fetchKlines(symbol, '5', 30),
            ]);
            return generateSignal({ symbol, ticker, klines, capital });
          } catch (e) {
            return { symbol, error: e.message };
          }
        })
      );
      setSignals(results);
    } catch (e) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbols, capital]);

  useEffect(() => {
    if (isAuto) {
      timerRef.current = setInterval(load, refreshMs);
      return () => clearInterval(timerRef.current);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {};
  }, [isAuto, refreshMs]);

  const hasErrors = useMemo(() => signals.some(s => s.error), [signals]);

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Live Signals</h2>
        <div className="text-sm text-white/60">Updates every {Math.round(refreshMs/1000)}s {isAuto ? '(auto)' : '(manual)'}
          {!isAuto && (
            <button onClick={load} className="ml-3 rounded-md border border-white/10 bg-white/5 px-2 py-1 hover:bg-white/10">Refresh</button>
          )}
        </div>
      </div>

      {loading && signals.length === 0 ? (
        <div className="text-white/70 text-sm">Loading...</div>
      ) : null}

      {error && (
        <div className="text-red-400 text-sm mb-3">{error}</div>
      )}

      {hasErrors && (
        <div className="text-yellow-400 text-xs mb-3">Some symbols failed to load.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {signals.map((sig) => (
          <SignalCard key={sig.symbol} signal={sig} />
        ))}
      </div>
    </div>
  );
}

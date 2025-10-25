import { useState } from 'react';
import { RefreshCw, Play, Pause, Plus, X } from 'lucide-react';

export default function Controls({ symbols, setSymbols, capital, setCapital, refreshMs, setRefreshMs, isAuto, setIsAuto }) {
  const [input, setInput] = useState('');

  const addSymbol = () => {
    const s = input.trim().toUpperCase();
    if (!s) return;
    if (!s.endsWith('USDT')) return;
    if (symbols.includes(s)) return;
    setSymbols([...symbols, s]);
    setInput('');
  };

  const removeSymbol = (s) => {
    setSymbols(symbols.filter(sym => sym !== s));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAuto(!isAuto)}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10 transition"
            aria-label={isAuto ? 'Pause auto refresh' : 'Start auto refresh'}
          >
            {isAuto ? <Pause size={16} /> : <Play size={16} />}
            <span className="text-sm">{isAuto ? 'Auto: On' : 'Auto: Off'}</span>
          </button>
          <div className="flex items-center gap-2 text-sm text-white/70">
            <RefreshCw size={16} />
            <span>Interval:</span>
            <select
              value={refreshMs}
              onChange={(e) => setRefreshMs(Number(e.target.value))}
              className="bg-black/40 border border-white/10 rounded-md px-2 py-1"
            >
              <option value={60_000}>1m</option>
              <option value={3_00_000}>3m</option>
              <option value={5_00_000}>5m</option>
              <option value={10_00_000}>10m</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm text-white/70">Capital per signal</label>
          <input
            type="number"
            min={5}
            step={1}
            value={capital}
            onChange={(e) => setCapital(Math.max(5, Number(e.target.value) || 0))}
            className="w-24 bg-black/40 border border-white/10 rounded-md px-2 py-1"
          />
          <span className="text-sm text-white/70">USDT</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {symbols.map((s) => (
          <span key={s} className="flex items-center gap-2 text-sm rounded-full border border-white/10 bg-white/5 px-3 py-1">
            {s}
            <button onClick={() => removeSymbol(s)} aria-label={`Remove ${s}`} className="opacity-70 hover:opacity-100">
              <X size={14} />
            </button>
          </span>
        ))}
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add SYMBOLUSDT"
            className="bg-black/40 border border-white/10 rounded-md px-3 py-1 text-sm"
          />
          <button onClick={addSymbol} className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 hover:bg-white/10 transition">
            <Plus size={16} />
            <span className="text-sm">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}

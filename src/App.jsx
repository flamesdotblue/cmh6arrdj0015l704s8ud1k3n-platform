import { useState } from 'react';
import Hero from './components/Hero';
import Controls from './components/Controls';
import SignalList from './components/SignalList';
import Footer from './components/Footer';

export default function App() {
  const [symbols, setSymbols] = useState(["BTCUSDT", "ETHUSDT", "SOLUSDT", "XRPUSDT"]);
  const [capital, setCapital] = useState(20);
  const [refreshMs, setRefreshMs] = useState(5 * 60 * 1000);
  const [isAuto, setIsAuto] = useState(true);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Hero />
      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 -mt-24">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl">
          <Controls
            symbols={symbols}
            setSymbols={setSymbols}
            capital={capital}
            setCapital={setCapital}
            refreshMs={refreshMs}
            setRefreshMs={setRefreshMs}
            isAuto={isAuto}
            setIsAuto={setIsAuto}
          />
          <SignalList symbols={symbols} capital={capital} refreshMs={refreshMs} isAuto={isAuto} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

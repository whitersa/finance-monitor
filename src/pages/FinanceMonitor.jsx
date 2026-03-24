import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchPrices, fetchHistory } from '../services/api'
import PriceCard from '../components/PriceCard'
import Ticker from '../components/Ticker'
import MacroSentiment from '../components/MacroSentiment'
import { Activity, ArrowLeft, RefreshCw } from 'lucide-react'
import './Home.css'
import './FinanceMonitor.css'

function FinanceMonitor() {
  const [prices, setPrices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  
  const [selectedSymbol, setSelectedSymbol] = useState(null)
  const [historyData, setHistoryData] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const loadData = async () => {
    if (prices.length === 0) setLoading(true);
    setError(null);

    try {
      const data = await fetchPrices();
      setPrices(data);
      setLastUpdated(new Date());
      
      if (!selectedSymbol && data.length > 0) {
          setSelectedSymbol(data[0]);
      } else if (selectedSymbol) {
          const updated = data.find(item => item.id === selectedSymbol.id);
          if (updated) setSelectedSymbol(updated);
      }
    } catch (err) {
      setError("FAILED TO ACQUIRE DATA STREAM");
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (symbol) => {
    if (!symbol) return;
    setHistoryLoading(true);
    setHistoryData([]); // CLEAR OLD DATA IMMEDIATELY
    try {
        const data = await fetchHistory(symbol.id);
        if (data && data.length > 0) {
            setHistoryData(data);
        } else {
            setHistoryData([]); // EXPLICIT NULL STATE
        }
    } catch (err) {
        console.error("Failed history:", err);
    } finally {
        setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedSymbol) {
        loadHistory(selectedSymbol);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSymbol?.id]);

  const getHistoricalChange = (tradingDaysAgo) => {
    if (!historyData || historyData.length === 0) return null;
    const targetIdx = Math.max(0, historyData.length - tradingDaysAgo);
    const startPrice = historyData[targetIdx].open;
    const endPrice = selectedSymbol.price;
    const diff = endPrice - startPrice;
    const pct = (diff / startPrice) * 100;
    return {
      diff: Number(diff.toFixed(2)),
      pct: Number(pct.toFixed(2)),
      isUp: diff >= 0,
      label: tradingDaysAgo === 250 ? '1 YEAR' : tradingDaysAgo === 65 ? '3 MONTHS' : '1 MONTH'
    };
  };

  const volatilityStats = [
    { label: 'TODAY (1D)', stats: selectedSymbol ? { diff: selectedSymbol.change, pct: selectedSymbol.changePercent, isUp: selectedSymbol.isUp } : null },
    { label: '1 MONTH', stats: getHistoricalChange(22) },
    { label: '3 MONTHS', stats: getHistoricalChange(65) },
    { label: '1 YEAR', stats: getHistoricalChange(250) }
  ];

  return (
    <div className="app-shell">
      {/* LEFT: Sidebar Watchlist */}
      <aside className="shell-sidebar terminal-sidebar">
        <div className="terminal-watchlist">
          {loading && prices.length === 0 ? (
            <div className="sidebar-initial">INITIALIZING...</div>
          ) : (
            prices.map(item => (
              <div key={item.id} onClick={() => setSelectedSymbol(item)} className="card-wrapper">
                <PriceCard data={item} isActive={selectedSymbol?.id === item.id} />
              </div>
            ))
          )}
        </div>
      </aside>

      {/* RIGHT: Main Panel (Header + Content) */}
      <div className="shell-main">
        <header className="shell-header">
           <div className="breadcrumb">
             <Link to="/" className="back-link-icon"><ArrowLeft size={18}/></Link>
             <span className="separator">/</span>
             <span className="root">~</span>
             <span className="separator">/</span>
             <span className="current-path highlight">macro-terminal</span>
           </div>
           
           <div className="terminal-status">
              <span className="time-display">{lastUpdated ? lastUpdated.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : 'SYNC'}</span>
           </div>
        </header>

        <main className="shell-content terminal-content">
           {selectedSymbol ? (
               <div className="macro-dashboard">
                   {/* HERO SECTION */}
                   <div className="price-hero">
                       <div className="hero-meta">
                           <h2>{selectedSymbol.name} <span className="symbol-id">{selectedSymbol.id}</span></h2>
                           <span className="live-tag">LIVE</span>
                       </div>
                       <div className="hero-price">
                           <span className="main-price">
                               {selectedSymbol.symbol || '¥'}{selectedSymbol.price.toFixed(2)}
                           </span>
                           <span className="main-unit">{selectedSymbol.unit}</span>
                       </div>
                   </div>

                    {/* MACRO SENTIMENT PANEL */}
                    <MacroSentiment prices={prices} />

                    {/* VOLATILITY GRID */}
                    <div className="volatility-grid">
                        {volatilityStats.map((item, idx) => {
                            const isFetching = historyLoading && idx > 0;
                            return (
                                <div key={idx} className={`vol-block ${isFetching ? 'is-fetching' : ''}`}>
                                    <div className="vol-header">
                                        <span className="vol-label">{item.label}</span>
                                        {isFetching && <RefreshCw size={12} className="spin-icon"/>}
                                    </div>
                                    <div className={`vol-value ${item.stats ? (item.stats.isUp ? 'up' : 'down') : 'muted'}`}>
                                        <span className="vol-pct">
                                            {item.stats ? `${item.stats.pct > 0 ? '+' : ''}${item.stats.pct}%` : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                   </div>

                   <Ticker currentSymbol={selectedSymbol} stats={volatilityStats} />
               </div>
           ) : (
               (!loading || prices.length > 0) && <div className="no-selection">SELECT INSTRUMENT</div>
           )}
        </main>
      </div>
    </div>
  )
}

export default FinanceMonitor

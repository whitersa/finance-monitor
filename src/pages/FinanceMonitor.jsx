import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchPrices, fetchHistory } from '../services/api'
import PriceCard from '../components/PriceCard'
import ChartComponent from '../components/ChartComponent'
import { RefreshCw, Activity, ArrowLeft } from 'lucide-react'
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
      setError("数据获取失败，正在重试...");
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (symbol) => {
      if (!symbol) return;
      setHistoryLoading(true);
      try {
          const data = await fetchHistory(symbol.id);
          setHistoryData(data);
      } catch (err) {
          console.error(err);
      } finally {
          setHistoryLoading(false);
      }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // 30s update
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
      if (selectedSymbol) {
          loadHistory(selectedSymbol);
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSymbol?.id]);

  const handleCardClick = (item) => {
      if (selectedSymbol?.id !== item.id) {
          setSelectedSymbol(item);
      }
  };

  return (
    <div className="finance-app-container">
      <header className="finance-app-header">
        <Link to="/" className="back-link">
          <ArrowLeft size={18} />
          <span>Home</span>
        </Link>
        <h1 className="finance-app-title">TERMINAL <span>V1.0</span></h1>
        <div className="status-bar">
          <Activity size={16} className={loading && prices.length > 0 ? "spin-icon" : "pulse-icon"} color="#34d399" />
          <div className="status-text">
            <span>Market Live</span>
            {lastUpdated && (
              <span className="last-updated">
                {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="dashboard-layout">
        {loading && prices.length === 0 ? (
          <div className="loading-state">
            <RefreshCw className="spin-icon large" />
            <p>INITIALIZING TERMINAL...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
          </div>
        ) : (
          <>
            <aside className="sidebar">
              <div className="sidebar-header">
                <h3>WATCHLIST</h3>
              </div>
              <div className="watchlist-scroll">
                {prices.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => handleCardClick(item)} 
                    className={`card-wrapper`}
                  >
                      <PriceCard data={item} isActive={selectedSymbol?.id === item.id} />
                  </div>
                ))}
              </div>
            </aside>
            
            <section className="main-view">
              {selectedSymbol && (
                <div className="chart-section">
                    <div className="chart-header">
                        <div className="chart-title">
                            <h2>{selectedSymbol.name} <span className="symbol-id">{selectedSymbol.id}</span></h2>
                        </div>
                        <div className="chart-stats">
                           <span className="stat-value">{selectedSymbol.symbol || '$'}{selectedSymbol.price}</span>
                           <span className={`stat-change ${selectedSymbol.isUp ? 'up' : 'down'}`}>
                             {selectedSymbol.change > 0 ? '+' : ''}{selectedSymbol.change}%
                           </span>
                        </div>
                        {historyLoading && <span className="loading-text"><RefreshCw className="spin-icon" size={14}/></span>}
                    </div>
                    <div className="chart-container-box">
                        {historyData.length > 0 ? (
                            <ChartComponent 
                              data={historyData} 
                              symbolName={selectedSymbol.name}
                              colors={{ backgroundColor: 'transparent' }} 
                            />
                        ) : (
                            !historyLoading && <p className="no-data">NO HISTORY DATA</p>
                        )}
                    </div>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}

export default FinanceMonitor

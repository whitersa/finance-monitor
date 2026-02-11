import { useState, useEffect } from 'react'
import { fetchPrices, fetchHistory } from './services/api'
import PriceCard from './components/PriceCard'
import ChartComponent from './components/ChartComponent'
import { RefreshCw, TrendingUp } from 'lucide-react'
import './App.css'

function App() {
  const [prices, setPrices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  
  const [selectedSymbol, setSelectedSymbol] = useState(null)
  const [historyData, setHistoryData] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const loadData = async () => {
    // Only show full loading state on initial load
    if (prices.length === 0) setLoading(true);
    setError(null);

    try {
      const data = await fetchPrices();
      setPrices(data);
      setLastUpdated(new Date());
      
      // Select first symbol by default if none selected
      if (!selectedSymbol && data.length > 0) {
          setSelectedSymbol(data[0]);
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
    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Reload history when selected symbol changes
  useEffect(() => {
      if (selectedSymbol) {
          loadHistory(selectedSymbol);
      }
  }, [selectedSymbol]);

  const handleCardClick = (item) => {
      setSelectedSymbol(item);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">贵金属实时监控</h1>
        <div className="status-bar">
          {lastUpdated && (
            <span className="last-updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          {loading && prices.length > 0 && <RefreshCw className="spin-icon" size={16} />}
        </div>
      </header>

      <main className="main-content">
        {loading && prices.length === 0 && (
          <div className="loading-state">
            <RefreshCw className="spin-icon large" />
            <p>Connecting to Market Data...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <p>{error}</p>
          </div>
        )}

        <div className="cards-grid">
          {prices.map(item => (
            <div key={item.id} onClick={() => handleCardClick(item)} className={`card-wrapper ${selectedSymbol?.id === item.id ? 'active' : ''}`} style={{cursor: 'pointer'}}>
                <PriceCard data={item} />
            </div>
          ))}
        </div>
        
        {selectedSymbol && (
            <div className="chart-section">
                <div className="chart-header">
                    <h2><TrendingUp size={20} /> {selectedSymbol.name} ({selectedSymbol.id}) 历史走势</h2>
                    {historyLoading && <span className="loading-text">加载中...</span>}
                </div>
                <div className="chart-container-box">
                    {historyData.length > 0 ? (
                        <ChartComponent data={historyData} colors={{ backgroundColor: '#212121' }} />
                    ) : (
                        !historyLoading && <p className="no-data">暂无历史数据</p>
                    )}
                </div>
            </div>
        )}

      </main>
    </div>
  )
}

export default App

import { useState, useEffect } from 'react'
import { fetchPrices } from './services/api'
import PriceCard from './components/PriceCard'
import { RefreshCw } from 'lucide-react'
import './App.css'

function App() {
  const [prices, setPrices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const loadData = async () => {
    // Only show full loading state on initial load
    if (prices.length === 0) setLoading(true);
    setError(null);

    try {
      const data = await fetchPrices();
      setPrices(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError("数据获取失败，正在重试...");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

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
            <PriceCard key={item.id} data={item} />
          ))}
        </div>

      </main>
    </div>
  )
}

export default App

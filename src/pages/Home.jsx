import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, BookOpen, Coffee, Code, Terminal, Cloud, Thermometer, Wind, Loader2 } from 'lucide-react';
import './Home.css';

// Open-Meteo WMO Code interpretation
const interpretWeatherCode = (code) => {
  if (code === 0) return "CLEAR SKY";
  if (code >= 1 && code <= 3) return "CLOUDY";
  if (code >= 45 && code <= 48) return "FOGGY";
  if (code >= 51 && code <= 67) return "RAINING";
  if (code >= 71 && code <= 77) return "SNOWING";
  if (code >= 80 && code <= 82) return "SHOWERS";
  if (code >= 95) return "THUNDERSTORM";
  return "UNKNOWN";
};

const Home = () => {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    // Fetch free weather data for Shanghai via Open-Meteo API
    fetch('https://api.open-meteo.com/v1/forecast?latitude=31.22&longitude=121.48&current=temperature_2m,wind_speed_10m,weather_code&timezone=Asia%2FShanghai')
      .then(res => res.json())
      .then(data => {
        if(data && data.current) {
          setWeather({
            temp: data.current.temperature_2m,
            wind: data.current.wind_speed_10m,
            condition: interpretWeatherCode(data.current.weather_code)
          });
        }
      })
      .catch(err => console.error("Failed to fetch weather data", err));
  }, []);

  return (
    <div className="app-shell">
      {/* Structural Region 1: Pitch Black Context Sidebar */}
      <aside className="shell-sidebar">
        
        {/* Top Header strictly 64px to align horizontally with shell-header */}
        <div className="sidebar-header">
          <Terminal size={20} className="brand-icon" />
          <h1 className="site-name">Issa</h1>
        </div>
        
        {/* The rest of the sidebar content */}
        <div className="sidebar-content">
          <div className="system-metrics">
            <div className="metric-item">
              <span className="metric-label">METEROLOGY</span>
              <span className="metric-value safe">
                {weather ? <><Cloud size={14}/> {weather.condition} {weather.temp}°C</> : <Loader2 size={14} className="spin-icon" />}
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">WIND SPD</span>
              <span className="metric-value">
                <Wind size={14}/> {weather ? `${weather.wind} km/h` : '--'}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Structural Region 2: Main Application Canvas */}
      <div className="shell-main">
        {/* Structural Region 2A: Top Command Bar */}


        {/* Structural Region 2B: The Module Grid */}
        <main className="shell-content">
          <div className="home-grid">
            <Link to="/finance" className="portal-card">
              <div className="card-top">
                <div className="card-icon">
                  <Activity size={22} strokeWidth={2.5} />
                </div>
              </div>
              <div className="card-info">
                <h2>Financial Terminal</h2>
                <p>Real-time precious metals monitoring interface with SGE data streams.</p>
              </div>
            </Link>
            
            <div className="portal-card coming-soon">
              <div className="card-top">
                <div className="card-icon"><BookOpen size={22} strokeWidth={2.5} /></div>
              </div>
              <div className="card-info">
                <h2>Knowledge Base</h2>
                <p>Technical documentation, system architectures, and daily engineering logs.</p>
              </div>
            </div>

            <div className="portal-card coming-soon">
              <div className="card-top">
                <div className="card-icon"><Code size={22} strokeWidth={2.5} /></div>
              </div>
              <div className="card-info">
                <h2>Open Source</h2>
                <p>Public repositories, internal tools, and deployed infrastructure.</p>
              </div>
            </div>

            <div className="portal-card coming-soon">
              <div className="card-top">
                <div className="card-icon"><Coffee size={22} strokeWidth={2.5} /></div>
              </div>
              <div className="card-info">
                <h2>Identity</h2>
                <p>Contact information, PGP keys, and social protocols.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;

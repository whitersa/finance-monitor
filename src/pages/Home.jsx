import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, BookOpen, Coffee, Code, ExternalLink } from 'lucide-react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <header className="home-hero">
        <div className="hero-content">
          <div className="avatar-placeholder">LB</div>
          <h1>Welcome to my <span>Digital Garden</span></h1>
          <p>Thoughts on technology, personal finance, and life.</p>
        </div>
      </header>
      
      <main className="home-grid">
        <Link to="/finance" className="portal-card finance-card">
          <div className="card-top">
            <div className="card-icon">
              <Activity size={32} />
            </div>
            <ExternalLink className="external-icon" size={20} />
          </div>
          <div className="card-info">
            <h2>Financial Terminal</h2>
            <p>Real-time precious metals monitoring interface with historical charts.</p>
          </div>
        </Link>
        
        <div className="portal-card coming-soon">
          <div className="card-top">
            <div className="card-icon"><BookOpen size={32} /></div>
          </div>
          <div className="card-info">
            <h2>My Notes & Blog</h2>
            <p>Deep dives into programming, algorithms, and daily thoughts. (Coming Soon)</p>
          </div>
        </div>

        <div className="portal-card coming-soon">
          <div className="card-top">
            <div className="card-icon"><Code size={32} /></div>
          </div>
          <div className="card-info">
            <h2>Open Source</h2>
            <p>Tools, libraries, and experiments that I have built. (Coming Soon)</p>
          </div>
        </div>

        <div className="portal-card coming-soon">
          <div className="card-top">
            <div className="card-icon"><Coffee size={32} /></div>
          </div>
          <div className="card-info">
            <h2>About Me</h2>
            <p>Who am I, what do I do, and how to reach out. (Coming Soon)</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;

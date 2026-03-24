/**
 * API Service - Frontend data fetching layer
 * Calls the Python serverless backend at /api/prices
 */

const API_URL = '/api/prices';

// Fallback mock data for development without backend
const mockData = () => [
  {
    id: 'AU9999', name: '黄金', nameEn: 'Gold',
    price: 680.50, change: 2.30, changePercent: 0.34,
    isUp: true, symbol: '¥', unit: '/g', source: 'Mock'
  },
  {
    id: 'AG9999', name: '白银', nameEn: 'Silver',
    price: 8.25, change: -0.05, changePercent: -0.60,
    isUp: false, symbol: '¥', unit: '/g', source: 'Mock'
  },
];

export const fetchPrices = async () => {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      console.error(`API Error: ${response.status}`);
      throw new Error(`API returned ${response.status}`);
    }

    const json = await response.json();

    if (!json.success || !json.data || json.data.length === 0) {
      console.warn('API returned no data, using mock data');
      return mockData();
    }

    return json.data;
  } catch (error) {
    console.error('Failed to fetch prices:', error);
    // Return mock data in development, throw in production
    if (import.meta.env.DEV) {
      console.warn('Using mock data for development');
      return mockData();
    }
  }
};

export const fetchHistory = async (symbol) => {
  const KLINE_URL = `/api/kline?code=${symbol}`;
  try {
    const response = await fetch(KLINE_URL);
    if (!response.ok) throw new Error('Network response was not ok');
    const json = await response.json();
    if (json.success && json.data) return json.data;
    return [];
  } catch (error) {
    console.warn(`Failed to fetch history for ${symbol}:`, error);
    return [];
  }
};


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
    isUp: true, symbol: '¥', unit: '/克', source: 'Mock'
  },
  {
    id: 'SI00Y', name: '白银', nameEn: 'Silver',
    price: 32.25, change: -0.05, changePercent: -0.60,
    isUp: false, symbol: '$', unit: '/盎司', source: 'Mock'
  },
  {
    id: 'BK0475', name: '银行', nameEn: 'Banking',
    price: 1050.20, change: 12.50, changePercent: 1.20,
    isUp: true, symbol: '', unit: '点', source: 'Mock'
  },
  {
    id: 'BK0450', name: '电力', nameEn: 'Power',
    price: 2340.80, change: -15.20, changePercent: -0.65,
    isUp: false, symbol: '', unit: '点', source: 'Mock'
  },
  {
    id: 'BK1039', name: '中药', nameEn: 'TCM',
    price: 1890.40, change: 5.40, changePercent: 0.28,
    isUp: true, symbol: '', unit: '点', source: 'Mock'
  }
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
    if (import.meta.env.DEV) {
      console.warn('Using mock data for development');
      return mockData();
    }
    return [];
  }
};

export const fetchHistory = async (symbol) => {
    // Both 'code' and 'symbol' are now acceptable by kline.py
    const KLINE_URL = `/api/kline?symbol=${symbol}`;
    try {
      const response = await fetch(KLINE_URL);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      // Backend returns raw array, not {success: true, data: [...]}
      if (Array.isArray(data)) return data;
      return [];
    } catch (error) {
      console.warn(`Failed to fetch history for ${symbol}:`, error);
      return [];
    }
  };


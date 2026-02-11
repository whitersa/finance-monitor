const API_KEY = import.meta.env.VITE_ITICK_API_KEY;

// API Endpoints
// Symbol List: https://api.itick.org/symbol/list?type=forex&region=GLOBAL&code=XAUUSD
// K-Line: https://api.itick.org/future/kline?region=GLOBAL&code=XAUUSD&kType=8&limit=30
const KLINE_URL = 'https://api.itick.org/forex/kline';

let lastCallTime = 0;
// Free tier limit: 5 calls / minute. 
// We fetch 2 symbols (Gold, Silver) -> 2 calls per update.
// Max updates = 2.5 per minute. 
// Safe interval = 60000ms (1 update/min).
const MIN_INTERVAL = 60000; 

const SYMBOLS = [
  { code: 'XAUUSD', name: 'Gold' },
  { code: 'XAGUSD', name: 'Silver' },
  { code: 'USDCNH', name: 'USD/CNH' }
];

export const fetchPrices = async () => {
  const now = Date.now();
  const timeSinceLast = now - lastCallTime;

  if (timeSinceLast < MIN_INTERVAL) {
    const wait = MIN_INTERVAL - timeSinceLast;
    console.log(`[RateLimit] Waiting ${wait}ms before next call...`);
    await new Promise(resolve => setTimeout(resolve, wait));
  }

  // Update lastCallTime
  lastCallTime = Date.now();

  if (!API_KEY) {
    console.warn("No VITE_ITICK_API_KEY found. Using mock data.");
    return mockData();
  }

  try {
    const promises = SYMBOLS.map(sym => fetchSymbolData(sym));
    const rawResults = await Promise.all(promises);
    const results = rawResults.filter(Boolean);

    // Find USDCNH rate
    const usdcnh = results.find(r => r.id === 'USDCNH');
    const rate = usdcnh ? usdcnh.rawPrice : null;

    if (rate) {
        // Convert Gold (XAUUSD) and Silver (XAGUSD) to RMB/g 
        // 1 Troy Ounce = 31.1035 grams
        
        results.forEach(item => {
            if (item.id === 'XAUUSD' || item.id === 'XAGUSD') {
                 // Store original USD values
                const originalPrice = item.price;
                const originalChange = item.change;
                const originalChangePercent = item.changePercent;
                const originalIsUp = item.isUp;

                // Calculate RMB values
                const priceRmb = (item.rawPrice * rate) / 31.1035;
                const prevRmb = (item.rawPrevClose * rate) / 31.1035;
                const changeRmb = priceRmb - prevRmb;
                const changePercentRmb = (changeRmb / prevRmb) * 100;

                // Update primary display to RMB
                item.price = priceRmb.toFixed(2);
                item.change = changeRmb.toFixed(2);
                item.changePercent = changePercentRmb.toFixed(2);
                item.symbol = '¥';
                item.unit = '/g';
                item.name = item.name; // Keep name properly
                item.isUp = changeRmb >= 0;

                // Add secondary display (USD)
                item.secondary = {
                    price: originalPrice,
                    change: originalChangePercent,
                    changePercent: originalChangePercent, 
                    isUp: originalIsUp,
                    symbol: '$',
                    unit: '/oz'
                };
            }
        });
    }

    // Return results excluding USDCNH (unless user wants to see it? limiting to metals as per app title)
    return results.filter(r => r.id !== 'USDCNH');
  } catch (error) {
    console.error("Failed to fetch prices:", error);
    throw error;
  }
};

const fetchSymbolData = async ({ code, name }) => {
  try {
    // kType=8 (Day K-Line), limit=7 (1 week data)
    // Changing region to GB as GLOBAL returns no data
    const url = `${KLINE_URL}?region=GB&code=${code}&kType=8&limit=7`;
    
    const response = await fetch(url, {
      headers: {
        'token': API_KEY,
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`API Error for ${code}: ${response.status}`);
      return null;
    }

    const json = await response.json();
    
    // Check if successful response
    // iTick usually returns { code: 0, msg: 'OK', data: [...] }
    if (json.code !== 0 && json.code !== '0') {
      console.error(`API returned error for ${code}:`, json);
      return null;
    }
    
    if (!json.data || json.data.length < 2) {
      console.warn(`Insufficient data for ${code}`);
      return null;
    }

    return transformKlineData(code, name, json.data);
  } catch (err) {
    console.error(`Error fetching ${code}:`, err);
    return null;
  }
};

const transformKlineData = (code, name, klineData) => {
  // Data is array of objects, usually sorted by time ascending?
  // User example: "data": [ { tu: timestamp, c: close ... } ... ]
  // Assuming last item is latest.
  const latest = klineData[klineData.length - 1];
  const prev = klineData[klineData.length - 2]; // Yesterday
  
  // Basic sanity check
  if (!latest || !prev) return null;

  const currentPrice = parseFloat(latest.c);
  // Change calculation: Today's Current/Close - Yesterday's Close
  const prevClose = parseFloat(prev.c);
  
  const change = currentPrice - prevClose;
  const changePercent = (change / prevClose) * 100;

  return {
    id: code,
    name: name,
    price: currentPrice.toFixed(2),
    change: change.toFixed(2),
    changePercent: changePercent.toFixed(2),
    isUp: change >= 0,
    rawPrice: currentPrice,
    rawPrevClose: prevClose,
    unit: code === 'XAGUSD' ? '/oz' : '' // Add unit for silver too
  };
};

const mockData = () => {
  return [
    { id: 'XAUUSD', name: 'Gold', price: '2034.50', change: '+12.30', changePercent: '+0.60', isUp: true },
    { id: 'XAGUSD', name: 'Silver', price: '22.85', change: '-0.15', changePercent: '-0.65', isUp: false },
  ];
};

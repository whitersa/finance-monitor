import json
import urllib.request
import urllib.parse
import time
from http.server import BaseHTTPRequestHandler

EASTMONEY_KLINE_API = "https://push2his.eastmoney.com/api/qt/stock/kline/get"

SYMBOL_MARKET = {
    "AU9999": "118", # SGE Gold
    "SI00Y":  "102", # COMEX Silver
    "HG00Y":  "102", # COMEX Copper
    "CL00Y":  "102", # NYMEX Crude
    "BK0475": "90",  # Banking Sector
    "BK0450": "90",  # Power Sector
    "BK1039": "90",  # TCM Sector
}
DEFAULT_MARKET = "102"
SYMBOL_DIVISORS = {}

def safe_float(val, divisor=1):
    if val is None or val == "-": return 0
    try:
        return float(val) / divisor
    except (ValueError, TypeError):
        return 0

def fetch_history(symbol_id):
    market_id = SYMBOL_MARKET.get(symbol_id, DEFAULT_MARKET)
    
    # 250 days for 1Y, 65 for 3M, 22 for 1M
    params = {
        "secid": f"{market_id}.{symbol_id}",
        "ut": "fa5fd1943c7b386f172d6893dbf24410",
        "fields1": "f1,f2,f3,f4,f5,f6",
        "fields2": "f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61",
        "klt": "101", # Daily
        "fqt": "1",
        "end": "20500101",
        "lmt": "300",
    }
    
    url = f"{EASTMONEY_KLINE_API}?{urllib.parse.urlencode(params)}"
    headers = {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1",
        "Referer": "https://wap.eastmoney.com/",
    }
    
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=10) as response:
        data = json.loads(response.read().decode("utf-8"))

    if not data or "data" not in data or not data["data"]:
        return []

    klines = data["data"].get("klines", [])
    results = []
    
    divisor = SYMBOL_DIVISORS.get(symbol_id, 1)

    for k in klines:
        parts = k.split(",")
        if len(parts) < 11: continue
        
        results.append({
            "date": parts[0],
            "open": safe_float(parts[1], divisor),
            "close": safe_float(parts[2], divisor),
            "high": safe_float(parts[3], divisor),
            "low": safe_float(parts[4], divisor),
            "vol": safe_float(parts[5]),
            "pct": safe_float(parts[8])
        })
        
    return results

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        params = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        # Handle both 'symbol' (internal) and 'code' (frontend legacy/alternative)
        symbol = params.get('symbol', [params.get('code', [''])[0]])[0]
        
        if not symbol:
            self.send_response(400)
            self.end_headers()
            return

        try:
            data = fetch_history(symbol)
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(data).encode('utf-8'))
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(str(e).encode('utf-8'))

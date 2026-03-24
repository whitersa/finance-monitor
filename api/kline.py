import json
import urllib.request
import urllib.parse
from urllib.parse import parse_qs, urlparse
from http.server import BaseHTTPRequestHandler
import calendar
from datetime import datetime

EASTMONEY_KLINE_API = "https://push2his.eastmoney.com/api/qt/stock/kline/get"

SYMBOL_MARKET = {
    "AU9999": "118", # SGE
    "SI00Y":  "102", # COMEX Silver
    "HG00Y":  "102", # COMEX Copper
    "CL00Y":  "102", # NYMEX Crude
}
DEFAULT_MARKET = "102"

SYMBOL_DIVISORS = {}

def fetch_kline_data(code, klt="101", lmt="250"):
    market_id = SYMBOL_MARKET.get(code, DEFAULT_MARKET)
    divisor = SYMBOL_DIVISORS.get(code, 1)
    secid = f"{market_id}.{code}"
    params = {
        "secid": secid,
        "fields1": "f1,f2,f3,f4,f5,f6",
        "fields2": "f51,f52,f53,f54,f55,f57",
        "klt": klt,
        "fqt": "1",
        "end": "20500101",
        "lmt": lmt,
    }

    url = f"{EASTMONEY_KLINE_API}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": "https://quote.eastmoney.com/",
    })

    with urllib.request.urlopen(req, timeout=10) as response:
        raw_data = response.read().decode("utf-8")
        data = json.loads(raw_data)

    chart_data = []
    if data and data.get("data") and data["data"].get("klines"):
        for line in data["data"]["klines"]:
            parts = line.split(",")
            if len(parts) >= 5:
                chart_data.append({
                    "date": parts[0],
                    "open": round(float(parts[1]) / divisor, 2),
                    "close": round(float(parts[2]) / divisor, 2),
                    "high": round(float(parts[3]) / divisor, 2),
                    "low": round(float(parts[4]) / divisor, 2),
                })
    return chart_data

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)
        query_params = parse_qs(parsed_path.query)
        code = query_params.get("code", [None])[0]
        
        if not code:
            self.send_response(400)
            self.end_headers()
            return
            
        try:
            # We enforce returning the last 250 daily bars!
            chart_data = fetch_kline_data(code, klt="101", lmt="260")
            response_data = {"success": True, "data": chart_data}
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode("utf-8"))
        except Exception as exc:
            self.send_response(500)
            self.end_headers()


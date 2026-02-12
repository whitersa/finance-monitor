import json
import urllib.request
import urllib.parse
from urllib.parse import parse_qs, urlparse
from http.server import BaseHTTPRequestHandler

# East Money K-Line API
# https://push2his.eastmoney.com/api/qt/stock/kline/get
EASTMONEY_KLINE_API = "https://push2his.eastmoney.com/api/qt/stock/kline/get"

# Market ID for Shanghai Gold Exchange is 118
MARKET_ID = "118"

def fetch_kline_data(code):
    secid = f"{MARKET_ID}.{code}"
    params = {
        "secid": secid,
        "fields1": "f1,f2,f3,f4,f5,f6",
        "fields2": "f51,f52,f53,f54,f55,f57",  # Date, Open, Close, High, Low, Volume
        "klt": "101",  # Daily
        "fqt": "1",
        "end": "20500101",
        "lmt": "200",
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
        klines = data["data"]["klines"]
        for line in klines:
            parts = line.split(",")
            if len(parts) >= 5:
                chart_data.append({
                    "time": parts[0],
                    "open": float(parts[1]),
                    "close": float(parts[2]),
                    "high": float(parts[3]),
                    "low": float(parts[4]),
                })

    return chart_data


def _get_query_param(request, key, default=""):
    if isinstance(request, dict):
        query = request.get("query") or request.get("queryStringParameters") or {}
        if isinstance(query, dict) and key in query:
            return query.get(key, default)

    for attr in ("query", "args"):
        container = getattr(request, attr, None)
        if container is None:
            continue
        try:
            value = container.get(key, default)
            if isinstance(value, list):
                return value[0] if value else default
            return value
        except AttributeError:
            pass

    url = getattr(request, "url", None)
    if url:
        query = parse_qs(urlparse(url).query)
        return query.get(key, [default])[0]

    return default


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Extract query parameters directly from self.path
        parsed_path = urlparse(self.path)
        query_params = parse_qs(parsed_path.query)
        code_list = query_params.get("code", [])
        code = code_list[0] if code_list else None

        if not code:
            response_data = {
                "success": False,
                "error": "Missing 'code' parameter",
                "data": [],
            }
            self.send_response(400)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode('utf-8'))
            return

        try:
            chart_data = fetch_kline_data(code)
            response_data = {
                "success": True,
                "data": chart_data,
                "symbol": code,
                "period": "Daily",
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Cache-Control', 's-maxage=3600, stale-while-revalidate')
            self.end_headers()
            self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode('utf-8'))
            
        except Exception as exc:
            error_response = {
                "success": False,
                "error": str(exc),
                "data": [],
            }
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(error_response, ensure_ascii=False).encode('utf-8'))

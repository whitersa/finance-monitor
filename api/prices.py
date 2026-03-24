"""
Vercel Serverless Function - Commodities Prices (Anti-Block & Force TZ)
Data source: East Money (东方财富)
"""
import json
import urllib.request
import urllib.parse
import time
from http.server import BaseHTTPRequestHandler

EASTMONEY_API = "https://push2.eastmoney.com/api/qt/clist/get"
FIELDS = "f2,f3,f4,f5,f6,f12,f14,f15,f16,f17,f18"

# Mixed Market Sources: SGE for Gold, COMEX for others
MARKET_SOURCES = [
    {
        "fs": "m:118",  # SGE Shanghai Gold
        "symbols": {
            "AU9999": {"name": "黄金", "nameEn": "Gold", "unit": "/克", "symbol": "¥", "priceUnit": 1},
        },
        "dedup_groups": [],
    },
    {
        "fs": "m:102",  # COMEX / NYMEX Global
        "symbols": {
            "SI00Y":  {"name": "白银", "nameEn": "Silver",    "unit": "/盎司", "symbol": "$", "priceUnit": 1},
            "HG00Y":  {"name": "铜",   "nameEn": "Copper",    "unit": "/磅",   "symbol": "$", "priceUnit": 1},
            "CL00Y":  {"name": "原油", "nameEn": "Crude Oil", "unit": "/桶",   "symbol": "$", "priceUnit": 1},
        },
        "dedup_groups": [],
    },
]

def safe_float(val, divisor=1):
    if val is None or val == "-" or val == "":
        return 0
    try:
        return float(val) / divisor
    except (ValueError, TypeError):
        return 0

def fetch_market(fs, symbols):
    params = {
        "pn": "1", "pz": "50", "po": "1", "np": "1",
        "fltt": "2", "invt": "2", "fid": "f2",
        "fs": fs,
        "fields": FIELDS,
    }
    url = f"{EASTMONEY_API}?{urllib.parse.urlencode(params)}"
    
    # ADVANCED BROWSER EMULATION HEADERS
    headers = {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1",
        "Referer": "https://wap.eastmoney.com/",
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Connection": "keep-alive"
    }
    
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=12) as response:
        data = json.loads(response.read().decode("utf-8"))

    if not data or "data" not in data or not data["data"]:
        return []

    diff_list = data["data"].get("diff", [])
    results = []
    
    for item in diff_list:
        code = str(item.get("f12", ""))
        if code not in symbols:
            continue

        meta = symbols[code]
        divisor = meta["priceUnit"]
        raw_price = item.get("f2")
        if raw_price is None or raw_price == "-":
            continue

        change = safe_float(item.get("f4"), divisor)
        results.append({
            "id": code,
            "name": meta["name"],
            "nameEn": meta["nameEn"],
            "price": round(safe_float(raw_price, divisor), 2),
            "change": round(change, 2),
            "changePercent": round(safe_float(item.get("f3")), 2),
            "isUp": change >= 0,
            "high": round(safe_float(item.get("f15"), divisor), 2),
            "low": round(safe_float(item.get("f16"), divisor), 2),
            "open": round(safe_float(item.get("f17"), divisor), 2),
            "prevClose": round(safe_float(item.get("f18"), divisor), 2),
            "symbol": meta.get("symbol", "¥"),
            "unit": meta["unit"]
        })

    return results

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            results = []
            for source in MARKET_SOURCES:
                try:
                    items = fetch_market(source["fs"], source["symbols"])
                    results.extend(items)
                except Exception as e:
                    print(f"Fetch Error: {e}")

            # Beijing Time Offset (GMT+8)
            bj_time = int(time.time() + 8 * 3600)
            
            response_data = {
                "success": True,
                "data": results,
                "timestamp": bj_time,
                "timezone": "CST"
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode('utf-8'))

        except Exception as exc:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(str(exc).encode('utf-8'))

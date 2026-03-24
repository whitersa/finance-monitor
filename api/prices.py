"""
Vercel Serverless Function - Commodities Prices
Data source: East Money (东方财富)
Markets: SGE (黄金/白银), SHFE (铜), INE (原油)
"""
import json
import urllib.request
import urllib.parse
import time
from http.server import BaseHTTPRequestHandler

EASTMONEY_API = "https://push2.eastmoney.com/api/qt/clist/get"
FIELDS = "f2,f3,f4,f5,f6,f12,f14,f15,f16,f17,f18"

# Each market source: (fs_filter, symbols_map)
# priceUnit = divisor to convert raw price to display price
# Mixed Market Sources: RMB for Domestic gold, USD for Global commodities
MARKET_SOURCES = [
    {
        "fs": "m:118",  # SGE (Shanghai Gold Exchange) - Keep Gold in CNY
        "symbols": {
            "AU9999": {"name": "黄金", "nameEn": "Gold", "unit": "/克", "symbol": "¥", "priceUnit": 1},
        },
        "dedup_groups": [],
    },
    {
        "fs": "m:102",  # COMEX / NYMEX / Global Commodities in USD
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


def fetch_market(fs, symbols, dedup_groups):
    params = {
        "pn": "1", "pz": "50", "po": "1", "np": "1",
        "fltt": "2", "invt": "2", "fid": "f2",
        "fs": fs,
        "fields": FIELDS,
    }
    url = f"{EASTMONEY_API}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": "https://quote.eastmoney.com/",
    })
    with urllib.request.urlopen(req, timeout=10) as response:
        data = json.loads(response.read().decode("utf-8"))

    if not data or "data" not in data or not data["data"]:
        return []

    diff_list = data["data"].get("diff", [])

    # Track which dedup groups have already emitted
    emitted_groups = {}  # group_id -> True
    def get_group(code):
        for i, g in enumerate(dedup_groups):
            if code in g:
                return i
        return None

    results = []
    for item in diff_list:
        code = str(item.get("f12", ""))
        if code not in symbols:
            continue

        # Dedup check
        group_id = get_group(code)
        if group_id is not None and emitted_groups.get(group_id):
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
            "unit": meta["unit"],
            "source": fs,
        })

        if group_id is not None:
            emitted_groups[group_id] = True

    return results


def fetch_all_prices():
    results = []
    for source in MARKET_SOURCES:
        try:
            items = fetch_market(source["fs"], source["symbols"], source["dedup_groups"])
            results.extend(items)
        except Exception as e:
            print(f"[WARN] Failed to fetch {source['fs']}: {e}")
    return results


class handler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # Suppress default request logging

    def do_GET(self):
        try:
            prices = fetch_all_prices()
            response_data = {
                "success": True,
                "data": prices,
                "timestamp": int(time.time()),
                "source": "East Money (东方财富) - SGE / SHFE / INE",
            }
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Cache-Control', 's-maxage=30, stale-while-revalidate')
            self.end_headers()
            self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode('utf-8'))

        except Exception as exc:
            error_response = {"success": False, "error": str(exc), "data": []}
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(error_response, ensure_ascii=False).encode('utf-8'))

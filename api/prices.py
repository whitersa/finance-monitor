"""
Vercel Serverless Function - SGE Precious Metals Prices
Data source: East Money (东方财富) - Shanghai Gold Exchange
Market code: m:118 (上海黄金交易所)
"""
import json
import urllib.request
import urllib.parse
import time


# East Money API
EASTMONEY_API = "https://push2.eastmoney.com/api/qt/clist/get"

# SGE Symbols (market code 118)
# AU9999 = 黄金9999 (price in ¥/g)
# AG9999 = 白银9999 (price in ¥/kg, need to convert to ¥/g)
TARGET_SYMBOLS = {
    "AU9999": {"name": "黄金", "nameEn": "Gold", "priceUnit": 1},       # Already ¥/g
    "AG9999": {"name": "白银", "nameEn": "Silver", "priceUnit": 1000},  # ¥/kg → ÷1000 = ¥/g
}

FIELDS = "f2,f3,f4,f5,f6,f12,f14,f15,f16,f17,f18"


def safe_float(val, divisor=1):
    """Safely convert value to float, return 0 if invalid"""
    if val is None or val == "-" or val == "":
        return 0
    try:
        return float(val) / divisor
    except (ValueError, TypeError):
        return 0


def fetch_sge_prices():
    """Fetch real-time prices from Shanghai Gold Exchange via East Money API"""
    params = {
        "pn": "1",
        "pz": "200",
        "po": "1",
        "np": "1",
        "fltt": "2",
        "invt": "2",
        "fid": "f3",
        "fs": "m:118",  # Market 118 = Shanghai Gold Exchange
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
    results = []

    for item in diff_list:
        code = str(item.get("f12", ""))
        if code not in TARGET_SYMBOLS:
            continue

        meta = TARGET_SYMBOLS[code]
        divisor = meta["priceUnit"]

        raw_price = item.get("f2")
        raw_change = item.get("f4")
        raw_change_pct = item.get("f3")

        # Skip if price is missing (market closed)
        if raw_price is None or raw_price == "-":
            continue

        price = safe_float(raw_price, divisor)
        change = safe_float(raw_change, divisor)
        change_pct = safe_float(raw_change_pct)  # Percent doesn't need division

        results.append({
            "id": code,
            "name": meta["name"],
            "nameEn": meta["nameEn"],
            "price": round(price, 2),
            "change": round(change, 2),
            "changePercent": round(change_pct, 2),
            "isUp": change >= 0,
            "high": round(safe_float(item.get("f15"), divisor), 2),
            "low": round(safe_float(item.get("f16"), divisor), 2),
            "open": round(safe_float(item.get("f17"), divisor), 2),
            "prevClose": round(safe_float(item.get("f18"), divisor), 2),
            "symbol": "¥",
            "unit": "/g",
            "source": "SGE",
        })

    return results


def handler(request):
    try:
        prices = fetch_sge_prices()
        response_data = {
            "success": True,
            "data": prices,
            "timestamp": int(time.time()),
            "source": "Shanghai Gold Exchange (上海黄金交易所)",
        }
        status = 200
    except Exception as exc:
        response_data = {
            "success": False,
            "error": str(exc),
            "data": [],
        }
        status = 500

    return {
        "statusCode": status,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "s-maxage=30, stale-while-revalidate",
        },
        "body": json.dumps(response_data, ensure_ascii=False),
    }

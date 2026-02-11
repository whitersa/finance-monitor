"""
Test the actual API handler logic (same as api/prices.py)
"""
import sys
sys.path.insert(0, 'api')

# Import our fetch function directly
from prices import fetch_sge_prices
import json

print("Testing SGE price fetch...\n")

prices = fetch_sge_prices()

if not prices:
    print("No data returned (market may be closed)")
    print("This is normal outside trading hours:")
    print("  Morning:   09:00 - 11:30")
    print("  Afternoon: 13:30 - 15:30") 
    print("  Night:     20:00 - 02:30")
else:
    for p in prices:
        print(f"  {p['name']} ({p['id']})")
        print(f"    Price:  {p['symbol']}{p['price']}{p['unit']}")
        print(f"    Change: {'+' if p['isUp'] else ''}{p['change']} ({p['changePercent']}%)")
        print(f"    High/Low: {p['high']} / {p['low']}")
        print()

print(f"\nFull JSON response:")
print(json.dumps(prices, ensure_ascii=False, indent=2))

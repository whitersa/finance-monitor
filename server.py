import sys
import os
from http.server import HTTPServer, BaseHTTPRequestHandler

# Add the 'api' directory to our python path so we can import the vercel functions
sys.path.append(os.path.join(os.path.dirname(__file__), 'api'))
import prices
import kline

class LocalVercelSimulator(BaseHTTPRequestHandler):
    def do_GET(self):
        # Route requests to the appropriate Vercel handler
        if self.path.startswith('/api/prices'):
            # The Vercel handlers expect to receive the HTTP request object
            prices.handler.do_GET(self)
        elif self.path.startswith('/api/kline'):
            kline.handler.do_GET(self)
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'Not Found')

if __name__ == '__main__':
    port = 3000
    server = HTTPServer(('0.0.0.0', port), LocalVercelSimulator)
    print("=====================================================")
    print(f"🚀 Local Python API Server is ON at http://localhost:{port}")
    print("=====================================================")
    print("You can now run 'npm run dev' in another terminal without using Vercel CLI.")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        server.server_close()

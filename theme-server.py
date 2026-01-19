#!/usr/bin/env python3
"""
RustPress Theme Server - Full template rendering with Jinja2
Serves the theme with proper template inheritance
"""

import http.server
import socketserver
import os
import sys
import mimetypes
from pathlib import Path
from urllib.parse import urlparse, parse_qs

try:
    from jinja2 import Environment, FileSystemLoader, select_autoescape
except ImportError:
    print("Installing jinja2...")
    os.system("pip install jinja2")
    from jinja2 import Environment, FileSystemLoader, select_autoescape

# Configuration
PORT = 8080
BASE_DIR = Path(__file__).parent
THEME_DIR = BASE_DIR / "themes" / "rustpress-enterprise"
TEMPLATES_DIR = THEME_DIR / "templates"

# Mock site data
site_data = {
    'site': {
        'name': 'RustPress',
        'tagline': 'Modern CMS Built with Rust',
        'url': f'http://localhost:{PORT}',
        'year': '2026',
        'stripe_public_key': 'pk_test_demo',
        'description': 'The modern, blazingly fast CMS built with Rust',
    },
    'page': {
        'title': 'RustPress',
        'description': 'Modern CMS Built with Rust',
    },
    'posts': [],
    'categories': [],
    'tags': [],
}

# Setup Jinja2 environment
env = Environment(
    loader=FileSystemLoader([str(THEME_DIR), str(TEMPLATES_DIR)]),
    autoescape=select_autoescape(['html', 'xml']),
)

# Custom default filter to match Tera's syntax: default(value="x")
def tera_default(val, value=''):
    """Tera-compatible default filter that accepts value= keyword argument"""
    return val if val else value

env.filters['default'] = tera_default

# Route mapping
ROUTES = {
    '/': 'front-page.html',
    '/home': 'front-page.html',
    '/features': 'features.html',
    '/pricing': 'pricing.html',
    '/about': 'about.html',
    '/docs': 'docs.html',
    '/download': 'download.html',
    '/themes': 'themes.html',
    '/plugins': 'plugins.html',
    '/ide': 'ide.html',
    '/roadmap': 'roadmap.html',
    '/checkout': 'checkout.html',
    '/thank-you': 'thank-you.html',
    '/404': '404.html',
    '/admin': 'admin-preview.html',
    '/dashboard': 'admin-preview.html',
}

class ThemeHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(THEME_DIR), **kwargs)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip('/')
        if not path:
            path = '/'

        # Check if it's a template route
        if path in ROUTES:
            self.serve_template(ROUTES[path])
            return

        # Handle theme assets
        if self.path.startswith('/themes/rustpress-enterprise/'):
            self.path = self.path.replace('/themes/rustpress-enterprise/', '/')
            return super().do_GET()

        # Handle other assets
        if self.path.startswith('/assets/'):
            return super().do_GET()

        # 404 for unknown routes
        self.serve_template('404.html', status=404)

    def serve_template(self, template_name, status=200):
        try:
            template_path = f"templates/{template_name}"
            template = env.get_template(template_path)
            content = template.render(**site_data)

            self.send_response(status)
            self.send_header('Content-type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(content.encode('utf-8'))
        except Exception as e:
            self.send_error(500, f"Template error: {e}")

    def log_message(self, format, *args):
        status = args[1] if len(args) > 1 else ''
        color = '\033[92m' if status == '200' else '\033[93m' if status == '404' else '\033[91m'
        reset = '\033[0m'
        print(f"{color}[{args[1]}]{reset} {args[0]}")

def main():
    print(f"""
+--------------------------------------------------------------+
|         RustPress Theme Development Server                   |
+--------------------------------------------------------------+
|  Server: http://localhost:{PORT}                               |
|  Theme:  rustpress-enterprise                                |
+--------------------------------------------------------------+

Available Pages:
  - http://localhost:{PORT}/              (Homepage)
  - http://localhost:{PORT}/features      (Features)
  - http://localhost:{PORT}/pricing       (Pricing)
  - http://localhost:{PORT}/about         (About)
  - http://localhost:{PORT}/docs          (Documentation)
  - http://localhost:{PORT}/download      (Download)
  - http://localhost:{PORT}/themes        (Themes)
  - http://localhost:{PORT}/plugins       (Plugins)
  - http://localhost:{PORT}/ide           (IDE Integration)
  - http://localhost:{PORT}/roadmap       (Roadmap)
  - http://localhost:{PORT}/checkout      (Checkout)
  - http://localhost:{PORT}/admin         (Admin Preview)

Press Ctrl+C to stop the server.
""")

    with socketserver.TCPServer(("", PORT), ThemeHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == "__main__":
    main()

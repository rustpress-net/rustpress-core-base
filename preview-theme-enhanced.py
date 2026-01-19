#!/usr/bin/env python3
"""
Enhanced theme preview server for RustPress themes.
Renders Tera templates with basic inheritance support.
"""

import http.server
import socketserver
import os
import sys
import re
from pathlib import Path

# Configuration
PORT = 8888
THEME_DIR = Path(__file__).parent / "themes" / "rustpress-enterprise"
TEMPLATES_DIR = THEME_DIR / "templates"
PARTIALS_DIR = TEMPLATES_DIR / "partials"

# Mock site data
SITE_DATA = {
    'site.name': 'RustPress',
    'site.tagline': 'Modern CMS Built with Rust',
    'site.year': '2026',
    'site.stripe_public_key': 'pk_test_demo',
}

def render_template(template_path, context=None):
    """Render a Tera template with basic inheritance support."""
    if context is None:
        context = {}

    if not template_path.exists():
        return None

    content = template_path.read_text(encoding='utf-8')

    # Handle extends
    extends_match = re.search(r'\{%\s*extends\s*"([^"]+)"\s*%\}', content)
    if extends_match:
        base_path = THEME_DIR / extends_match.group(1)
        if base_path.exists():
            base_content = base_path.read_text(encoding='utf-8')

            # Extract blocks from child template
            blocks = {}
            block_pattern = r'\{%\s*block\s+(\w+)\s*%\}(.*?)\{%\s*endblock\s*%\}'
            for match in re.finditer(block_pattern, content, re.DOTALL):
                blocks[match.group(1)] = match.group(2)

            # Replace blocks in base template
            def replace_block(match):
                block_name = match.group(1)
                if block_name in blocks:
                    return blocks[block_name]
                return ''

            content = re.sub(block_pattern, replace_block, base_content)

    # Handle includes
    def replace_include(match):
        include_path = THEME_DIR / match.group(1)
        if include_path.exists():
            return include_path.read_text(encoding='utf-8')
        return f'<!-- Include not found: {match.group(1)} -->'

    content = re.sub(r'\{%\s*include\s*"([^"]+)"\s*%\}', replace_include, content)

    # Replace simple variables
    for key, value in SITE_DATA.items():
        content = content.replace('{{ ' + key + ' }}', str(value))
        content = content.replace('{{' + key + '}}', str(value))

    # Handle default values: {{ var | default(value="...") }}
    def replace_default(match):
        return match.group(1)
    content = re.sub(r'\{\{\s*\w+\s*\|\s*default\(value="([^"]+)"\)\s*\}\}', replace_default, content)

    # Remove remaining template tags
    content = re.sub(r'\{%.*?%\}', '', content)
    content = re.sub(r'\{\{.*?\}\}', '', content)

    return content

class ThemeHandler(http.server.SimpleHTTPRequestHandler):
    """Custom handler for serving theme templates."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(THEME_DIR), **kwargs)

    def do_GET(self):
        # Map paths to templates
        path_map = {
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
            '/dashboard/profile': 'admin-preview.html',
            '/dashboard/themes': 'admin-preview.html',
            '/dashboard/posts/new': 'admin-preview.html',
        }

        # Clean path
        clean_path = self.path.split('?')[0].rstrip('/')
        if not clean_path:
            clean_path = '/'

        # Check if it's a template route
        if clean_path in path_map:
            template_file = TEMPLATES_DIR / path_map[clean_path]
            content = render_template(template_file)
            if content:
                self.send_response(200)
                self.send_header('Content-type', 'text/html; charset=utf-8')
                self.end_headers()
                self.wfile.write(content.encode('utf-8'))
                return

        # Serve static assets from assets directory
        if self.path.startswith('/themes/rustpress-enterprise/assets/'):
            asset_path = self.path.replace('/themes/rustpress-enterprise/', '')
            self.path = '/' + asset_path

        # Fall back to normal file serving
        super().do_GET()

    def log_message(self, format, *args):
        print(f"[{self.address_string()}] {format % args}")

def main():
    print(f"\n{'='*60}")
    print("RustPress Theme Preview Server (Enhanced)")
    print(f"{'='*60}")
    print(f"\nServing theme from: {THEME_DIR}")
    print(f"Templates directory: {TEMPLATES_DIR}")
    print(f"\nServer running at: http://localhost:{PORT}")
    print("\nAvailable pages:")
    pages = ['/', '/features', '/pricing', '/about', '/docs', '/download',
             '/themes', '/plugins', '/ide', '/roadmap', '/checkout', '/thank-you', '/404']
    for page in pages:
        print(f"  - http://localhost:{PORT}{page}")
    print(f"\nPress Ctrl+C to stop the server.\n")

    with socketserver.TCPServer(("", PORT), ThemeHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Local static server. A missing path returns 404.html with status 404.

GitHub Pages does this when 404.html is in the site root.
python3 -m http.server does not, so local preview uses this script.
"""

import argparse
import os
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))


class Handler(SimpleHTTPRequestHandler):
    def send_error(self, code, message=None, explain=None):
        page = os.path.join(self.directory, "404.html")
        if code != 404 or not os.path.isfile(page):
            return super().send_error(code, message, explain)

        with open(page, "rb") as handle:
            body = handle.read()
        self.log_error("code %d, message %s", code, message)
        self.send_response(404)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)


def main():
    parser = argparse.ArgumentParser(description="Serve the site, with 404.html for missing paths.")
    parser.add_argument("port", nargs="?", type=int, default=3000)
    parser.add_argument("--bind", default="127.0.0.1")
    args = parser.parse_args()
    handler = partial(Handler, directory=ROOT)
    server = ThreadingHTTPServer((args.bind, args.port), handler)
    print(f"Serving {ROOT} at http://{args.bind}:{args.port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print()
    finally:
        server.server_close()


if __name__ == "__main__":
    main()

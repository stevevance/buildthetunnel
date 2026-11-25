"""
Run one of the telemetry-recap-video skill's fetch scripts (fetch_streets.py, fetch_basemap.py) with its Overpass
requests sent through the Chicago Cityscape CLI (cli/overpass.php: the paid Overspan endpoint first, then the public
servers) instead of straight to the public servers. Nothing else about the script changes.

    uv run --python 3.12 python tools/minimap/via-cityscape.py $K/fetch_streets.py --latlng-json route.json --out streets.geojson

Overspan caps a query at 60 seconds, so each asks for 55. CITYSCAPE_CLI points at the CLI if it isn't in the usual place.
"""
import importlib.util
import json
import os
import re
import subprocess
import sys
import time

CLI = os.environ.get("CITYSCAPE_CLI", os.path.expanduser("~/Sites/Chicago Cityscape/cli/overpass.php"))


def overpass(query, tries=3):
    query = re.sub(r"\[timeout:\d+\]", "[timeout:55]", query)
    for attempt in range(tries):
        out = subprocess.run(["php", CLI, "--json"], input=query, capture_output=True, text=True)
        if out.stdout.lstrip().startswith("{"):
            return json.loads(out.stdout)
        print(f"      cityscape CLI: {out.stderr.strip()[-200:]}", flush=True)
        time.sleep(10 * (attempt + 1))
    return None


script = sys.argv[1]
sys.argv = [script] + sys.argv[2:]
spec = importlib.util.spec_from_file_location("fetch", script)
fetch = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fetch)
fetch.overpass = overpass
fetch.main()

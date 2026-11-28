#!/usr/bin/env bash
# Upload the trip planner's walking tiles (planner/data/walk/, built by planner/tools/build-walk-tiles.mjs) to R2, where
# the planner reads them through the buildthetunnel-media Worker (media-worker/): planner/data/walk/{index.json,t/*} ->
# cabride-media/walk/<version>/... Each build gets a new version (the Worker's responses are cached for a year): set it
# in planner/config.js as both the end of walkBase and walkVersion.
#   planner/tools/upload-walk-tiles.sh 2026-11-27
set -euo pipefail
VERSION=${1:?usage: planner/tools/upload-walk-tiles.sh <version, e.g. 2026-11-27>}
ROOT=$(cd "$(dirname "$0")/../.." && pwd)
cd "$ROOT/planner/data/walk"
list=$(find . -name "*.json" | sed 's#^\./##' | sort)
echo "$(echo "$list" | wc -l | tr -d ' ') files to cabride-media/walk/$VERSION/"
# a dozen at a time; each object is one small JSON file
echo "$list" | xargs -P 12 -I{} sh -c 'cd "$1" && wrangler r2 object put "cabride-media/walk/$2/$3" --file "$4/$3" --content-type application/json --remote >/dev/null 2>&1 || echo "FAILED $3"' _ "$ROOT/media-worker" "$VERSION" {} "$ROOT/planner/data/walk"
echo "done"

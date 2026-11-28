#!/usr/bin/env bash
# Render the web page's two 360 views at Chicago/Halsted (tunnel.stevevance.net/cabride/pano/) from the film's scene, as
# tiles of 1024 px at three levels of detail (2048, 4096 and 8192 px faces), with the hotspots' directions from
# cabride/data/places.json. The tiles are served from R2 (see media-worker/), not git: upload them with tools/upload-panos.sh.
#   hero:     from the hero shot's own camera at the top of its pull-up (film 217.28 s), 380 m up
#   platform: on the platform beside the train's last car (d 14435, 7.3 m right of the line, eye height), as it stands
#             at the stop (204.5 s)
# Run from the film's folder: tools/web-panos.sh  (about 5 minutes on the Mac)
set -euo pipefail
cd "$(dirname "$0")/.."
PAGE=../../cabride
for view in hero platform; do
  out="$PAGE/pano/chicago-halsted-$view"
  rm -rf "$out"
  if [ "$view" = hero ]; then args=(--t 217.28 --shot 2); else args=(--t 204.5 --shot 2 --at 14435,-7.3,2.7); fi   # (on the west platform: the X1 keeps left)
  for level in "2048 2" "4096 4" "8192 8"; do
    read -r size tiles <<< "$level"
    node tools/cubemap.mjs "$out" "${args[@]}" --size "$size" --tiles "$tiles" --ss 2 --targets "$PAGE/data/places.json" | grep -E "tiles in"
  done
done

#!/usr/bin/env bash
# Assemble the r5r routing-network folders from the committed canonical inputs
# (r5r_network_inputs/) into networks/. Each folder is what r5r's
# build_network() points at. This directory is derived and gitignored;
# rerun this script any time it is missing (e.g. a fresh checkout, or after a
# temp cleanup) to reconstruct it in seconds.
#
# The large street network (chicago-streets.osm.pbf, 54 MB) is symlinked, not
# copied, so the four networks share one file on disk. r5r follows the symlink
# fine. The GTFS zips are small and are copied.
#
# Usage:  bash assemble_networks.sh
# (Written for bash 3.2, the macOS default -- no associative arrays.)
set -eu
HERE="$(cd "$(dirname "$0")" && pwd)"
IN="$HERE/r5r_network_inputs"
OUT="$HERE/networks"
PBF="$IN/chicago-streets.osm.pbf"

BASE="cta-gtfs.zip metra-gtfs.zip pace-gtfs.zip"

assemble() {
  name="$1"; shift
  zips="$*"
  d="$OUT/$name"
  mkdir -p "$d"
  # Clear any stale build cache and old feeds so the network rebuilds current.
  rm -f "$d"/*.mapdb "$d"/*.mapdb.p "$d"/network.dat "$d"/*.zip "$d"/*.pbf 2>/dev/null || true
  ln -sf "$PBF" "$d/chicago-streets.osm.pbf"
  for z in $zips; do cp "$IN/$z" "$d/"; done
  echo "assembled $name: $zips"
}

assemble today        $BASE
assemble scenario     $BASE crosstowner-xroutes-gtfs.zip
assemble rle          $BASE redline-extension-gtfs.zip
assemble scenario_rle $BASE crosstowner-xroutes-gtfs.zip redline-extension-gtfs.zip

echo "networks/ ready. Point r5r build_network() at analysis/networks/<name>/"

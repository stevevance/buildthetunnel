#!/usr/bin/env bash
#
# run_precompute.sh  --  One command to (re)build every static data file the
# CrossTowner trip planner needs. Run it whenever the GTFS inputs or the
# scenario feed change.
#
# Steps:
#   1. Assemble the r5r routing networks from the committed GTFS + street pbf.
#   2. Build the unified station list (Metra + CTA "L" + CrossTowner).
#   3. Precompute the times-only station-to-station matrix (2 networks x 3
#      slices), sharded per origin, plus a manifest.
#
# Leg-by-leg detail is a separate, much slower batch -- run precompute_legs.sh
# (or precompute_legs.R) overnight after this succeeds.
#
# Usage:  bash analysis/planner/run_precompute.sh
#         (run from the repo root)
set -euo pipefail

# r5r needs Java 21; adjust if your JDK path differs.
export JAVA_HOME="${JAVA_HOME:-/opt/homebrew/Cellar/openjdk@21/21.0.11/libexec/openjdk.jdk/Contents/Home}"

echo "==> 1/3  Assembling routing networks"
bash analysis/assemble_networks.sh

echo "==> 2/3  Building unified station list"
Rscript analysis/planner/build_stations.R

echo "==> 3/3  Precomputing travel-time matrix (times only)"
Rscript analysis/planner/precompute_matrix.R

echo "Done. Static data is under planner/data/ (stations.json, matrix/, manifest.json)."

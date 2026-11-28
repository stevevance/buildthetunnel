#!/usr/bin/env bash
# Upload the web page's 360 views (rendered by tools/web-panos.sh into cabride/pano/) to R2, where the page reads them
# through the buildthetunnel-media Worker: cabride/pano/<view>/{base,tiles}/... -> cabride-media/pano/<version>/<view>/...
# Each render gets a new version (the Worker's responses are cached for a year), set in cabride/config.js as
# PANO_VERSION. Each view's meta.json stays in git with the page.
#   tools/upload-panos.sh v1
set -euo pipefail
VERSION=${1:?usage: tools/upload-panos.sh <version, e.g. v2>}
PAGE=$(cd "$(dirname "$0")/../../.." && pwd)/cabride
cd "$PAGE/pano"
WRANGLER_DIR=$(cd "$PAGE/../media-worker" && pwd)
list=$(find . -path "*/base/*.jpg" -o -path "*/tiles/*.jpg" | sed 's#^\./##' | sort)
echo "$(echo "$list" | wc -l | tr -d ' ') files to cabride-media/pano/$VERSION/"
# a dozen at a time; each object is one small JPEG
echo "$list" | xargs -P 12 -I{} sh -c 'cd "$1" && wrangler r2 object put "cabride-media/pano/$2/$3" --file "$4/$3" --content-type image/jpeg --remote >/dev/null 2>&1 || echo "FAILED $3"' _ "$WRANGLER_DIR" "$VERSION" {} "$PAGE/pano"
echo "done"

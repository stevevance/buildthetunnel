#!/usr/bin/env bash
# Render the film on a DigitalOcean GPU droplet, copy the MP4 back, and destroy the droplet.
#
#   ./build.py --no-render                  # first, on the Mac: the announcements (macOS `say`), timing and check
#   tools/droplet-render.sh cab-ride-full-route-v18.mp4 [size] [region]
#   FRAME=1080 tools/droplet-render.sh ...  # frame size for tools/direct-render.mjs --size (default 4k)
#
# Defaults: an RTX 6000 Ada (gpu-6000adax1-48gb, $1.57/hr) in tor1. Which GPU sizes a region has changes; see
#   doctl compute size list --output json      (each size's "regions")
# On the droplet Chrome draws on the NVIDIA GPU (ANGLE over EGL; __EGL_VENDOR_LIBRARY_FILENAMES picks NVIDIA's driver),
# but has no 4K H.264 encoder, so tools/direct-render.mjs sends each frame back as a JPEG and ffmpeg encodes it with
# NVENC. About 9.6 frames/s at 4K (the 209 s film in about 11 minutes), against about 4 on an M1 Mac.
# The droplet bills while it exists: this destroys it at the end, and on any error (see the trap).
set -euo pipefail
OUT=${1:?usage: tools/droplet-render.sh <output.mp4> [size] [region]}
SIZE=${2:-gpu-6000adax1-48gb}
REGION=${3:-tor1}
KEY=${SSH_KEY_ID:-56210768}                 # SV-MacBook-Air-ed25519 (~/.ssh/id_ed25519)
NAME=cab-render-$(date +%s)
HERE=$(cd "$(dirname "$0")/.." && pwd)
SSH=(ssh -o StrictHostKeyChecking=accept-new -o BatchMode=yes -o ConnectTimeout=10)

echo "Creating $NAME ($SIZE, $REGION)..."
IP=$(doctl compute droplet create "$NAME" --size "$SIZE" --region "$REGION" --image gpu-h100x1-base \
  --ssh-keys "$KEY" --wait --format PublicIPv4 --no-header)
trap 'echo "Destroying $NAME"; doctl compute droplet delete -f "$NAME"' EXIT
echo "  $IP"
until "${SSH[@]}" root@"$IP" 'cloud-init status 2>/dev/null | grep -q "done\|error"'; do sleep 10; done

echo "Installing Node 22, ffmpeg and Chrome..."
"${SSH[@]}" root@"$IP" 'export DEBIAN_FRONTEND=noninteractive; set -e
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash - >/dev/null
  curl -fsSLo /tmp/chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
  apt-get install -y -q nodejs ffmpeg /tmp/chrome.deb >/tmp/apt.log 2>&1'

echo "Copying the project..."
rsync -az -e "${SSH[*]}" --exclude node_modules --exclude '*.mp4' --exclude previews --exclude assets/people-src --exclude .git \
  "$HERE"/ root@"$IP":/root/cab/
"${SSH[@]}" root@"$IP" 'cd /root/cab && npm install --no-audit --no-fund >/dev/null 2>&1'

echo "Rendering..."
"${SSH[@]}" root@"$IP" "cd /root/cab && export __EGL_VENDOR_LIBRARY_FILENAMES=/usr/share/glvnd/egl_vendor.d/10_nvidia.json \
  CHROME=/usr/bin/google-chrome CHROME_ARGS='--no-sandbox --use-angle=gl-egl' && node tools/direct-render.mjs --size ${FRAME:-4k} --output '$OUT'"

echo "Copying $OUT back..."
rsync -az -e "${SSH[*]}" root@"$IP":/root/cab/"$OUT" "$HERE"/"$OUT"
echo "Done: $HERE/$OUT"

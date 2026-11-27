#!/usr/bin/env bash
# Render the film on a Linode (Akamai) GPU instance, copy the MP4 back, and delete the instance: tools/droplet-render.sh
# for when DigitalOcean's GPUs with a video encoder are sold out.
#
#   ./build.py --no-render                  # first, on the Mac: the announcements (macOS `say`), timing and check
#   tools/linode-render.sh cab-ride-hyde-rogers-preview-v5-720.mp4 [type] [region]
#   FRAME=1080 tools/linode-render.sh ...   # frame size for tools/direct-render.mjs --size (default 720)
#
# Defaults: an RTX 4000 Ada, 8 vCPU (g2-gpu-rtx4000a1-m, $0.67/hr) in Chicago (us-ord). Which regions have one changes:
#   curl -s -H "Authorization: Bearer $(cat .linode-token)" https://api.linode.com/v4/regions/us-ord/availability
# The API token is read from .linode-token beside this folder's index.html (git-ignored; never copied to the instance).
# Linode's images have no NVIDIA driver, so this installs one and reboots before rendering (about 5-10 minutes more
# than a droplet). Then as on the droplet: Chrome draws on the GPU (ANGLE over EGL) and ffmpeg encodes with NVENC.
# The instance bills while it exists: this deletes it at the end, and on any error (see the trap).
#
# Progress: everything is written, timestamped, to <output>.log beside the video as it happens.
#   tail -f <output>.log                     # follow it
set -euo pipefail
OUT=${1:?usage: tools/linode-render.sh <output.mp4> [type] [region]}
TYPE=${2:-g2-gpu-rtx4000a1-m}
REGION=${3:-us-ord}
HERE=$(cd "$(dirname "$0")/.." && pwd)
TOKEN=$(tr -d ' \n\r\t' < "$HERE/.linode-token")
PUBKEY=$(cat ~/.ssh/id_ed25519.pub)
NAME=cab-render-$(date +%s)
SSH=(ssh -o StrictHostKeyChecking=accept-new -o UserKnownHostsFile=/dev/null -o LogLevel=ERROR -o BatchMode=yes -o ConnectTimeout=10)
LOG="$HERE/${OUT%.mp4}.log"
STARTED=$(date +%s)
stamp() { while IFS= read -r line; do printf '[%s] %s\n' "$(date +%H:%M:%S)" "$line"; done; }
exec > >(stamp | tee -a "$LOG") 2>&1
elapsed() { local s=$(( $(date +%s) - STARTED )); printf '%dm%02ds' $((s / 60)) $((s % 60)); }
api() { local m=$1 p=$2; shift 2; curl -sS -X "$m" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" "https://api.linode.com/v4$p" "$@"; }
field() { python3 -c "import json,sys; d=json.load(sys.stdin); print($1)"; }
waitssh() {
  local waited=0
  until "${SSH[@]}" root@"$IP" true 2>/dev/null; do
    sleep 10; waited=$((waited + 10))
    if (( waited % 60 == 0 )); then echo "  still waiting ($(elapsed))"; fi
  done
}
echo "Log: $LOG"

echo "Creating $NAME ($TYPE, $REGION)..."
# a root password is required by the API; nobody needs it (ssh uses the key), so it is random and thrown away
BODY=$(python3 -c "import json,secrets,sys; print(json.dumps({'label': '$NAME', 'type': '$TYPE', 'region': '$REGION', 'image': 'linode/ubuntu24.04',
  'root_pass': secrets.token_urlsafe(24) + 'A1!', 'authorized_keys': [sys.argv[1]], 'booted': True}))" "$PUBKEY")
RESP=$(api POST /linode/instances -d "$BODY")
ID=$(echo "$RESP" | field "d.get('id', '')")
if [ -z "$ID" ]; then echo "Create failed: $RESP"; exit 1; fi
PRICE=$(api GET "/linode/types/$TYPE" | field "d['price']['hourly']")
cost() { python3 -c "print(f'about \${$PRICE * ($(date +%s) - $STARTED) / 3600:.2f}')"; }
trap 'echo "Deleting $NAME after $(elapsed) ($(cost) at \$$PRICE/hr)"; api DELETE /linode/instances/$ID >/dev/null' EXIT
IP=$(echo "$RESP" | field "d['ipv4'][0]")
echo "  $IP (instance $ID)"
until [ "$(api GET /linode/instances/$ID | field "d['status']")" = running ]; do sleep 10; done
echo "Waiting for ssh..."
waitssh

echo "Installing the NVIDIA driver..."
"${SSH[@]}" root@"$IP" 'export DEBIAN_FRONTEND=noninteractive; set -e
  apt-get update -q >/tmp/apt.log 2>&1
  apt-get install -y -q ubuntu-drivers-common >>/tmp/apt.log 2>&1
  ubuntu-drivers install >>/tmp/apt.log 2>&1
  echo "  $(ls /usr/lib/x86_64-linux-gnu/libnvidia-encode.so* 2>/dev/null | head -1 || echo "no libnvidia-encode")"'
echo "Rebooting onto it..."
"${SSH[@]}" root@"$IP" 'systemctl reboot' || true
sleep 30
waitssh
"${SSH[@]}" root@"$IP" 'nvidia-smi --query-gpu=name,driver_version --format=csv,noheader'

echo "Installing Node 22, ffmpeg and Chrome..."
"${SSH[@]}" root@"$IP" 'export DEBIAN_FRONTEND=noninteractive; set -e
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash - >/dev/null
  curl -fsSLo /tmp/chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
  apt-get install -y -q nodejs ffmpeg rsync /tmp/chrome.deb >>/tmp/apt.log 2>&1'

echo "Copying the project..."
rsync -az -e "${SSH[*]}" --exclude node_modules --exclude '*.mp4' --exclude '*.log' --exclude previews --exclude assets/people-src --exclude .git \
  --exclude .linode-token "$HERE"/ root@"$IP":/root/cab/
"${SSH[@]}" root@"$IP" 'cd /root/cab && npm install --no-audit --no-fund >/dev/null 2>&1'

echo "Rendering ($(elapsed) in)..."
"${SSH[@]}" root@"$IP" "set -o pipefail; cd /root/cab && export __EGL_VENDOR_LIBRARY_FILENAMES=/usr/share/glvnd/egl_vendor.d/10_nvidia.json \
  CHROME=/usr/bin/google-chrome CHROME_ARGS='--no-sandbox --use-angle=gl-egl' && node tools/direct-render.mjs --size ${FRAME:-720} --output '$OUT' 2>&1 | tee render.log"

echo "Copying $OUT back..."
rsync -az -e "${SSH[*]}" root@"$IP":/root/cab/"$OUT" "$HERE"/"$OUT"
echo "Done in $(elapsed): $HERE/$OUT"

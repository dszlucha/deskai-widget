#!/usr/bin/env bash
set -e

SRC="assets/icons/chat-ai-4-fill.png"
OUT="build/icons/macos.iconset"

rm -rf "$OUT"
mkdir -p "$OUT"

sips -z 16 16     "$SRC" --out "$OUT/icon_16x16.png"
sips -z 32 32     "$SRC" --out "$OUT/icon_16x16@2x.png"
sips -z 32 32     "$SRC" --out "$OUT/icon_32x32.png"
sips -z 64 64     "$SRC" --out "$OUT/icon_32x32@2x.png"
sips -z 128 128   "$SRC" --out "$OUT/icon_128x128.png"
sips -z 256 256   "$SRC" --out "$OUT/icon_128x128@2x.png"
sips -z 256 256   "$SRC" --out "$OUT/icon_256x256.png"
sips -z 512 512   "$SRC" --out "$OUT/icon_256x256@2x.png"
sips -z 512 512   "$SRC" --out "$OUT/icon_512x512.png"
sips -z 1024 1024 "$SRC" --out "$OUT/icon_512x512@2x.png"

iconutil -c icns "$OUT" -o build/icons/icon.icns

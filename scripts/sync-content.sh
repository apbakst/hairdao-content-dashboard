#!/bin/bash
# Syncs content from pipeline to dashboard public folder

PIPELINE_DIR="/root/clawd/hairdao-content-pipeline/output/slides"
DASHBOARD_DIR="/root/clawd/hairdao-content-dashboard/public/content"

mkdir -p "$DASHBOARD_DIR"

# Copy latest slide sets
for dir in "$PIPELINE_DIR"/*; do
  if [ -d "$dir" ]; then
    setname=$(basename "$dir")
    # Create simplified set name (set1, set2, etc)
    setnum=$(echo "$setname" | grep -oP 'set\d+')
    if [ -n "$setnum" ]; then
      targetdir="$DASHBOARD_DIR/$setnum"
      mkdir -p "$targetdir"
      cp "$dir"/*.png "$targetdir/" 2>/dev/null
      cp "$dir"/*.zip "$targetdir/" 2>/dev/null
      cp "$dir"/metadata.json "$targetdir/" 2>/dev/null
      cp "$dir"/caption.txt "$targetdir/" 2>/dev/null
      echo "Synced $setname -> $setnum"
    fi
  fi
done

echo "Content sync complete!"

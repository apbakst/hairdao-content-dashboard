#!/bin/bash
# Generate images and iterate until they pass AI detection
# Usage: ./generate-until-passes.sh "prompt" "output.png" [max_attempts] [target_score]

set -e

PROMPT="$1"
OUTPUT="$2"
MAX_ATTEMPTS="${3:-5}"
TARGET_SCORE="${4:-50}"  # Target: under 50% AI detected

SCRIPT_DIR="/usr/lib/node_modules/clawdbot/skills/nano-banana-pro/scripts"
GEMINI_API_KEY="${GEMINI_API_KEY:-AIzaSyCDpWsQ1ctGnUSFFKcS3WNY7NTu1RsVy34}"

# Sightengine credentials (free tier: 500/month)
SIGHTENGINE_USER="${SIGHTENGINE_API_USER}"
SIGHTENGINE_SECRET="${SIGHTENGINE_API_SECRET}"

if [ -z "$PROMPT" ] || [ -z "$OUTPUT" ]; then
    echo "Usage: $0 'prompt' 'output.png' [max_attempts] [target_score]"
    exit 1
fi

# Function to test image with Sightengine
test_ai_score() {
    local image_path="$1"
    
    if [ -z "$SIGHTENGINE_USER" ] || [ -z "$SIGHTENGINE_SECRET" ]; then
        echo "WARN: Sightengine not configured, skipping AI detection" >&2
        echo "0"
        return
    fi
    
    # Upload and test
    local result=$(curl -s -X POST "https://api.sightengine.com/1.0/check.json" \
        -F "media=@$image_path" \
        -F "models=genai" \
        -F "api_user=$SIGHTENGINE_USER" \
        -F "api_secret=$SIGHTENGINE_SECRET")
    
    # Extract AI score (0-1, multiply by 100 for percentage)
    local score=$(echo "$result" | grep -o '"ai_generated":[0-9.]*' | cut -d: -f2)
    if [ -z "$score" ]; then
        echo "0"
    else
        echo "$score" | awk '{printf "%.0f", $1 * 100}'
    fi
}

# Prompt variations to make images look less AI
PROMPT_SUFFIXES=(
    ""
    ", shot on iPhone, casual snapshot"
    ", professional DSLR photograph, natural lighting"
    ", candid photo, slight motion blur"
    ", real photograph, unedited, authentic"
    ", taken with Canon 5D, shallow depth of field"
)

echo "🎯 Target: AI score under ${TARGET_SCORE}%"
echo "📸 Generating: $PROMPT"
echo ""

for attempt in $(seq 1 $MAX_ATTEMPTS); do
    suffix_idx=$(( (attempt - 1) % ${#PROMPT_SUFFIXES[@]} ))
    current_prompt="${PROMPT}${PROMPT_SUFFIXES[$suffix_idx]}"
    
    echo "Attempt $attempt/$MAX_ATTEMPTS"
    echo "  Prompt: ${current_prompt:0:80}..."
    
    # Generate image
    temp_output="/tmp/gen_attempt_${attempt}.png"
    GEMINI_API_KEY="$GEMINI_API_KEY" uv run "$SCRIPT_DIR/generate_image.py" \
        --prompt "$current_prompt" \
        --filename "$temp_output" \
        --resolution 1K 2>/dev/null
    
    if [ ! -f "$temp_output" ]; then
        echo "  ❌ Generation failed"
        continue
    fi
    
    # Test AI score
    score=$(test_ai_score "$temp_output")
    echo "  AI Score: ${score}%"
    
    if [ "$score" -lt "$TARGET_SCORE" ]; then
        echo "  ✅ PASSED! Score ${score}% < ${TARGET_SCORE}%"
        cp "$temp_output" "$OUTPUT"
        rm -f /tmp/gen_attempt_*.png
        echo ""
        echo "MEDIA: $OUTPUT"
        exit 0
    else
        echo "  ⚠️ Too AI-looking (${score}% >= ${TARGET_SCORE}%)"
    fi
    
    # Keep best attempt
    if [ -z "$best_score" ] || [ "$score" -lt "$best_score" ]; then
        best_score="$score"
        best_file="$temp_output"
    fi
done

# Use best attempt if none passed
if [ -n "$best_file" ] && [ -f "$best_file" ]; then
    echo ""
    echo "⚠️ No image passed target. Using best attempt (${best_score}%)"
    cp "$best_file" "$OUTPUT"
    rm -f /tmp/gen_attempt_*.png
    echo "MEDIA: $OUTPUT"
    exit 0
fi

echo "❌ Failed to generate acceptable image"
exit 1

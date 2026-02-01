#!/bin/bash
# Test second-brain API directly (without MCP wrapper)
# This validates that the API is working before testing the full MCP flow

set -e

API_URL="${SECOND_BRAIN_API_URL:-http://localhost:3100}"

echo "=== Second-Brain API Direct Test ==="
echo "API URL: $API_URL"
echo ""

# Test 1: Health check
echo "=== Test 1: Health Check ==="
HEALTH=$(curl -s "$API_URL/health")
echo "Response: $HEALTH"

if echo "$HEALTH" | grep -q '"status":"ok"'; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    exit 1
fi

# Test 2: Archive URL (HackerNews)
echo ""
echo "=== Test 2: Archive HackerNews URL ==="
echo "NOTE: This will create a real archive. Press Ctrl+C to cancel."
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    RESULT=$(curl -s -X POST "$API_URL/archive" \
        -H "Content-Type: application/json" \
        -d '{
            "url": "https://news.ycombinator.com/item?id=42912256",
            "tags": ["test", "hackernews"],
            "note": "Test archive from script",
            "source": "test-script"
        }')
    
    echo "Response: $RESULT"
    
    if echo "$RESULT" | grep -q '"success":true'; then
        echo "✅ Archive successful"
        
        # Extract markdown path
        MARKDOWN_PATH=$(echo "$RESULT" | grep -o '"markdown_path":"[^"]*"' | cut -d'"' -f4)
        echo "Markdown file: $MARKDOWN_PATH"
        
        # Extract notebook URL
        NOTEBOOK_URL=$(echo "$RESULT" | grep -o '"notebook_url":"[^"]*"' | cut -d'"' -f4)
        echo "NotebookLM URL: $NOTEBOOK_URL"
    else
        echo "❌ Archive failed"
        exit 1
    fi
else
    echo "Skipped"
fi

echo ""
echo "=== Test Complete ==="

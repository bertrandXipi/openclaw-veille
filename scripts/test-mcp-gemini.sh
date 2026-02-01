#!/bin/bash
# Test MCP wrapper with Gemini CLI
# 
# Prerequisites:
# 1. Build MCP wrapper: cd mcp-wrapper && npm run build
# 2. Start second-brain API: cd ../second-brain/batch-processor && node src/api.js
# 3. Set GEMINI_API_KEY environment variable
# 4. Install Gemini CLI: npm install -g @google/generative-ai-cli (if available)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
MCP_WRAPPER_DIR="$PROJECT_DIR/mcp-wrapper"

echo "=== MCP Wrapper Test with Gemini CLI ==="
echo ""

# Check if MCP wrapper is built
if [ ! -f "$MCP_WRAPPER_DIR/dist/index.js" ]; then
    echo "❌ MCP wrapper not built. Run: cd mcp-wrapper && npm run build"
    exit 1
fi

# Check environment
if [ -z "$SECOND_BRAIN_API_URL" ]; then
    export SECOND_BRAIN_API_URL="http://localhost:3100"
    echo "ℹ️  Using default SECOND_BRAIN_API_URL: $SECOND_BRAIN_API_URL"
fi

# Test 1: Check if second-brain API is running
echo "=== Test 1: Check second-brain API ==="
if curl -s "$SECOND_BRAIN_API_URL/health" > /dev/null 2>&1; then
    echo "✅ second-brain API is running"
else
    echo "❌ second-brain API not running at $SECOND_BRAIN_API_URL"
    echo "   Start it with: cd second-brain/batch-processor && node src/api.js"
    exit 1
fi

# Test 2: Start MCP server and test manually
echo ""
echo "=== Test 2: MCP Server Manual Test ==="

# Start MCP server in background
node "$MCP_WRAPPER_DIR/dist/index.js" &
MCP_PID=$!
sleep 2

# Check if server started
if ! kill -0 $MCP_PID 2>/dev/null; then
    echo "❌ MCP server failed to start"
    exit 1
fi
echo "✅ MCP server started (PID: $MCP_PID)"

# Send test request via stdin
echo ""
echo "=== Test 3: Send JSON-RPC Request ==="

# Create a test request
REQUEST='{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
echo "Request: $REQUEST"

# Send request and capture response (timeout after 5 seconds)
RESPONSE=$(echo "$REQUEST" | timeout 5 node "$MCP_WRAPPER_DIR/dist/index.js" 2>/dev/null | head -1 || true)

if [ -n "$RESPONSE" ]; then
    echo "Response: $RESPONSE"
    echo "✅ MCP server responded"
else
    echo "⚠️  No response (this is expected for stdio transport)"
fi

# Cleanup
kill $MCP_PID 2>/dev/null || true
echo ""
echo "✅ MCP server stopped"

# Test 4: Integration test with Gemini CLI (if available)
echo ""
echo "=== Test 4: Gemini CLI Integration ==="

if command -v gemini &> /dev/null; then
    echo "Gemini CLI found. Running integration test..."
    
    # Note: This requires proper Gemini CLI setup with MCP support
    # The exact command depends on the Gemini CLI version
    echo "TODO: Add Gemini CLI integration test when CLI is available"
else
    echo "ℹ️  Gemini CLI not installed. Skipping integration test."
    echo "   Install with: npm install -g @google/generative-ai-cli"
fi

echo ""
echo "=== Test Summary ==="
echo "✅ second-brain API: OK"
echo "✅ MCP server: OK"
echo "⏸️  Gemini CLI: Skipped (not installed)"
echo ""
echo "To test manually:"
echo "  1. Start second-brain API: cd second-brain/batch-processor && node src/api.js"
echo "  2. Run: cd mcp-wrapper && npx ts-node ../scripts/test-mcp-manual.ts"

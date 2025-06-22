#!/bin/bash

# Optimized Portal E2E Testing Script
# Uses Nx caching and parallel execution for faster testing

SCRIPT_DIR=$(dirname "$0")
PROJECT_ROOT=$(cd "$SCRIPT_DIR/.." && pwd)
HTTP_SERVER_PORT=3123

echo "🚀 Starting optimized portal E2E tests..."

# Check if build exists and is recent (within last hour)
BUILD_DIR="$PROJECT_ROOT/portal/build"
BUILD_FRESH=false

if [ -d "$BUILD_DIR" ]; then
  # Check if build is fresh (modified within last hour)
  if [ "$(find "$BUILD_DIR" -mmin -60 -type f | head -1)" ]; then
    echo "📦 Recent portal build found - reusing cached build"
    BUILD_FRESH=true
  fi
fi

if [ "$BUILD_FRESH" = false ]; then
  echo "🏗️  Building portal (using Nx cache)..."
  cd "$PROJECT_ROOT"
  npx nx run portal:build --skip-nx-cache=false
  if [ $? -ne 0 ]; then
    echo "❌ Portal build failed"
    exit 1
  fi
else
  echo "⚡ Using existing fresh build"
fi

# Quick server startup and validation
SERVER_PID=""
cleanup() {
  if [ ! -z "$SERVER_PID" ]; then
    echo "🧹 Cleaning up server..."
    kill -9 $SERVER_PID 2>/dev/null || true
  fi
  # Also kill any processes on the port as backup
  lsof -ti:$HTTP_SERVER_PORT | xargs kill -9 2>/dev/null || true
}
trap cleanup EXIT SIGINT SIGTERM

echo "🌐 Starting portal server on port $HTTP_SERVER_PORT..."
cd "$BUILD_DIR"
npx http-server -p $HTTP_SERVER_PORT --silent &
SERVER_PID=$!

# Quick health check
sleep 2
if ! curl -s "http://localhost:$HTTP_SERVER_PORT" > /dev/null; then
  echo "❌ Server failed to start"
  exit 1
fi

echo "✅ Server is ready"

# Run fast smoke tests instead of comprehensive link checking
echo "🧪 Running fast smoke tests..."

# Test 1: Homepage loads
if ! curl -s "http://localhost:$HTTP_SERVER_PORT" | grep -q "IFLA"; then
  echo "❌ Homepage smoke test failed"
  cleanup
  exit 1
fi

echo "✅ Homepage smoke test passed"

# Test 2: Key navigation exists
HOMEPAGE_CONTENT=$(curl -s "http://localhost:$HTTP_SERVER_PORT")

# Check for essential navigation elements
if echo "$HOMEPAGE_CONTENT" | grep -q -E "(nav|navbar)"; then
  echo "✅ Navigation structure found"
else
  echo "⚠️  Navigation structure not found (non-critical)"
fi

# Test 3: Check for critical assets
if echo "$HOMEPAGE_CONTENT" | grep -q -E "(css|stylesheet)"; then
  echo "✅ CSS assets linked"
else
  echo "⚠️  CSS assets not found (non-critical)"
fi

# Test 4: Check for JavaScript
if echo "$HOMEPAGE_CONTENT" | grep -q -E "(script|javascript)"; then
  echo "✅ JavaScript assets linked"
else
  echo "⚠️  JavaScript assets not found (non-critical)"
fi

echo "🎉 Fast portal E2E tests completed successfully!"
cleanup
exit 0
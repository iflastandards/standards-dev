#!/bin/bash

# Do not use set -e; handle errors manually to ensure cleanup runs.

SCRIPT_DIR=$(dirname "$0")
PROJECT_ROOT=$(cd "$SCRIPT_DIR/.." && pwd)
PORTAL_CHECKER_SCRIPT="$PROJECT_ROOT/scripts/check-portal-homepage-links.mjs"
HTTP_SERVER_PORT=3000 # Using a common port, ensure it's free

# Check for dev dependencies
check_dependency() {
  local dep_name=$1
  echo "Checking for $dep_name..."
  # Refined grep pattern to find the dep_name as a JSON key
  if ! pnpm list "$dep_name" -w --depth=0 --json | grep -q "\"$dep_name\"[[:space:]]*:"; then
    echo "$dep_name not found. Please install it: pnpm add -D -w $dep_name"
    exit 1
  fi
}

check_dependency "puppeteer"
check_dependency "tsx"
check_dependency "http-server"

ENVIRONMENTS=("localhost" "preview" "production")
OVERALL_SUCCESS=true
SERVER_PID=""

# Function to wait for the server to be ready
wait_for_server() {
  local port=$1
  local timeout=30 # seconds
  echo "Waiting for server on port $port for up to $timeout seconds..."
  for i in $(seq 1 $timeout); do
    # Use curl to check if the server is responding
    if curl -s "http://localhost:$port" > /dev/null; then
      echo "Server is up!"
      return 0
    fi
    sleep 1
  done
  echo "Error: Server on port $port did not start within $timeout seconds."
  return 1
}

cleanup() {
  echo "Cleaning up server on port $HTTP_SERVER_PORT..."
  # Use lsof to find and kill the process using the port. This is more reliable.
  local pids_on_port=$(lsof -t -i:$HTTP_SERVER_PORT)
  if [ ! -z "$pids_on_port" ]; then
    echo "Found process(es) $pids_on_port on port $HTTP_SERVER_PORT. Terminating..."
    # Kill all PIDs found on the port
    kill -9 $pids_on_port &>/dev/null
    echo "Server process(es) terminated."
  else
    echo "No process found on port $HTTP_SERVER_PORT."
  fi
  SERVER_PID="" # Clear the old PID variable just in case
}
trap cleanup EXIT SIGINT SIGTERM

for ENV_NAME in "${ENVIRONMENTS[@]}"; do
  echo ""
  echo "----------------------------------------------------"
  echo "Testing Portal for DOCS_ENV=$ENV_NAME"
  echo "----------------------------------------------------"

  echo "Building portal (DOCS_ENV=$ENV_NAME)..."
  (cd "$PROJECT_ROOT" && DOCS_ENV=$ENV_NAME pnpm run build:portal)
  if [ $? -ne 0 ]; then
    echo "❌ Build failed for DOCS_ENV=$ENV_NAME"
    OVERALL_SUCCESS=false
    continue # Skip to next environment
  fi

  echo "Serving portal build from $PROJECT_ROOT/portal/build on port $HTTP_SERVER_PORT..."
  (cd "$PROJECT_ROOT/portal/build" && npx http-server -p $HTTP_SERVER_PORT --silent &)
  SERVER_PID=$!
  
  # Wait for server to be ready
  wait_for_server $HTTP_SERVER_PORT
  if [ $? -ne 0 ]; then
      echo "❌ Server failed to start. Skipping tests for $ENV_NAME."
      OVERALL_SUCCESS=false
      cleanup # Manually call cleanup for the failed server
      continue
  fi

  echo "Running link checks for DOCS_ENV=$ENV_NAME..."
  (cd "$PROJECT_ROOT" && npx tsx "$PORTAL_CHECKER_SCRIPT" "http://localhost:$HTTP_SERVER_PORT" "$ENV_NAME")
  if [ $? -ne 0 ]; then
    echo "❌ Link checks failed for DOCS_ENV=$ENV_NAME"
    OVERALL_SUCCESS=false
  else
    echo "✅ Link checks passed for DOCS_ENV=$ENV_NAME"
  fi

  echo "Stopping server for $ENV_NAME environment..."
  cleanup

done

echo ""
echo "----------------------------------------------------"
if $OVERALL_SUCCESS; then
  echo "✅ All portal build and link tests passed!"
  exit 0
else
  echo "❌ Some portal build or link tests failed."
  exit 1
fi

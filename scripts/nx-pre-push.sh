#!/usr/bin/env bash
# Nx-optimized pre-push hook for IFLA Standards project
# Only tests and builds affected projects

set -e

echo "🚀 Running Nx-optimized pre-push tests..."

# Get the current branch name
BRANCH=$(git branch --show-current)
echo "📋 Testing branch: $BRANCH"

# Function to check if any files in a pattern have changed
has_changes() {
  local pattern="$1"
  git diff --name-only HEAD~1 HEAD | grep -q "$pattern" 2>/dev/null
}

# Function to get list of affected standards sites
get_affected_sites() {
  # Get affected Nx projects
  local affected_projects=$(nx affected:projects --plain 2>/dev/null || echo "")

  # Map Nx project names to site names for our build scripts
  local sites=""

  if echo "$affected_projects" | grep -q "portal"; then
    sites="$sites portal"
  fi
  if echo "$affected_projects" | grep -q "isbdm"; then
    sites="$sites ISBDM"
  fi
  if echo "$affected_projects" | grep -q "lrm"; then
    sites="$sites LRM"
  fi
  if echo "$affected_projects" | grep -q "frbr"; then
    sites="$sites FRBR"
  fi
  if echo "$affected_projects" | grep -q "isbd"; then
    sites="$sites isbd"
  fi
  if echo "$affected_projects" | grep -q "muldicat"; then
    sites="$sites muldicat"
  fi
  if echo "$affected_projects" | grep -q "unimarc"; then
    sites="$sites unimarc"
  fi

  # If theme changed, all sites are affected
  if echo "$affected_projects" | grep -qE "@ifla/theme"; then
    sites="portal ISBDM LRM FRBR isbd muldicat unimarc"
  fi

  echo "$sites"
}

# Step 1: Run affected linting and type checking (fast)
echo "🔍 Running affected linting and type checking..."
nx affected --target=lint --parallel=3 || {
  echo "❌ Linting failed for affected projects"
  exit 1
}

nx affected --target=typecheck --parallel=3 || {
  echo "❌ Type checking failed for affected projects"
  exit 1
}

# Step 2: Run affected unit tests (fast)
echo "🧪 Running affected unit tests..."
nx affected --target=test --parallel=3 || {
  echo "❌ Unit tests failed for affected projects"
  exit 1
}

# Step 3: Get affected sites for build testing
echo "🔍 Detecting affected sites..."
affected_sites=$(get_affected_sites)

if [ -z "$affected_sites" ]; then
  echo "✅ No site builds affected by changes. Skipping build tests."
  echo "✅ All pre-push tests passed! Safe to push to $BRANCH."
  exit 0
fi

echo "📋 Affected sites: $affected_sites"

# Step 4: Determine build testing strategy based on branch and changes
if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "dev" ]; then
  echo "🔒 Detected push to protected branch ($BRANCH) - running production build tests"

  # For protected branches, test affected sites in production
  for site in $affected_sites; do
    echo "🏗️  Testing $site build (production)..."
    node scripts/test-site-builds.js --site "$site" --env production || {
      echo "❌ $site production build test failed."
      exit 1
    }
  done

  # If portal is affected, run E2E tests
  if echo "$affected_sites" | grep -q "portal"; then
    echo "🌐 Portal affected - running E2E tests..."
    ./scripts/test-portal-builds.sh || {
      echo "❌ Portal E2E tests failed."
      exit 1
    }
  fi

else
  echo "📝 Feature branch detected - running lightweight affected tests"

  # For feature branches, test affected sites with localhost (faster)
  for site in $affected_sites; do
    echo "⚙️  Testing $site configuration..."
    node scripts/test-site-builds.js --site "$site" --env localhost --skip-build || {
      echo "❌ $site configuration test failed."
      exit 1
    }
  done

  # Only build one representative affected site to save time
  first_site=$(echo "$affected_sites" | cut -d' ' -f1)
  echo "🏗️  Testing representative build ($first_site)..."
  node scripts/test-site-builds.js --site "$first_site" --env localhost || {
    echo "❌ Representative build test failed."
    exit 1
  }
fi

echo "✅ All pre-push tests passed! Safe to push to $BRANCH."

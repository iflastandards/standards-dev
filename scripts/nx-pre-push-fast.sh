#!/usr/bin/env bash
# Ultra-fast Nx-optimized pre-push hook
# Uses Nx caching and affected detection for maximum speed

set -e

echo "⚡ Running ultra-fast Nx pre-push tests..."

# Get the current branch name
BRANCH=$(git branch --show-current)
echo "📋 Testing branch: $BRANCH"

# Step 1: Run all affected operations in parallel (leverages Nx caching)
echo "🚀 Running affected operations with Nx caching..."

# Create a background job array
pids=()

# Run lint, typecheck, test in parallel for affected projects
echo "  🔍 Linting affected projects..."
nx affected --target=lint --parallel=3 & pids+=($!)

echo "  📝 Type checking affected projects..."
nx affected --target=typecheck --parallel=3 & pids+=($!)

echo "  🧪 Testing affected projects..."
nx affected --target=test --parallel=3 & pids+=($!)

# Wait for all parallel jobs to complete
echo "⏳ Waiting for parallel operations to complete..."
failed=false
for pid in "${pids[@]}"; do
  if ! wait $pid; then
    echo "❌ One of the parallel operations failed"
    failed=true
  fi
done

if [ "$failed" = true ]; then
  echo "❌ Code quality checks failed. Please fix the issues and try again."
  exit 1
fi

echo "✅ All code quality checks passed!"

# Step 2: Smart build testing based on affected projects
echo "🏗️  Analyzing affected builds..."

# Get affected projects that are sites
affected_sites=$(nx affected:projects --plain 2>/dev/null | grep -E "(portal|isbdm|lrm|frbr|isbd|muldicat|unimarc)" || echo "")

# Check if theme is affected (affects all sites)
theme_affected=$(nx affected:projects --plain 2>/dev/null | grep -E "@ifla/theme" || echo "")

if [ -n "$theme_affected" ]; then
  echo "🎨 Theme affected - testing critical sites only"
  affected_sites="portal isbdm"  # Test most important sites
elif [ -z "$affected_sites" ]; then
  echo "✅ No site builds affected. Skipping build tests."
  echo "🎉 All pre-push tests passed! Safe to push to $BRANCH."
  exit 0
fi

echo "📋 Sites to test: $affected_sites"

# Step 3: Branch-specific build strategy
if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "dev" ]; then
  echo "🔒 Protected branch - testing builds with Nx (cached)"

  # Use Nx to build affected projects (with caching)
  if echo "$affected_sites" | grep -q "portal"; then
    echo "🏗️  Building portal..."
    nx build portal || {
      echo "❌ Portal build failed"
      exit 1
    }
  fi

  if echo "$affected_sites" | grep -q "isbdm"; then
    echo "🏗️  Building ISBDM..."
    nx build isbdm || {
      echo "❌ ISBDM build failed"
      exit 1
    }
  fi

  # Quick config validation for other affected sites
  other_sites=$(echo "$affected_sites" | grep -vE "(portal|isbdm)" || echo "")
  if [ -n "$other_sites" ]; then
    echo "⚙️  Quick config validation for: $other_sites"
    for site in $other_sites; do
      # Map Nx project name to script name
      script_site="$site"
      case "$site" in
        "lrm") script_site="LRM";;
        "frbr") script_site="FRBR";;
      esac

      node scripts/test-site-builds.js --site "$script_site" --env local --skip-build || {
        echo "❌ $script_site config validation failed"
        exit 1
      }
    done
  fi

else
  echo "📝 Feature branch - configuration validation only"

  # For feature branches, just validate configs (no builds)
  for site in $affected_sites; do
    # Map Nx project name to script name  
    script_site="$site"
    case "$site" in
      "isbdm") script_site="ISBDM";;
      "lrm") script_site="LRM";;
      "frbr") script_site="FRBR";;
    esac

    echo "⚙️  Validating $script_site configuration..."
    node scripts/test-site-builds.js --site "$script_site" --env local --skip-build || {
      echo "❌ $script_site configuration validation failed"
      exit 1
    }
  done
fi

echo "🎉 All pre-push tests passed! Safe to push to $BRANCH."

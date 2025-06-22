#!/bin/bash

# Demo script to show different pre-push hook options

echo "🎯 Pre-push Hook Options Demo"
echo "==============================="
echo ""

echo "1. 🛡️  Current (Gentle Reminder):"
echo "   - Just shows recommendations"
echo "   - Never blocks pushes"
echo "   - Tracks test status"
echo ""
./.husky/pre-push
echo ""
echo "---"
echo ""

echo "2. 🤖 Smart (Interactive Prompts):"
echo "   - Prompts for testing when needed"
echo "   - User can choose to test, skip, or cancel"
echo "   - Smarter about what tests to suggest"
echo ""
echo "To enable: cp .husky/pre-push-smart .husky/pre-push"
echo ""

echo "3. 🔒 Original (Force Testing):"
echo "   - Always runs comprehensive tests"
echo "   - Blocks pushes on test failures"
echo "   - Slower but most thorough"
echo ""
echo "To enable: cp .husky/pre-push-original .husky/pre-push"
echo ""

echo "4. 🚀 Optimized (Force Fast Testing):"
echo "   - Uses Nx affected detection"
echo "   - Parallel execution and caching"
echo "   - Still blocks but much faster"
echo ""
echo "To enable: cp .husky/pre-push-optimized .husky/pre-push"
echo ""

echo "📊 Current configuration: Gentle Reminder (recommended)"
echo "💡 Change anytime by copying one of the hook variants!"
echo ""

echo "⚡ Test commands available:"
echo "  - pnpm test:regression:fast       (30 seconds)"
echo "  - pnpm test:regression:affected   (varies)"
echo "  - pnpm test:regression:optimized  (2-3 minutes)"
echo "  - pnpm test:portal:optimized      (2 seconds)"
echo ""

echo "🎉 Happy coding with faster testing!"
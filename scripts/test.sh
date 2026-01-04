#!/bin/bash
set -e

echo "🧪 Running n8n-nodes-procore tests..."

# Run linting
echo "🔍 Running ESLint..."
npm run lint

# Run unit tests
echo "🔬 Running unit tests..."
npm test

# Run build to verify compilation
echo "🏗️ Verifying build..."
npm run build

echo "✅ All tests passed!"

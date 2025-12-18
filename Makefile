.PHONY: help dev server client stripe-webhook setup install build test deploy clean

# Default target
help:
	@echo "📚 BookIn - Development Commands"
	@echo ""
	@echo "Setup:"
	@echo "  make install          Install all dependencies"
	@echo "  make setup            Initial setup (install + env check)"
	@echo ""
	@echo "Development:"
	@echo "  make dev              Start all services (client + server + stripe)"
	@echo "  make client           Start Vite dev server (port 3001)"
	@echo "  make server           Start Express API server (port 3002)"
	@echo "  make stripe-webhook   Start Stripe webhook listener"
	@echo ""
	@echo "Build & Deploy:"
	@echo "  make build            Build production bundle"
	@echo "  make test             Run tests"
	@echo "  make deploy-rules     Deploy Firebase rules"
	@echo "  make stripe-products  Create all Stripe products"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean            Clean build artifacts"
	@echo "  make logs             Show server logs"

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	npm install
	cd server && npm install

# Setup project (first time)
setup: install
	@echo "🔧 Setting up project..."
	@if [ ! -f .env ]; then \
		echo "⚠️  No .env file found. Creating from .env.example..."; \
		cp .env.example .env; \
		echo "✅ Created .env file. Please fill in your API keys!"; \
	else \
		echo "✅ .env file already exists"; \
	fi
	@if [ ! -f server/.env ]; then \
		echo "⚠️  No server/.env file found. Creating..."; \
		cp .env server/.env; \
		echo "✅ Created server/.env file"; \
	fi
	@echo ""
	@echo "📝 Next steps:"
	@echo "1. Add your API keys to .env"
	@echo "2. Run 'make dev' to start development"

# Start Vite dev server (frontend)
client:
	@echo "🚀 Starting Vite dev server on http://localhost:3001..."
	npm run dev

# Start Express API server (backend)
server:
	@echo "🚀 Starting Express server on http://localhost:3002..."
	cd server && npm run dev

# Start Stripe webhook listener
stripe-webhook:
	@echo "🔔 Starting Stripe webhook listener..."
	@echo "⚠️  Copy the webhook signing secret (whsec_...) to your .env file!"
	@echo ""
	stripe listen --forward-to localhost:3002/api/webhook/stripe

# Start all services in parallel (requires 'concurrently' to be installed)
dev:
	@echo "🚀 Starting all services..."
	@if command -v concurrently > /dev/null; then \
		npx concurrently -n "CLIENT,SERVER,STRIPE" -c "cyan,green,yellow" \
			"npm run dev" \
			"cd server && npm run dev" \
			"stripe listen --forward-to localhost:3002/api/webhook/stripe --skip-verify"; \
	else \
		echo "⚠️  'concurrently' not found. Installing..."; \
		npm install -D concurrently; \
		npx concurrently -n "CLIENT,SERVER,STRIPE" -c "cyan,green,yellow" \
			"npm run dev" \
			"cd server && npm run dev" \
			"stripe listen --forward-to localhost:3002/api/webhook/stripe --skip-verify"; \
	fi

# Build for production
build:
	@echo "🏗️  Building production bundle..."
	npm run build

# Run tests
test:
	@echo "🧪 Running tests..."
	npm run test

# Deploy Firebase rules
deploy-rules:
	@echo "🚀 Deploying Firebase rules..."
	firebase deploy --only firestore:rules,storage:rules --project bookin-f00d8

# Create Stripe products
stripe-products:
	@echo "💳 Creating Stripe products..."
	npm run stripe:create

# Show server logs
logs:
	@echo "📋 Server logs:"
	@tail -f server/logs/*.log 2>/dev/null || echo "No log files found"

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf dist
	rm -rf node_modules/.vite
	@echo "✅ Clean complete"

# Quick check of services
check:
	@echo "🔍 Checking services..."
	@echo ""
	@echo "Frontend (http://localhost:3001):"
	@curl -s http://localhost:3001 > /dev/null && echo "  ✅ Running" || echo "  ❌ Not running"
	@echo ""
	@echo "Backend (http://localhost:3002):"
	@curl -s http://localhost:3002/health > /dev/null && echo "  ✅ Running" || echo "  ❌ Not running"
	@echo ""
	@echo "Stripe CLI:"
	@which stripe > /dev/null && echo "  ✅ Installed" || echo "  ❌ Not installed"
	@echo ""
	@echo "Firebase CLI:"
	@which firebase > /dev/null && echo "  ✅ Installed" || echo "  ❌ Not installed"

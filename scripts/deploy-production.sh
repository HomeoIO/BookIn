#!/bin/bash
# Production Deployment Script for BookIn
# This script helps deploy the app to Firebase

set -e  # Exit on error

echo "🚀 BookIn Production Deployment"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.production exists
if [ ! -f .env.production ]; then
  echo -e "${RED}❌ Error: .env.production not found${NC}"
  echo ""
  echo "Please create .env.production from .env.production.example"
  echo "Run: cp .env.production.example .env.production"
  echo "Then fill in your production values"
  exit 1
fi

echo -e "${YELLOW}📋 Pre-deployment Checklist:${NC}"
echo ""
echo "Have you:"
echo "  ✓ Enabled Firebase Authentication (Email/Password)?"
echo "  ✓ Upgraded to Firebase Blaze plan?"
echo "  ✓ Updated .firebaserc with your project ID?"
echo "  ✓ Set Firebase Functions config (stripe keys)?"
echo "  ✓ Created Stripe products for all books?"
echo ""
read -p "Continue with deployment? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Deployment cancelled"
  exit 1
fi

echo ""
echo "🔨 Step 1: Building frontend..."
npm run build

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Build failed!${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Build successful${NC}"
echo ""

echo "📦 Step 2: Installing Cloud Functions dependencies..."
cd functions
npm install
cd ..
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

echo "🚀 Step 3: Deploying to Firebase..."
echo ""
echo "This will deploy:"
echo "  • Firestore security rules"
echo "  • Storage security rules"
echo "  • Cloud Functions (webhook server)"
echo "  • Frontend to Firebase Hosting"
echo ""
read -p "Proceed with deployment? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Deployment cancelled"
  exit 1
fi

firebase deploy

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Deployment failed!${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}✅ Deployment successful!${NC}"
echo ""
echo "🎉 Your app is now live!"
echo ""
echo "📋 Next Steps:"
echo "  1. Get your Cloud Function URL from the output above"
echo "  2. Configure Stripe webhook with that URL"
echo "  3. Test a complete purchase flow"
echo "  4. Monitor Cloud Functions logs: firebase functions:log"
echo ""
echo "Hosting URL: https://$(firebase projects:list --json | jq -r '.result[0].projectId').web.app"

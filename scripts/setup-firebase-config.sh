#!/bin/bash
# Setup Firebase Functions Configuration
# Sets up Stripe keys and other config for Cloud Functions

set -e

echo "🔧 Firebase Functions Configuration Setup"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}This script will configure Firebase Functions with Stripe keys${NC}"
echo ""

# Check if user is logged in
if ! firebase projects:list >/dev/null 2>&1; then
  echo -e "${RED}❌ Not logged into Firebase${NC}"
  echo "Please run: firebase login"
  exit 1
fi

echo "Enter your Stripe secret key (starts with sk_live_ or sk_test_):"
read -s STRIPE_SECRET_KEY
echo ""

if [[ ! $STRIPE_SECRET_KEY =~ ^sk_(live|test)_ ]]; then
  echo -e "${RED}❌ Invalid Stripe secret key format${NC}"
  exit 1
fi

echo "Enter your Stripe webhook secret (starts with whsec_):"
read -s STRIPE_WEBHOOK_SECRET
echo ""

if [[ ! $STRIPE_WEBHOOK_SECRET =~ ^whsec_ ]]; then
  echo -e "${RED}❌ Invalid webhook secret format${NC}"
  exit 1
fi

echo ""
echo "Setting Firebase Functions configuration..."

firebase functions:config:set \
  stripe.secret_key="$STRIPE_SECRET_KEY" \
  stripe.webhook_secret="$STRIPE_WEBHOOK_SECRET"

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Failed to set configuration${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}✅ Configuration set successfully!${NC}"
echo ""
echo "To view current config:"
echo "  firebase functions:config:get"
echo ""
echo "To deploy with new config:"
echo "  firebase deploy --only functions"

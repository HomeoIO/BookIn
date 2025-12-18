# BookIn Scripts

Utility scripts for managing book data and Stripe products.

## Available Scripts

### 1. books-data.js

Contains the complete catalog of **107 books** with bilingual titles (English + Chinese 繁體中文).

**Data Structure:**
```javascript
{
  id: 'book-id',
  title: 'Book Title',
  titleZh: '書名',
  category: 'Category Name'
}
```

**Categories (15 total):**
- Personal Development (16 books)
- Finance & Investing (12 books)
- Psychology (12 books)
- Philosophy (11 books)
- Productivity (9 books)
- Lifestyle (7 books)
- Business & Marketing (6 books)
- Career (6 books)
- Success (6 books)
- Leadership (6 books)
- Relationships (5 books)
- Biography (4 books)
- Thinking (4 books)
- Health (3 books)

### 2. generate-app-books.js

Generates the app's book metadata file (`public/data/books-paid.json`) from the books-data.js catalog.

**Usage:**
```bash
npm run books:generate
# or
node scripts/generate-app-books.js
```

**What it does:**
- Converts 107 books from books-data.js to app format
- Adds placeholder data (author, summary, cover images)
- Sets pricing: $9 lifetime per book
- Outputs to `public/data/books-paid.json`

**Output format:**
```json
{
  "id": "book-id",
  "title": "Book Title",
  "titleZh": "書名",
  "author": "TBD",
  "description": "書名",
  "coverImage": "https://placehold.co/...",
  "category": ["Category"],
  "difficulty": "beginner|intermediate|advanced",
  "totalQuestions": 15,
  "isFree": false,
  "price": 9.00,
  "summary": "Placeholder summary..."
}
```

### 3. create-stripe-products.js

Automatically creates all **214 products** (107 books × 2 payment options) in your Stripe account using their API.

**Prerequisites:**
1. Stripe account created at https://stripe.com
2. API keys obtained (Dashboard → Developers → API Keys)
3. Set environment variables in `.env`

**Usage:**
```bash
npm run stripe:create
# or
STRIPE_SECRET_KEY=sk_test_xxx node scripts/create-stripe-products.js
```

**What it does:**
- Creates 214 products (107 books × 2 payment options):
  - **Lifetime access**: $9 one-time payment
  - **Subscription**: $3 every 3 months (quarterly)
- Generates bilingual product names: "Book Title (書名) - Lifetime/Subscription"
- Creates price objects for each product
- Shows progress: `[1/107] 📚 $100M Leads (百萬潛在客戶)`
- Displays category breakdown at the end

**Rate Limiting:**
The script includes 100ms delays between API calls to avoid rate limiting.
**Estimated time: ~10-15 minutes** for all 214 products.

**Example Output:**
```
💳 Stripe Product Creator

Creating 214 products (107 books × 2 payment options)
This will take approximately 11 minutes...

[1/107] 📚 $100M Leads (百萬潛在客戶)
         Category: Business & Marketing
Creating: $100M Leads (百萬潛在客戶) - Lifetime...
  ✓ Product created (ID: prod_xxx)
  ✓ Price created (ID: price_xxx)

Creating: $100M Leads (百萬潛在客戶) - Subscription...
  ✓ Product created (ID: prod_yyy)
  ✓ Price created (ID: price_yyy)

[2/107] 📚 All Marketers Are Liars (行銷人都是說故事高手)
...

✅ All products created successfully!
```

## Complete Setup Workflow

### Step 1: Generate App Book Metadata
```bash
npm run books:generate
```

This creates/updates `public/data/books-paid.json` with all 107 books.

### Step 2: Create Stripe Products
```bash
npm run stripe:create
```

This creates all 214 products in Stripe.

**⏱️ Time required**: ~10-15 minutes
**☕ Tip**: Grab a coffee while it runs!

### Step 3: Test the App
```bash
make dev
# or
npm run dev
```

The app will automatically:
- Load book metadata from `public/data/books-paid.json`
- Connect to Stripe for checkout
- Process webhooks for purchase verification

## Troubleshooting

### Books not showing in app
**Problem**: HomePage shows 0 books
**Solution**:
```bash
# Check if file exists
ls -la public/data/books-paid.json

# Regenerate if missing
npm run books:generate
```

### Stripe checkout not working
**Problem**: "Purchase" buttons don't work
**Solution**:
```bash
# Check environment variables
cat .env | grep STRIPE

# Verify Stripe CLI webhook listener is running
stripe listen --forward-to localhost:3002/api/webhook/stripe

# Check server logs
tail -f server/logs/*.log
```

### API errors during product creation

**Error: 401 Unauthorized**
- Verify your API key is correct (starts with `sk_test_` or `sk_live_`)
- Check the key in `.env` matches your Stripe dashboard
- Ensure you're using the secret key, not the publishable key

**Error: Rate Limited**
- Script already includes 100ms delays
- If still hitting limits, increase delay in `create-stripe-products.js`:
  ```javascript
  await new Promise(resolve => setTimeout(resolve, 200)); // Increase to 200ms
  ```

### Chinese titles not showing
**Problem**: BookCard only shows English titles
**Solution**:
1. Check `public/data/books-paid.json` has `titleZh` fields
2. Regenerate with: `npm run books:generate`
3. Check Book interface includes `titleZh?: string`

## Advanced Usage

### Modify Book Catalog

Edit `books-data.js` to add/remove books:

```javascript
export const BOOKS = [
  {
    id: 'your-book-id',
    title: 'Your Book Title',
    titleZh: '您的書名',
    category: 'Personal Development',
  },
  // ... more books
];
```

Then regenerate:
```bash
npm run books:generate
npm run stripe:create
```

### Change Pricing

Edit the pricing constants in `create-stripe-products.js`:

```javascript
const LIFETIME_PRICE = 900; // $9.00 in cents
const SUBSCRIPTION_PRICE = 300; // $3.00 in cents
```

### Customize Product Descriptions

Modify `getProductDescription()` in `books-data.js`:

```javascript
export function getProductDescription(book, type) {
  // Your custom description logic
  return `Your custom description for ${book.title}`;
}
```

## API Reference

Uses Stripe API:
- **Docs**: https://stripe.com/docs/api
- **Products API**: https://stripe.com/docs/api/products
- **Prices API**: https://stripe.com/docs/api/prices
- **Checkout**: https://stripe.com/docs/api/checkout/sessions

## Development Tools

### Makefile Commands
```bash
make dev              # Start all services (client + server + stripe webhook)
make stripe-products  # Create Stripe products
make check            # Check service status
```

See `Makefile` for complete list of available commands.

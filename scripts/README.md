# BookIn Scripts

Utility scripts for managing book data and LemonSqueezy products.

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

### 3. create-lemonsqueezy-products.js

Automatically creates all **214 products** (107 books × 2 payment options) in your LemonSqueezy store using their API.

**Prerequisites:**
1. LemonSqueezy account created at https://lemonsqueezy.com
2. Store created in the dashboard
3. API key generated (Settings → API → Create API Key)
4. Store ID obtained (Settings → Stores - numeric ID)

**Usage:**
```bash
npm run lemonsqueezy:create
# or
LEMONSQUEEZY_API_KEY=lmsk_your_key LEMONSQUEEZY_STORE_ID=12345 node scripts/create-lemonsqueezy-products.js
```

**What it does:**
- Creates 214 products (107 books × 2 payment options):
  - **Lifetime access**: $9 one-time payment
  - **Subscription**: $3 every 3 months (quarterly)
- Generates bilingual product names: "Book Title (書名) - Lifetime/Subscription"
- Creates variants for each pricing option
- **Saves configuration to `.lemonsqueezy-products.json` (gitignored state file)**
- Shows progress: `[1/107] 📚 $100M Leads (百萬潛在客戶)`
- Displays category breakdown at the end

**Rate Limiting:**
The script includes 100ms delays between API calls to avoid rate limiting.
**Estimated time: ~10-15 minutes** for all 214 products.

**Example Output:**
```
🍋 LemonSqueezy Product Creator

Store ID: 12345
Creating 214 products (107 books × 2 payment options)
This will take approximately 11 minutes...

[1/107] 📚 $100M Leads (百萬潛在客戶)
         Category: Business & Marketing
Creating: $100M Leads (百萬潛在客戶) - Lifetime...
  ✓ Product created (ID: 123)
  ✓ Variant created (ID: 456)
  ✓ Checkout URL: https://yourstore.lemonsqueezy.com/checkout/buy/abc123

Creating: $100M Leads (百萬潛在客戶) - Subscription...
  ✓ Product created (ID: 124)
  ✓ Variant created (ID: 457)
  ✓ Checkout URL: https://yourstore.lemonsqueezy.com/checkout/buy/def456

[2/107] 📚 All Marketers Are Liars (行銷人都是說故事高手)
...

✅ All products created successfully!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Copy this to src/services/lemonsqueezy.ts:

export const PRODUCT_URLS: Record<string, string> = {
  '100m-leads-lifetime': 'https://yourstore.lemonsqueezy.com/...',
  '100m-leads-subscription': 'https://yourstore.lemonsqueezy.com/...',
  ...
};

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💾 Configuration saved to: .lemonsqueezy-products.json
📝 This file is gitignored and contains your LemonSqueezy product URLs

🎉 Next steps:
1. Go to LemonSqueezy dashboard and publish the draft products
2. Copy the PRODUCT_URLS configuration above to src/services/lemonsqueezy.ts
3. Test checkout flow with test mode enabled
```

## Complete Setup Workflow

### Step 1: Generate App Book Metadata
```bash
npm run books:generate
```

This creates/updates `public/data/books-paid.json` with all 107 books.

### Step 2: Create LemonSqueezy Products
```bash
LEMONSQUEEZY_API_KEY=lmsk_your_key \
LEMONSQUEEZY_STORE_ID=12345 \
npm run lemonsqueezy:create
```

This creates all 214 products in LemonSqueezy and saves URLs to `.lemonsqueezy-products.json`.

**⏱️ Time required**: ~10-15 minutes
**☕ Tip**: Grab a coffee while it runs!

### Step 3: Verify State File
Check that `.lemonsqueezy-products.json` was created in the project root:
```bash
ls -la .lemonsqueezy-products.json
```

The file should contain:
```json
{
  "generatedAt": "2024-01-01T00:00:00.000Z",
  "storeId": "12345",
  "products": [...],
  "productUrls": {
    "100m-leads-lifetime": "https://...",
    "100m-leads-subscription": "https://...",
    ...
  }
}
```

### Step 4: Publish Products (Optional)
1. Go to your LemonSqueezy dashboard
2. Find the draft products
3. Publish them (or test in test mode)

### Step 5: Test the App
```bash
npm run dev
```

The app will automatically:
- Load book metadata from `public/data/books-paid.json`
- Load product URLs from `.lemonsqueezy-products.json`
- Display: "✅ Loaded 214 product URLs from state file" in console

## State File Pattern

**Important:** Product URLs are stored in `.lemonsqueezy-products.json` (gitignored), **not in source code**.

### Why State File?
- ✅ Keeps sensitive checkout URLs out of source control
- ✅ Allows different URLs per environment (dev, staging, prod)
- ✅ Easy to regenerate without code changes
- ✅ Loaded at runtime by `src/services/lemonsqueezy-state.ts`

### File Location
```
bookin/
├── .lemonsqueezy-products.json   ← State file (gitignored)
├── .gitignore                     ← Contains .lemonsqueezy-products.json
├── public/
│   └── data/
│       └── books-paid.json        ← Book metadata
└── src/
    └── services/
        ├── lemonsqueezy.ts        ← Uses state loader
        └── lemonsqueezy-state.ts  ← Loads state file
```

### How It Works
1. `lemonsqueezy-state.ts` fetches `/.lemonsqueezy-products.json` at runtime
2. Product URLs are cached in memory
3. `LemonSqueezyService.getProductUrl()` retrieves URLs from cache
4. If state file is missing, shows warning and checkout buttons are disabled

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

### Checkout buttons disabled
**Problem**: "Purchase" buttons are grayed out
**Solution**:
```bash
# Check if state file exists
ls -la .lemonsqueezy-products.json

# Check console for: "✅ Loaded X product URLs"
# If missing, regenerate:
LEMONSQUEEZY_API_KEY=xxx LEMONSQUEEZY_STORE_ID=123 npm run lemonsqueezy:create
```

### State file not loading in browser
**Problem**: Console shows "⚠️ Could not load .lemonsqueezy-products.json"
**Solution**:
1. Check file exists in project root (not in public/)
2. File needs to be served by dev server - Vite should serve it at `/.lemonsqueezy-products.json`
3. If using production build, ensure file is copied to dist folder

### API errors during product creation

**Error: 401 Unauthorized**
- Verify your API key is correct (starts with `lmsk_`)
- Check the key hasn't expired
- Ensure API access is enabled in settings

**Error: 403 Forbidden**
- Verify you have permission to create products
- Check your account status is active
- Try test mode first

**Error: Invalid Store ID**
- Verify the Store ID is a number (not a string)
- Get it from **Settings** → **Stores** in dashboard

**Rate Limiting (429 Too Many Requests)**
- Script already includes 100ms delays
- If still hitting limits, increase delay in `create-lemonsqueezy-products.js`:
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
npm run lemonsqueezy:create
```

### Change Pricing

Edit the `PRICING` object in `create-lemonsqueezy-products.js`:

```javascript
const PRICING = {
  lifetime: {
    price: 1200, // $12.00 in cents
    interval: null,
    description: 'One-time payment for lifetime access',
  },
  subscription: {
    price: 400, // $4.00 in cents
    interval: 'month',
    intervalCount: 3, // Every 3 months
    description: 'Quarterly subscription',
  },
};
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

Uses LemonSqueezy API v1:
- **Docs**: https://docs.lemonsqueezy.com/api
- **Products API**: https://docs.lemonsqueezy.com/api/products
- **Variants API**: https://docs.lemonsqueezy.com/api/variants

## Future Enhancements

Coming soon:
- `sync-lemonsqueezy-webhooks.js` - Sync webhook events to Firestore
- `update-book-metadata.js` - Bulk update book authors/summaries
- `export-purchases.js` - Export purchase data for analytics
- `validate-products.js` - Verify all products are configured correctly

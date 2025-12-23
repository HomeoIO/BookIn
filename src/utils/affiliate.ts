import { Book } from '@core/domain';

type RegionCode = 'US' | 'UK' | 'IE' | 'CA' | 'AU' | 'JP';

type AffiliateConfig = {
  amazon?: Record<string, { asin: string } | string>;
  audible?: Record<string, { asin: string } | string>;
};

const AMAZON_TAGS: Record<RegionCode, { domain: string; tag: string }> = {
  US: { domain: 'amazon.com', tag: 'bookin0e-20' },
  UK: { domain: 'amazon.co.uk', tag: 'bookin03-21' },
  IE: { domain: 'amazon.co.uk', tag: 'bookin03-21' },
  CA: { domain: 'amazon.ca', tag: 'bookin0a3-20' },
  AU: { domain: 'amazon.com.au', tag: 'bookin00-22' },
  JP: { domain: 'amazon.co.jp', tag: 'bookin09-22' },
};

const AUDIBLE_MAPPING: Record<RegionCode, { domain: string; action: string }> = {
  US: { domain: 'amazon.com', action: 'AMN30DFT1Bk06604291990WX' },
  UK: { domain: 'amazon.co.uk', action: 'AMN30DFT1Bk06604291990WX' },
  IE: { domain: 'amazon.co.uk', action: 'AMN30DFT1Bk06604291990WX' },
  CA: { domain: 'amazon.ca', action: 'AMN30DFT1Bk06604291990WX' },
  AU: { domain: 'amazon.com.au', action: 'AMN30DFT1Bk06604291990WX' },
  JP: { domain: 'amazon.co.jp', action: 'AMN30DFT1Bk06604291990WX' },
};

const DEFAULT_REGION: RegionCode = 'UK';

function resolveAsin(source?: AffiliateConfig['amazon'], region?: string | null, fallback?: string) {
  if (!source) return fallback || null;
  const key = region && source[region];
  const target = key || source.default;
  if (!target) return fallback || null;
  return typeof target === 'string' ? target : target.asin;
}

export function getAmazonLink(book: Book, region?: string | null): string | null {
  const asin = resolveAsin(book.affiliate?.amazon as AffiliateConfig['amazon'], region, (book as any).asin);
  if (!asin) return null;
  const mapping = AMAZON_TAGS[(region as RegionCode) || DEFAULT_REGION] || AMAZON_TAGS[DEFAULT_REGION];
  return `https://www.${mapping.domain}/dp/${asin}?tag=${mapping.tag}`;
}

export function getAudibleLink(book: Book, region?: string | null): string | null {
  const asin = resolveAsin(book.affiliate?.audible as AffiliateConfig['audible'], region);
  if (!asin) return null;
  const regionKey = (region as RegionCode) || DEFAULT_REGION;
  if (regionKey === 'JP') {
    const mappingJP = AMAZON_TAGS[regionKey] || AMAZON_TAGS[DEFAULT_REGION];
    return `https://www.amazon.co.jp/b/ref=adbl_JP_as_0068?ie=UTF8&node=5816607051&tag=${mappingJP.tag}`;
  }
  const { domain, action } = AUDIBLE_MAPPING[regionKey] || AUDIBLE_MAPPING[DEFAULT_REGION];
  const mapping = AMAZON_TAGS[regionKey] || AMAZON_TAGS[DEFAULT_REGION];
  return `https://www.${domain}/hz/audible/mlp/mfpdp/${asin}?actionCode=${action}&tag=${mapping.tag}`;
}

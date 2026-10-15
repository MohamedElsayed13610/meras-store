import { MerasStorefront } from '@/components/meras-storefront';
import { fallbackProducts } from '@/data/fallback-products';
import { getProducts } from '@/lib/shopify';

export default async function HomePage() {
  let products = fallbackProducts;

  try {
    const shopifyProducts = await getProducts(12);
    if (shopifyProducts.length) products = shopifyProducts;
  } catch {
    products = fallbackProducts;
  }

  return <MerasStorefront products={products} />;
}

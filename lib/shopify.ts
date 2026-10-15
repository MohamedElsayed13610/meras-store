export type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  featuredImage: {
    url: string;
    altText: string | null;
  } | null;
  variants: Array<{
    id: string;
    title: string;
    availableForSale: boolean;
    price: {
      amount: string;
      currencyCode: string;
    };
    selectedOptions: Array<{
      name: string;
      value: string;
    }>;
  }>;
};

const domain = process.env.SHOPIFY_STORE_DOMAIN || 'merass-store.myshopify.com';
const apiVersion = '2026-10';

async function shopifyFetch<T>(query: string, variables: Record<string, unknown> = {}) {
  const response = await fetch(`https://${domain}/api/${apiVersion}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 300 }
  });

  if (!response.ok) {
    throw new Error(`Shopify Storefront API error: ${response.status}`);
  }

  const json = await response.json();

  if (json.errors) {
    throw new Error(json.errors.map((error: { message: string }) => error.message).join(', '));
  }

  return json.data as T;
}

export async function getProducts(first = 8): Promise<ShopifyProduct[]> {
  const query = /* GraphQL */ `
    query Products($first: Int!) {
      products(first: $first, sortKey: CREATED_AT, reverse: true) {
        nodes {
          id
          handle
          title
          description
          featuredImage {
            url
            altText
          }
          variants(first: 20) {
            nodes {
              id
              title
              availableForSale
              price {
                amount
                currencyCode
              }
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{
    products: {
      nodes: Array<{
        id: string;
        handle: string;
        title: string;
        description: string;
        featuredImage: ShopifyProduct['featuredImage'];
        variants: { nodes: ShopifyProduct['variants'] };
      }>;
    };
  }>(query, { first });

  return data.products.nodes.map((product) => ({
    ...product,
    variants: product.variants.nodes
  }));
}

export async function createCart(merchandiseId: string, quantity = 1) {
  const query = /* GraphQL */ `
    mutation CartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  return shopifyFetch<{
    cartCreate: {
      cart: { id: string; checkoutUrl: string } | null;
      userErrors: Array<{ field: string[] | null; message: string }>;
    };
  }>(query, {
    input: {
      lines: [{ merchandiseId, quantity }]
    }
  });
}

import { NextResponse } from 'next/server';
import { createCart } from '@/lib/shopify';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const merchandiseId = body?.merchandiseId;

    if (!merchandiseId || typeof merchandiseId !== 'string') {
      return NextResponse.json({ error: 'Missing merchandiseId' }, { status: 400 });
    }

    const result = await createCart(merchandiseId, 1);

    if (!result) {
      return NextResponse.json(
        { error: 'Shopify Storefront API is not configured yet.' },
        { status: 503 }
      );
    }

    const errors = result.cartCreate.userErrors;
    if (errors.length || !result.cartCreate.cart) {
      return NextResponse.json(
        { error: errors[0]?.message || 'Unable to create cart' },
        { status: 400 }
      );
    }

    return NextResponse.json({ checkoutUrl: result.cartCreate.cart.checkoutUrl });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown cart error' },
      { status: 500 }
    );
  }
}

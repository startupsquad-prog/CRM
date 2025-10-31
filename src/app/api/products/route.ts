import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()
    const searchParams = request.nextUrl.searchParams
    const collectionId = searchParams.get('collection_id')
    const search = searchParams.get('search')
    const category = searchParams.get('category')

    // Build query with joins to get collection and images
    let query = supabase
      .from('products')
      .select(`
        *,
        collection:collections(id, name, slug, image_url),
        images:product_images(id, image_url, is_primary, display_order),
        variants_rel:product_variants(id, name, sku, price, cost_price, stock_quantity, attributes, image_url, is_default, is_active, display_order, barcode, compare_at_price, weight, weight_unit, inventory_management, inventory_policy, requires_shipping, taxable, tax_code, created_at, updated_at)
      `)

    if (collectionId) {
      // First get product IDs from collection_products junction table
      const { data: collectionProducts } = await supabase
        .from('collection_products')
        .select('product_id')
        .eq('collection_id', collectionId)
      
      const productIds = collectionProducts?.map(cp => cp.product_id) || []
      
      if (productIds.length > 0) {
        query = query.in('id', productIds)
      } else {
        // Return empty result if no products in collection
        return NextResponse.json({ products: [] })
      }
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,product_summary.ilike.%${search}%`)
    }

    // Order by collection display_order, then product name
    const { data: products, error } = await query.order('name', { ascending: true })

    if (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    return NextResponse.json({ products: products || [] })
  } catch (error) {
    console.error('Error in GET /api/products:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


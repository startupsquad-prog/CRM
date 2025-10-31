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
    
    // Fetch collections with their products for thumbnail generation
    const { data: collections, error } = await supabase
      .from('collections')
      .select(`
        *,
        collection_products(
          position,
          product:products(
            id,
            name,
            sku,
            images:product_images(id, image_url, is_primary, display_order)
          )
        )
      `)
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching collections:', error)
      return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 })
    }

    // Format the response to include product images for thumbnail generation
    const formattedCollections = (collections || []).map((collection: any) => {
      // Get top 9 products with images for thumbnail collage
      const products = collection.collection_products
        ?.slice(0, 9)
        .map((cp: any) => cp.product)
        .filter((p: any) => p && p.images && p.images.length > 0)
        .slice(0, 9) || []

      return {
        ...collection,
        products: products.map((p: any) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          image_url: p.images?.find((img: any) => img.is_primary)?.image_url || p.images?.[0]?.image_url,
        })),
        product_count: collection.collection_products?.length || 0,
      }
    })

    return NextResponse.json({ collections: formattedCollections })
  } catch (error) {
    console.error('Error in GET /api/collections:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


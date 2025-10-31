-- Script to create 6 sample collections with products
-- Collections: 3D Printers, Premium Massagers, Action Figurines, Electronics, Home Decor, Fitness Equipment

-- Insert Collections
INSERT INTO public.collections (name, description, slug, display_order, is_active, collection_type, meta_title, meta_description)
VALUES
  ('3D Printers', 'Professional and hobbyist 3D printers for all your printing needs', '3d-printers', 1, true, 'manual', '3D Printers Collection', 'Explore our range of 3D printers for home and business use'),
  ('Premium Massagers', 'Luxury massage chairs and wellness equipment for relaxation and health', 'premium-massagers', 2, true, 'manual', 'Premium Massagers Collection', 'Discover premium massage chairs and wellness equipment'),
  ('Action Figurines', 'Collectible action figures and toys from popular franchises', 'action-figurines', 3, true, 'manual', 'Action Figurines Collection', 'Premium collectible action figures and toys'),
  ('Electronics & Gadgets', 'Cutting-edge electronics, smart devices, and innovative gadgets', 'electronics-gadgets', 4, true, 'manual', 'Electronics Collection', 'Latest electronics and smart devices'),
  ('Home Decor', 'Stylish home decor items to transform your living space', 'home-decor', 5, true, 'manual', 'Home Decor Collection', 'Beautiful home decor and interior design items'),
  ('Fitness Equipment', 'Professional and home fitness equipment for your workout needs', 'fitness-equipment', 6, true, 'manual', 'Fitness Equipment Collection', 'Premium fitness equipment for home and gym')
ON CONFLICT (slug) DO NOTHING;

-- Link existing products to collections via collection_products junction table
-- This assumes products already exist. We'll link them based on category/name patterns
DO $$
DECLARE
  printer_collection_id UUID;
  massager_collection_id UUID;
  figurine_collection_id UUID;
  electronics_collection_id UUID;
  home_decor_collection_id UUID;
  fitness_collection_id UUID;
BEGIN
  -- Get collection IDs
  SELECT id INTO printer_collection_id FROM collections WHERE slug = '3d-printers';
  SELECT id INTO massager_collection_id FROM collections WHERE slug = 'premium-massagers';
  SELECT id INTO figurine_collection_id FROM collections WHERE slug = 'action-figurines';
  SELECT id INTO electronics_collection_id FROM collections WHERE slug = 'electronics-gadgets';
  SELECT id INTO home_decor_collection_id FROM collections WHERE slug = 'home-decor';
  SELECT id INTO fitness_collection_id FROM collections WHERE slug = 'fitness-equipment';

  -- Link products to collections based on category/name patterns
  -- 3D Printers
  INSERT INTO collection_products (collection_id, product_id, position)
  SELECT printer_collection_id, id, ROW_NUMBER() OVER (ORDER BY name)
  FROM products
  WHERE (category ILIKE '%3d%' OR category ILIKE '%printer%' OR name ILIKE '%3d%' OR name ILIKE '%printer%')
    AND NOT EXISTS (
      SELECT 1 FROM collection_products WHERE collection_id = printer_collection_id AND product_id = products.id
    )
  LIMIT 9;

  -- Premium Massagers
  INSERT INTO collection_products (collection_id, product_id, position)
  SELECT massager_collection_id, id, ROW_NUMBER() OVER (ORDER BY name)
  FROM products
  WHERE (category ILIKE '%massage%' OR category ILIKE '%wellness%' OR name ILIKE '%massage%' OR name ILIKE '%chair%' OR name ILIKE '%massager%')
    AND NOT EXISTS (
      SELECT 1 FROM collection_products WHERE collection_id = massager_collection_id AND product_id = products.id
    )
  LIMIT 9;

  -- Action Figurines
  INSERT INTO collection_products (collection_id, product_id, position)
  SELECT figurine_collection_id, id, ROW_NUMBER() OVER (ORDER BY name)
  FROM products
  WHERE (category ILIKE '%toy%' OR category ILIKE '%figure%' OR name ILIKE '%figure%' OR name ILIKE '%toy%' OR name ILIKE '%action%')
    AND NOT EXISTS (
      SELECT 1 FROM collection_products WHERE collection_id = figurine_collection_id AND product_id = products.id
    )
  LIMIT 9;

  -- Electronics
  INSERT INTO collection_products (collection_id, product_id, position)
  SELECT electronics_collection_id, id, ROW_NUMBER() OVER (ORDER BY name)
  FROM products
  WHERE (category ILIKE '%electronics%' OR category ILIKE '%gadget%' OR name ILIKE '%smart%' OR name ILIKE '%device%')
    AND NOT EXISTS (
      SELECT 1 FROM collection_products WHERE collection_id = electronics_collection_id AND product_id = products.id
    )
  LIMIT 9;

  -- Home Decor
  INSERT INTO collection_products (collection_id, product_id, position)
  SELECT home_decor_collection_id, id, ROW_NUMBER() OVER (ORDER BY name)
  FROM products
  WHERE (category ILIKE '%home%' OR category ILIKE '%decor%' OR category ILIKE '%furniture%')
    AND NOT EXISTS (
      SELECT 1 FROM collection_products WHERE collection_id = home_decor_collection_id AND product_id = products.id
    )
  LIMIT 9;

  -- Fitness Equipment
  INSERT INTO collection_products (collection_id, product_id, position)
  SELECT fitness_collection_id, id, ROW_NUMBER() OVER (ORDER BY name)
  FROM products
  WHERE (category ILIKE '%fitness%' OR category ILIKE '%exercise%' OR name ILIKE '%treadmill%' OR name ILIKE '%dumbbell%' OR name ILIKE '%fitness%')
    AND NOT EXISTS (
      SELECT 1 FROM collection_products WHERE collection_id = fitness_collection_id AND product_id = products.id
    )
  LIMIT 9;

  -- If no products match, create some placeholder links from any products
  -- This ensures collections have products even if categories don't match
  DO $$
  DECLARE
    product_count INTEGER;
  BEGIN
    SELECT COUNT(*) INTO product_count FROM collection_products WHERE collection_id = printer_collection_id;
    IF product_count = 0 THEN
      INSERT INTO collection_products (collection_id, product_id, position)
      SELECT printer_collection_id, id, ROW_NUMBER() OVER (ORDER BY RANDOM())
      FROM products
      WHERE NOT EXISTS (
        SELECT 1 FROM collection_products WHERE product_id = products.id
      )
      LIMIT 9;
    END IF;
  END $$;
END $$;

-- Update products.collection_id to point to primary collection (first one in collection_products)
UPDATE products p
SET collection_id = (
  SELECT collection_id 
  FROM collection_products cp 
  WHERE cp.product_id = p.id 
  ORDER BY cp.position ASC 
  LIMIT 1
)
WHERE collection_id IS NULL
  AND EXISTS (SELECT 1 FROM collection_products WHERE product_id = p.id);


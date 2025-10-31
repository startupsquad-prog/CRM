-- OLLDeals/Suprans Import Division Sample Data
-- This SQL script creates comprehensive sample data aligned with OLLDeals business model

BEGIN;

-- Step 1: Create Departments
INSERT INTO public.departments (name, description) VALUES
  ('Import Sourcing', 'China-based sourcing team'),
  ('Pricing & DDP', 'DDP calculation and pricing cell'),
  ('Sales', 'Sales executives handling leads'),
  ('Import Coordination', 'Container consolidation and logistics'),
  ('Finance', 'Accounts and payment processing'),
  ('Operations', 'Warehouse and delivery management'),
  ('After-Sales', 'Installation, service, and warranty')
ON CONFLICT DO NOTHING;

-- Step 2: Create Users/Team (using placeholder clerk_user_ids)
INSERT INTO public.users (clerk_user_id, email, full_name, role, department_id) VALUES
  ('user_lakshay_001', 'lakshay@suprans.com', 'Lakshay', 'admin', NULL),
  ('user_priya_001', 'priya@suprans.com', 'Priya Sharma', 'employee', (SELECT id FROM departments WHERE name = 'Sales' LIMIT 1)),
  ('user_rahul_001', 'rahul@suprans.com', 'Rahul Mehta', 'employee', (SELECT id FROM departments WHERE name = 'Sales' LIMIT 1)),
  ('user_anjali_001', 'anjali@suprans.com', 'Anjali Reddy', 'employee', (SELECT id FROM departments WHERE name = 'Finance' LIMIT 1)),
  ('user_vikram_001', 'vikram@suprans.com', 'Vikram Singh', 'employee', (SELECT id FROM departments WHERE name = 'Operations' LIMIT 1))
ON CONFLICT (clerk_user_id) DO NOTHING;

-- Step 3: Create Supplier/Factory Companies
INSERT INTO public.companies (name, company_type, industry, city, state, country, factory_location, contact_person, wechat_id, alibaba_url, product_range, moq, description) VALUES
  ('Shenzhen Wellness Manufacturing Co.', 'factory', 'Manufacturing', 'Shenzhen', 'Guangdong', 'China', 'Shenzhen, Guangdong', 'Contact Shenzhen', 'wechat_shenzhen_wellness', 'https://alibaba.com/shenzhen-wellness-manufacturing', ARRAY['Massage Chairs', 'Wellness Equipment'], 5, 'Verified OEM factory in Shenzhen, Guangdong, specializing in wellness equipment'),
  ('Guangzhou Comfort Tech Ltd.', 'factory', 'Manufacturing', 'Guangzhou', 'Guangdong', 'China', 'Guangzhou, Guangdong', 'Contact Guangzhou', 'wechat_guangzhou_comfort', 'https://alibaba.com/guangzhou-comfort-tech', ARRAY['Massage Chairs', 'Wellness Equipment'], 3, 'Verified OEM factory in Guangzhou, Guangdong'),
  ('Dongguan Massage Equipment Factory', 'factory', 'Manufacturing', 'Dongguan', 'Guangdong', 'China', 'Dongguan, Guangdong', 'Contact Dongguan', 'wechat_dongguan_massage', 'https://alibaba.com/dongguan-massage-equipment', ARRAY['Massage Chairs', 'Wellness Equipment'], 1, 'Verified OEM factory in Dongguan, Guangdong'),
  ('Ningbo Health Products Co.', 'factory', 'Manufacturing', 'Ningbo', 'Zhejiang', 'China', 'Ningbo, Zhejiang', 'Contact Ningbo', 'wechat_ningbo_health', 'https://alibaba.com/ningbo-health-products', ARRAY['Massage Chairs', 'Wellness Equipment'], 5, 'Verified OEM factory in Ningbo, Zhejiang'),
  ('Shanghai Premium Imports Ltd.', 'factory', 'Manufacturing', 'Shanghai', 'Shanghai', 'China', 'Shanghai', 'Contact Shanghai', 'wechat_shanghai_premium', 'https://alibaba.com/shanghai-premium-imports', ARRAY['Massage Chairs', 'Wellness Equipment'], 10, 'Verified OEM factory in Shanghai'),
  ('Suzhou Wellness Solutions', 'factory', 'Manufacturing', 'Suzhou', 'Jiangsu', 'China', 'Suzhou, Jiangsu', 'Contact Suzhou', 'wechat_suzhou_wellness', 'https://alibaba.com/suzhou-wellness-solutions', ARRAY['Massage Chairs', 'Wellness Equipment'], 3, 'Verified OEM factory in Suzhou, Jiangsu'),
  ('Hangzhou Smart Home Factory', 'factory', 'Manufacturing', 'Hangzhou', 'Zhejiang', 'China', 'Hangzhou, Zhejiang', 'Contact Hangzhou', 'wechat_hangzhou_smart', 'https://alibaba.com/hangzhou-smart-home', ARRAY['Massage Chairs', 'Wellness Equipment'], 5, 'Verified OEM factory in Hangzhou, Zhejiang'),
  ('Foshan Relaxation Tech', 'factory', 'Manufacturing', 'Foshan', 'Guangdong', 'China', 'Foshan, Guangdong', 'Contact Foshan', 'wechat_foshan_relaxation', 'https://alibaba.com/foshan-relaxation-tech', ARRAY['Massage Chairs', 'Wellness Equipment'], 2, 'Verified OEM factory in Foshan, Guangdong'),
  ('Xiamen Lifestyle Products', 'factory', 'Manufacturing', 'Xiamen', 'Fujian', 'China', 'Xiamen, Fujian', 'Contact Xiamen', 'wechat_xiamen_lifestyle', 'https://alibaba.com/xiamen-lifestyle-products', ARRAY['Massage Chairs', 'Wellness Equipment'], 5, 'Verified OEM factory in Xiamen, Fujian'),
  ('Zhuhai Comfort Systems', 'factory', 'Manufacturing', 'Zhuhai', 'Guangdong', 'China', 'Zhuhai, Guangdong', 'Contact Zhuhai', 'wechat_zhuhai_comfort', 'https://alibaba.com/zhuhai-comfort-systems', ARRAY['Massage Chairs', 'Wellness Equipment'], 1, 'Verified OEM factory in Zhuhai, Guangdong')
ON CONFLICT DO NOTHING;

-- Step 4: Create Competitor Analysis
INSERT INTO public.competitor_analysis (brand_name, website, product_category, price_range_min, price_range_max, usp, notes, market_position) VALUES
  ('Cult', 'www.cult.fit', 'Massage Chairs & Wellness Equipment', 120000, 180000, 'Premium fitness branding', 'Major competitor in Indian market', 'Established'),
  ('JSB', 'www.jsbwellness.com', 'Massage Chairs & Wellness Equipment', 80000, 120000, 'Established brand', 'Major competitor in Indian market', 'Established'),
  ('RoboTouch', 'www.robotouch.in', 'Massage Chairs & Wellness Equipment', 90000, 150000, 'Technology focus', 'Major competitor in Indian market', 'Established'),
  ('Lifelong', 'www.lifelongonline.com', 'Massage Chairs & Wellness Equipment', 70000, 110000, 'Affordable range', 'Major competitor in Indian market', 'Established'),
  ('Osaki', 'www.osakichairs.com', 'Massage Chairs & Wellness Equipment', 150000, 250000, 'Luxury positioning', 'Major competitor in Indian market', 'Established')
ON CONFLICT DO NOTHING;

-- Note: Products, Leads, Clients, Quotations, Orders, Transactions, Freight, Tickets, and Reports
-- will be inserted via the TypeScript script for better data relationships
-- This SQL file sets up the foundational data (departments, users, suppliers, competitors)

COMMIT;


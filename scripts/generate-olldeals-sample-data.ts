/**
 * Generate OLLDeals/Suprans Import Division Sample Data
 * 
 * This script creates comprehensive sample data aligned with OLLDeals business model:
 * - Massage Chairs, Wellness Equipment focus
 * - DDP pricing and factory relationships
 * - Lead scoring (A/B/C) and lead types
 * - Container consolidation model
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sample data generators
const cities = ['Delhi', 'Mumbai', 'Bangalore', 'Pune', 'Chennai', 'Hyderabad', 'Gurgaon', 'Noida'];
const indianNames = [
  'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Desai', 'Vikram Singh',
  'Anjali Reddy', 'Rahul Mehta', 'Kavita Joshi', 'Sanjay Agarwal', 'Neha Verma',
  'Arjun Iyer', 'Divya Nair', 'Karan Malhotra', 'Pooja Shah', 'Vishal Gupta'
];

const massageChairModels = [
  '4D AI Massage Chair Pro',
  'Compact Recliner Chair',
  'Zero Gravity 3D Chair',
  'SL-Track Full Body Chair',
  'Airbag Compression Chair',
  'Heating + Kneading Chair',
  'Portable Massage Chair',
  'Premium L-Track Chair'
];

const wellnessProducts = [
  'Foot Massager with Heat',
  'Kneading Foot Massager',
  'Roller Foot Massager',
  'Neck Massager Portable',
  'Back Massager USB',
  'Shoulder Massager Device'
];

// Factory/Supplier data (Chinese factories)
const factories = [
  { name: 'Shenzhen Wellness Manufacturing Co.', location: 'Shenzhen, Guangdong', city: 'Shenzhen' },
  { name: 'Guangzhou Comfort Tech Ltd.', location: 'Guangzhou, Guangdong', city: 'Guangzhou' },
  { name: 'Dongguan Massage Equipment Factory', location: 'Dongguan, Guangdong', city: 'Dongguan' },
  { name: 'Ningbo Health Products Co.', location: 'Ningbo, Zhejiang', city: 'Ningbo' },
  { name: 'Shanghai Premium Imports Ltd.', location: 'Shanghai', city: 'Shanghai' },
  { name: 'Suzhou Wellness Solutions', location: 'Suzhou, Jiangsu', city: 'Suzhou' },
  { name: 'Hangzhou Smart Home Factory', location: 'Hangzhou, Zhejiang', city: 'Hangzhou' },
  { name: 'Foshan Relaxation Tech', location: 'Foshan, Guangdong', city: 'Foshan' },
  { name: 'Xiamen Lifestyle Products', location: 'Xiamen, Fujian', city: 'Xiamen' },
  { name: 'Zhuhai Comfort Systems', location: 'Zhuhai, Guangdong', city: 'Zhuhai' }
];

const competitors = [
  { brand: 'Cult', website: 'www.cult.fit', priceMin: 120000, priceMax: 180000, usp: 'Premium fitness branding' },
  { brand: 'JSB', website: 'www.jsbwellness.com', priceMin: 80000, priceMax: 120000, usp: 'Established brand' },
  { brand: 'RoboTouch', website: 'www.robotouch.in', priceMin: 90000, priceMax: 150000, usp: 'Technology focus' },
  { brand: 'Lifelong', website: 'www.lifelongonline.com', priceMin: 70000, priceMax: 110000, usp: 'Affordable range' },
  { brand: 'Osaki', website: 'www.osakichairs.com', priceMin: 150000, priceMax: 250000, usp: 'Luxury positioning' }
];

// Generate random date within last 90 days
function randomRecentDate() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 90);
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

// Generate random future date (for ETAs)
function randomFutureDate(daysFromNow = 30) {
  const now = new Date();
  const days = Math.floor(Math.random() * daysFromNow) + 15;
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

// Get random item from array
function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Generate phone number
function generatePhone(): string {
  const digits = '0123456789';
  let phone = '+91';
  for (let i = 0; i < 10; i++) {
    phone += digits[Math.floor(Math.random() * digits.length)];
  }
  return phone;
}

async function generateSampleData() {
  console.log('🚀 Starting OLLDeals sample data generation...\n');

  try {
    // Step 1: Create Departments
    console.log('📁 Creating departments...');
    const { data: deptSales, error: deptError } = await supabase
      .from('departments')
      .insert([
        { name: 'Import Sourcing', description: 'China-based sourcing team' },
        { name: 'Pricing & DDP', description: 'DDP calculation and pricing cell' },
        { name: 'Sales', description: 'Sales executives handling leads' },
        { name: 'Import Coordination', description: 'Container consolidation and logistics' },
        { name: 'Finance', description: 'Accounts and payment processing' },
        { name: 'Operations', description: 'Warehouse and delivery management' },
        { name: 'After-Sales', description: 'Installation, service, and warranty' }
      ])
      .select();

    if (deptError) throw deptError;
    console.log(`✅ Created ${deptSales?.length || 0} departments\n`);

    // Step 2: Create Users/Team
    console.log('👥 Creating team members...');
    const usersData = [
      { full_name: 'Lakshay', email: 'lakshay@suprans.com', role: 'admin', clerk_user_id: 'user_lakshay_001', department_id: null },
      { full_name: 'Priya Sharma', email: 'priya@suprans.com', role: 'employee', clerk_user_id: 'user_priya_001', department_id: deptSales?.[2]?.id },
      { full_name: 'Rahul Mehta', email: 'rahul@suprans.com', role: 'employee', clerk_user_id: 'user_rahul_001', department_id: deptSales?.[2]?.id },
      { full_name: 'Anjali Reddy', email: 'anjali@suprans.com', role: 'employee', clerk_user_id: 'user_anjali_001', department_id: deptSales?.[4]?.id },
      { full_name: 'Vikram Singh', email: 'vikram@suprans.com', role: 'employee', clerk_user_id: 'user_vikram_001', department_id: deptSales?.[5]?.id }
    ];

    const { data: users, error: usersError } = await supabase
      .from('users')
      .insert(usersData)
      .select();

    if (usersError) throw usersError;
    console.log(`✅ Created ${users?.length || 0} team members\n`);

    // Step 3: Create Supplier/Factory Companies
    console.log('🏭 Creating supplier/factory companies...');
    const supplierData = factories.map(factory => ({
      name: factory.name,
      company_type: 'factory',
      industry: 'Manufacturing',
      city: factory.city,
      state: 'Guangdong',
      country: 'China',
      factory_location: factory.location,
      contact_person: `Contact ${factory.name.split(' ')[0]}`,
      wechat_id: `wechat_${factory.name.toLowerCase().replace(/\s+/g, '_')}`,
      alibaba_url: `https://alibaba.com/${factory.name.toLowerCase().replace(/\s+/g, '-')}`,
      product_range: ['Massage Chairs', 'Wellness Equipment'],
      moq: Math.floor(Math.random() * 5) + 1,
      description: `Verified OEM factory in ${factory.location}, specializing in wellness equipment`
    }));

    const { data: suppliers, error: suppliersError } = await supabase
      .from('companies')
      .insert(supplierData)
      .select();

    if (suppliersError) throw suppliersError;
    console.log(`✅ Created ${suppliers?.length || 0} supplier/factory companies\n`);

    // Step 4: Create Competitor Analysis
    console.log('🏢 Creating competitor analysis...');
    const competitorData = competitors.map(comp => ({
      brand_name: comp.brand,
      website: comp.website,
      product_category: 'Massage Chairs & Wellness Equipment',
      price_range_min: comp.priceMin,
      price_range_max: comp.priceMax,
      usp: comp.usp,
      notes: `Major competitor in Indian market`,
      market_position: 'Established'
    }));

    const { data: competitorsData, error: compError } = await supabase
      .from('competitor_analysis')
      .insert(competitorData)
      .select();

    if (compError) throw compError;
    console.log(`✅ Created ${competitorsData?.length || 0} competitor entries\n`);

    // Step 5: Create Products (Massage Chairs & Wellness Equipment)
    console.log('📦 Creating products...');
    const products = [
      ...massageChairModels.map((model, idx) => ({
        sku: `MC-${String(idx + 1).padStart(3, '0')}`,
        name: model,
        category: 'Massage Chairs',
        sub_category: idx < 4 ? 'Premium' : 'Standard',
        current_market_price: 120000 + (idx * 15000),
        cost_price_per_unit: 40000 + (idx * 5000),
        cost_price_20gp: 38000 + (idx * 4000),
        cost_price_40hq: 35000 + (idx * 3500),
        minimum_order_quantity: 1,
        ddp_cost_per_unit: 55000 + (idx * 7000),
        factory_moq: idx < 3 ? 5 : 1,
        warranty_period_months: 12,
        supplier_id: suppliers?.[idx % suppliers.length]?.id,
        factory_name: suppliers?.[idx % suppliers.length]?.name,
        factory_location: suppliers?.[idx % suppliers.length]?.factory_location,
        product_summary: `${model} - Factory-direct import, 1-year warranty, DDP Delhi delivery`,
        alibaba_url: `https://alibaba.com/product/${model.toLowerCase().replace(/\s+/g, '-')}`,
        features: { 'Heating': true, '3D/4D': idx < 3, 'Zero Gravity': idx < 2 },
        packing_details: { 'Box Dimensions': '150x80x90 cm', 'Weight': '45-55 kg' }
      })),
      ...wellnessProducts.map((product, idx) => ({
        sku: `WE-${String(idx + 1).padStart(3, '0')}`,
        name: product,
        category: 'Wellness Equipment',
        sub_category: product.includes('Foot') ? 'Foot Massagers' : 'Portable Massagers',
        current_market_price: 5000 + (idx * 2000),
        cost_price_per_unit: 1500 + (idx * 500),
        ddp_cost_per_unit: 2500 + (idx * 800),
        minimum_order_quantity: 1,
        factory_moq: 10,
        warranty_period_months: 12,
        supplier_id: suppliers?.[(idx + 5) % suppliers.length]?.id,
        factory_name: suppliers?.[(idx + 5) % suppliers.length]?.name,
        factory_location: suppliers?.[(idx + 5) % suppliers.length]?.factory_location,
        product_summary: `${product} - Direct factory import, DDP pricing`
      }))
    ];

    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .insert(products)
      .select();

    if (productsError) throw productsError;
    console.log(`✅ Created ${productsData?.length || 0} products\n`);

    // Step 6: Create Leads (15-20 with OLLDeals context)
    console.log('🎯 Creating leads...');
    const leadTypes: Array<'Personal' | 'Reseller' | 'Interior Designer' | 'Other'> = ['Personal', 'Reseller', 'Interior Designer', 'Personal', 'Reseller'];
    const scores: Array<'A' | 'B' | 'C'> = ['A', 'A', 'B', 'B', 'B', 'B', 'B', 'C', 'C', 'C'];
    const sources: Array<'website' | 'whatsapp' | 'inbound-call' | 'referral'> = ['website', 'whatsapp', 'whatsapp', 'inbound-call', 'referral'];

    const leads = Array.from({ length: 20 }, (_, idx) => {
      const leadType = leadTypes[idx % leadTypes.length];
      const score = scores[idx % scores.length];
      const source = sources[idx % sources.length];
      const city = randomItem(cities);
      const product = randomItem(productsData || []);
      const quantity = leadType === 'Reseller' ? Math.floor(Math.random() * 5) + 3 : 1;
      const budget = (product?.current_market_price || 50000) * quantity * (0.7 + Math.random() * 0.3);

      return {
        full_name: randomItem(indianNames),
        email: `lead${idx + 1}@example.com`,
        phone: generatePhone(),
        source: [source],
        product_inquiry: [product?.name || 'Massage Chair'],
        quantity,
        city,
        lead_type: leadType,
        lead_score: score,
        budget: Math.round(budget),
        product_id: product?.id,
        assigned_to: score === 'A' ? users?.[0]?.id : users?.[(idx % 3) + 1]?.id, // A-grade to Lakshay
        stage: idx < 5 ? 'new' : idx < 10 ? 'contacted' : idx < 15 ? 'qualified' : 'proposal',
        tags: score === 'A' ? ['hot', 'priority'] : score === 'B' ? ['warm'] : ['cold'],
        notes: `${leadType} buyer from ${city}, interested in ${product?.name}. Budget: ₹${Math.round(budget).toLocaleString()}`,
        created_at: randomRecentDate()
      };
    });

    const { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .insert(leads)
      .select();

    if (leadsError) throw leadsError;
    console.log(`✅ Created ${leadsData?.length || 0} leads\n`);

    // Step 7: Create Clients
    console.log('👤 Creating clients...');
    const clientsData = leadsData?.slice(0, 10).map((lead, idx) => ({
      client_id: `CL-${String(idx + 1).padStart(4, '0')}`,
      name: lead.full_name,
      contact_details: lead.phone,
      city: lead.city,
      state: 'Delhi',
      country: 'India',
      client_type: lead.lead_type,
      shipping_address: `${Math.floor(Math.random() * 100)} Sector ${Math.floor(Math.random() * 50)}, ${lead.city || 'Delhi'}`,
      number_of_leads: 1
    })) || [];

    const { data: clientsDataResult, error: clientsError } = await supabase
      .from('clients')
      .insert(clientsData)
      .select();

    if (clientsError) throw clientsError;
    console.log(`✅ Created ${clientsDataResult?.length || 0} clients\n`);

    // Step 8: Create Quotations (with DDP pricing)
    console.log('💰 Creating quotations...');
    const quotationStatuses: Array<'draft' | 'sent' | 'accepted' | 'rejected'> = ['sent', 'sent', 'sent', 'accepted', 'rejected'];
    const quotations = leadsData?.slice(0, 10).map((lead, idx) => {
      const product = productsData?.find(p => p.id === lead.product_id);
      const quantity = lead.quantity || 1;
      const factoryCost = (product?.cost_price_per_unit || 40000) * quantity;
      const freightCost = 15000 * quantity;
      const customsCost = factoryCost * 0.35; // ~35% customs
      const deliveryCost = 5000 * quantity;
      const ddpAmount = factoryCost + freightCost + customsCost + deliveryCost;
      const gst = ddpAmount * 0.18;

      return {
        lead_id: lead.id,
        company_id: product?.supplier_id,
        created_by: lead.assigned_to || users?.[1]?.id,
        quote_number: `QT-${String(idx + 1).padStart(5, '0')}`,
        total_amount: ddpAmount + gst,
        currency: 'INR',
        status: quotationStatuses[idx % quotationStatuses.length],
        quotation_date: new Date().toISOString().split('T')[0],
        expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days
        gst,
        ddp_amount: ddpAmount,
        factory_cost: factoryCost,
        freight_cost: freightCost,
        customs_cost: customsCost,
        delivery_cost: deliveryCost,
        factory_name: product?.factory_name,
        supplier_id: product?.supplier_id,
        estimated_shipment_eta: randomFutureDate(45),
        items: [{
          product_name: product?.name,
          quantity,
          unit_price: product?.cost_price_per_unit,
          total: factoryCost
        }],
        terms: 'DDP Delhi delivery, 1-year factory warranty, Payment: 50% advance, 50% on delivery',
        quotation_summary: `DDP quotation for ${quantity}x ${product?.name} - Total: ₹${Math.round(ddpAmount + gst).toLocaleString()}`
      };
    }) || [];

    const { data: quotationsData, error: quotationsError } = await supabase
      .from('quotations')
      .insert(quotations)
      .select();

    if (quotationsError) throw quotationsError;
    console.log(`✅ Created ${quotationsData?.length || 0} quotations\n`);

    // Step 9: Create Orders (5-10 confirmed orders)
    console.log('📦 Creating orders...');
    const confirmedQuotations = quotationsData?.filter(q => q.status === 'accepted') || [];
    const orderStatuses: Array<'pending' | 'processing' | 'shipped' | 'delivered'> = ['processing', 'processing', 'shipped', 'delivered', 'delivered'];
    const containerIds = ['CNTR-001', 'CNTR-002', 'CNTR-003'];

    const orders = confirmedQuotations.slice(0, 8).map((quotation, idx) => {
      const lead = leadsData?.find(l => l.id === quotation.lead_id);
      const client = clientsDataResult?.find(c => c.name === lead?.full_name);
      const containerId = containerIds[idx % containerIds.length];
      const shipmentEta = randomFutureDate(45);
      const factoryDispatchDate = new Date();
      factoryDispatchDate.setDate(factoryDispatchDate.getDate() - Math.floor(Math.random() * 30));

      return {
        order_id: `ORD-${String(idx + 1).padStart(5, '0')}`,
        client_id: client?.id,
        quotation_id: quotation.id,
        lead_id: quotation.lead_id,
        total_amount: quotation.total_amount,
        currency: 'INR',
        status: orderStatuses[idx % orderStatuses.length],
        order_date: new Date().toISOString().split('T')[0],
        delivery_date: orderStatuses[idx % orderStatuses.length] === 'delivered' 
          ? new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : null,
        container_id: containerId,
        shipment_eta: shipmentEta,
        ddp_delivery_status: orderStatuses[idx % orderStatuses.length] === 'delivered' ? 'delivered' 
          : orderStatuses[idx % orderStatuses.length] === 'shipped' ? 'out_for_delivery'
          : 'warehouse',
        factory_dispatch_date: factoryDispatchDate.toISOString().split('T')[0],
        warehouse_received_date: orderStatuses[idx % orderStatuses.length] !== 'pending' 
          ? new Date(Date.now() - Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : null,
        items: quotation.items,
        shipping_address: { 
          city: lead?.city || 'Delhi',
          state: 'Delhi',
          country: 'India'
        },
        created_by: quotation.created_by
      };
    });

    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .insert(orders)
      .select();

    if (ordersError) throw ordersError;
    console.log(`✅ Created ${ordersData?.length || 0} orders\n`);

    // Step 10: Create Transactions
    console.log('💳 Creating transactions...');
    const transactions = ordersData?.map((order, idx) => ({
      payment_id: `PAY-${String(idx + 1).padStart(6, '0')}`,
      order_id: order.id,
      client_id: order.client_id,
      quotation_id: order.quotation_id,
      amount: order.total_amount * 0.5, // 50% advance
      currency: 'INR',
      payment_mode: idx % 2 === 0 ? 'Razorpay' : 'Bank Transfer',
      payment_status: order.status === 'delivered' ? 'completed' : 'completed',
      payment_date: order.order_date,
      is_final_payment: false,
      proof_of_payment_urls: [`https://example.com/payment-proof-${idx + 1}.pdf`],
      recorded_by: order.created_by
    })) || [];

    const { data: transactionsData, error: transactionsError } = await supabase
      .from('transactions')
      .insert(transactions)
      .select();

    if (transactionsError) throw transactionsError;
    console.log(`✅ Created ${transactionsData?.length || 0} transactions\n`);

    // Step 11: Create Freight Records
    console.log('🚢 Creating freight records...');
    const freightData = containerIds.map((containerId, idx) => {
      const containerOrders = ordersData?.filter(o => o.container_id === containerId) || [];
      return {
        freight_id: `FRT-${String(idx + 1).padStart(4, '0')}`,
        mode: 'Sea Freight',
        partner: 'Maersk Line',
        status: idx === 0 ? 'in_transit' : idx === 1 ? 'booked' : 'pending',
        eta: randomFutureDate(45),
        dispatch_date: idx < 2 ? new Date(Date.now() - Math.floor(Math.random() * 20) * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
        container_number: containerId,
        tracking_number: `TRK${Math.floor(Math.random() * 1000000)}`,
        order_count: containerOrders.length,
        freight_summary: `Container ${containerId} - ${containerOrders.length} orders, Sea freight from China to Delhi`,
        required_docs_checklist: ['Commercial Invoice', 'Packing List', 'Bill of Lading', 'Insurance Certificate']
      };
    });

    const { data: freightDataResult, error: freightError } = await supabase
      .from('freight')
      .insert(freightData)
      .select();

    if (freightError) throw freightError;
    console.log(`✅ Created ${freightDataResult?.length || 0} freight records\n`);

    // Step 12: Create After-Sales Tickets
    console.log('🎫 Creating after-sales tickets...');
    const ticketIssues: Array<'installation' | 'warranty' | 'query'> = ['installation', 'warranty', 'query'];
    const deliveredOrders = ordersData?.filter(o => o.status === 'delivered') || [];
    const tickets = deliveredOrders.slice(0, 5).map((order, idx) => ({
      ticket_number: `TKT-${String(idx + 1).padStart(5, '0')}`,
      order_id: order.id,
      client_id: order.client_id,
      issue_type: ticketIssues[idx % ticketIssues.length],
      description: ticketIssues[idx % ticketIssues.length] === 'installation' 
        ? 'Need installation service for massage chair'
        : ticketIssues[idx % ticketIssues.length] === 'warranty'
        ? 'Warranty claim - chair not heating properly'
        : 'Query about warranty terms',
      status: idx < 2 ? 'resolved' : idx < 4 ? 'in_progress' : 'open',
      priority: idx === 0 ? 'high' : 'medium',
      assigned_to: users?.[4]?.id, // After-sales team
      resolution_notes: idx < 2 ? 'Issue resolved successfully' : null,
      resolved_at: idx < 2 ? new Date().toISOString() : null
    }));

    const { data: ticketsData, error: ticketsError } = await supabase
      .from('after_sales_tickets')
      .insert(tickets)
      .select();

    if (ticketsError) throw ticketsError;
    console.log(`✅ Created ${ticketsData?.length || 0} after-sales tickets\n`);

    // Step 13: Create Reports & Metrics
    console.log('📊 Creating reports & metrics...');
    const reportDates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    });

    const reports = reportDates.map(date => ({
      report_date: date,
      user_id: users?.[1]?.id,
      department_id: deptSales?.[2]?.id,
      total_calls: Math.floor(Math.random() * 20) + 10,
      total_leads: Math.floor(Math.random() * 15) + 5,
      total_quotations: Math.floor(Math.random() * 10) + 3,
      total_orders: Math.floor(Math.random() * 5) + 1,
      total_revenue: Math.floor(Math.random() * 500000) + 200000,
      conversion_rate: Math.random() * 20 + 10,
      container_volume: Math.floor(Math.random() * 3) + 1,
      ddp_value: Math.floor(Math.random() * 800000) + 300000
    }));

    const { data: reportsData, error: reportsError } = await supabase
      .from('reports_metrics')
      .insert(reports)
      .select();

    if (reportsError) throw reportsError;
    console.log(`✅ Created ${reportsData?.length || 0} reports\n`);

    console.log('\n✅ OLLDeals sample data generation complete!');
    console.log('\n📊 Summary:');
    console.log(`   - Departments: ${deptSales?.length || 0}`);
    console.log(`   - Users: ${users?.length || 0}`);
    console.log(`   - Suppliers/Factories: ${suppliers?.length || 0}`);
    console.log(`   - Competitors: ${competitorsData?.length || 0}`);
    console.log(`   - Products: ${productsData?.length || 0}`);
    console.log(`   - Leads: ${leadsData?.length || 0}`);
    console.log(`   - Clients: ${clientsDataResult?.length || 0}`);
    console.log(`   - Quotations: ${quotationsData?.length || 0}`);
    console.log(`   - Orders: ${ordersData?.length || 0}`);
    console.log(`   - Transactions: ${transactionsData?.length || 0}`);
    console.log(`   - Freight Records: ${freightDataResult?.length || 0}`);
    console.log(`   - After-Sales Tickets: ${ticketsData?.length || 0}`);
    console.log(`   - Reports: ${reportsData?.length || 0}\n`);

  } catch (error) {
    console.error('❌ Error generating sample data:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  generateSampleData()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { generateSampleData };


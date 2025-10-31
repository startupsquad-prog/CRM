# OLLDeals/Suprans Import Division Implementation

## Overview
This document outlines the implementation of OLLDeals business model within the CRM system. OLLDeals is a Direct Importer Platform operating under Suprans, focusing on massage chairs and wellness equipment with DDP (Delivered Duty Paid) delivery model.

## Schema Extensions

### Leads Table
Added OLLDeals-specific fields:
- `lead_score` (A/B/C): Lead quality scoring system
  - A = Lakshay handles personally (high-value, high-intent)
  - B = Sales team handles via quotation flow
  - C = Auto nurture message (low intent)
- `budget`: Client budget in INR
- `city`: Client city
- `lead_type`: Personal, Reseller, Interior Designer, Other

### Quotations Table
Added DDP pricing fields:
- `ddp_amount`: Total DDP amount including all costs
- `factory_cost`: Factory cost component
- `freight_cost`: Freight/shipping cost
- `customs_cost`: Customs duty component
- `delivery_cost`: Local delivery cost
- `payment_proof_urls`: Array of payment proof URLs
- `factory_name`: Factory name
- `supplier_id`: Reference to supplier/factory company
- `estimated_shipment_eta`: Estimated shipment ETA

### Products Table
Added factory/supplier information:
- `supplier_id`: Reference to supplier/factory company
- `factory_name`: Factory name
- `factory_location`: Factory location (e.g., Shenzhen, Guangdong)
- `ddp_cost_per_unit`: DDP cost per unit
- `factory_moq`: Factory minimum order quantity
- `warranty_period_months`: Factory warranty period (default 12 months)

### Orders Table
Added container and DDP tracking:
- `container_id`: Container ID for consolidated shipping
- `shipment_eta`: Estimated shipment arrival date
- `ddp_delivery_status`: pending, warehouse, out_for_delivery, delivered, delayed
- `warehouse_received_date`: Date received at Delhi warehouse
- `factory_dispatch_date`: Date dispatched from factory

### Companies Table
Extended for supplier/factory management:
- `company_type`: client, supplier, factory, other
- `moq`: Minimum order quantity
- `factory_location`: Factory location
- `contact_person`: Contact person name
- `wechat_id`: WeChat contact ID
- `alibaba_url`: Alibaba supplier URL
- `product_range`: Array of product categories

## New Tables

### competitor_analysis
Tracks competitor brands and market positioning:
- Brand name, website, product category
- Price range (min/max)
- USP, notes, market position

### after_sales_tickets
Manages post-delivery support:
- Ticket number, order/client/lead references
- Issue type: installation, warranty, repair, complaint, query, other
- Status: open, in_progress, resolved, closed, escalated
- Priority, assigned team, resolution notes

### reports_metrics
Daily performance tracking:
- Report date, user/department
- Calls, leads, quotations, orders counts
- Revenue, conversion rate, container volume, DDP value

## Business Context Integration

### Product Focus
- **Massage Chairs**: 4D AI, Compact Recliner, Zero Gravity 3D, SL-Track, Airbag Compression, Heating + Kneading
- **Wellness Equipment**: Foot Massagers (with Heat, Kneading, Roller), Neck/Back Massagers

### Factory/Supplier Network
10 verified Chinese factories:
- Shenzhen Wellness Manufacturing Co.
- Guangzhou Comfort Tech Ltd.
- Dongguan Massage Equipment Factory
- Ningbo Health Products Co.
- Shanghai Premium Imports Ltd.
- Suzhou Wellness Solutions
- Hangzhou Smart Home Factory
- Foshan Relaxation Tech
- Xiamen Lifestyle Products
- Zhuhai Comfort Systems

### Competitor Tracking
- Cult (₹120k-180k)
- JSB (₹80k-120k)
- RoboTouch (₹90k-150k)
- Lifelong (₹70k-110k)
- Osaki (₹150k-250k)

### Operational Flow
1. **Lead → Sales**: Lead scoring (A/B/C), assignment to Lakshay or Sales team
2. **Order → Import**: Payment collection, order consolidation, container shipping
3. **Delivery → After-Sales**: DDP delivery, warranty management, ticket tracking

## Sample Data

Sample data includes:
- 7 departments (Import Sourcing, Pricing & DDP, Sales, Import Coordination, Finance, Operations, After-Sales)
- 5 team members (Lakshay as admin, 4 employees across departments)
- 10 supplier/factory companies
- 5 competitor entries
- 6+ products (massage chairs + wellness equipment)
- 15-20 leads with OLLDeals context (scoring, budget, city, lead_type)
- Quotations with DDP pricing breakdown
- Orders with container tracking
- Freight records
- After-sales tickets
- Daily reports & metrics

## Brand Messaging Integration

### Key Terminology
- "Importer Price. Zero Hassle. DDP Delhi."
- "Factory se direct — Suprans ke through."
- "DDP pricing" (Delivered Duty Paid)
- "Factory-backed warranty"
- "Container consolidation"

### Tone
- Confident but non-pushy
- Transparency-first
- Bilingual (English + Hinglish)
- System-driven credibility

## TypeScript Type Updates

Updated type definitions in:
- `src/types/lead.ts`: Added `LeadScore`, `LeadType`, and fields
- `src/types/product.ts`: Added supplier/factory fields

## Next Steps

1. Update UI components to display OLLDeals-specific fields
2. Add lead scoring filters and views
3. Implement DDP pricing calculator
4. Create supplier/factory management interface
5. Build competitor analysis dashboard
6. Add after-sales ticket management
7. Implement reports & metrics dashboard
8. Update messaging templates with OLLDeals scripts


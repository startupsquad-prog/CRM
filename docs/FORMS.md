# Forms Documentation

This document outlines all the forms available in the CRM system, including their usage, features, and integration examples.

## Overview

All forms use **React Hook Form** with **Zod** validation for type-safe form handling. Forms are built using shadcn/ui components for consistent styling and UX.

## Form Components

### 1. Lead Forms

#### `LeadForm`
Comprehensive form for creating and editing leads.

**Location:** `src/components/forms/lead-form.tsx`

**Features:**
- Basic information (name, email, phone, WhatsApp)
- Lead source selection (multi-select)
- Stage management
- Product assignment
- Tag management
- Assignment to users/clients
- Notes and additional information

**Usage:**
```tsx
import { LeadForm } from "@/components/forms"

<LeadForm
  lead={existingLead} // Optional, for editing
  onSubmit={async (data) => {
    // Handle submission
  }}
  onCancel={() => setOpen(false)}
  products={products}
  users={users}
  clients={clients}
/>
```

#### `PublicLeadForm`
Public-facing lead generation form for websites.

**Location:** `src/components/forms/public-lead-form.tsx`

**Features:**
- Customer-friendly interface
- Product selection
- Quantity and inquiry details
- Company name optional
- Auto-set source as "website"

**Usage:**
```tsx
import { PublicLeadForm } from "@/components/forms"

<PublicLeadForm
  productId={selectedProductId} // Optional, pre-select a product
  products={products}
  onSubmit={async (data) => {
    // Create lead in database
  }}
/>
```

**Public Routes:**
- `/public/lead-form` - General lead generation form
- `/public/product/[id]` - Product-specific lead form

### 2. Product Forms

#### `ProductForm`
Multi-step form for creating and editing products.

**Location:** `src/components/forms/product-form.tsx`

**Features:**
- **Step 1: Basic Information**
  - SKU, name, category
  - Collection assignment
  - Minimum order quantity
- **Step 2: Pricing**
  - Market price
  - Cost prices (per unit, 20GP, 40HQ containers)
- **Step 3: Details**
  - Product summary
  - Market research notes
  - Alibaba and listing URLs

**Usage:**
```tsx
import { ProductForm } from "@/components/forms"

<ProductForm
  product={existingProduct} // Optional
  onSubmit={async (data) => {
    // Handle submission
  }}
  collections={collections}
/>
```

### 3. Quotation Forms

#### `QuotationForm`
Multi-step form for creating quotations/proposals.

**Location:** `src/components/forms/quotation-form.tsx`

**Features:**
- **Step 1: Lead & Company**
  - Lead selection
  - Company association
- **Step 2: Items**
  - Dynamic line items
  - Quantity, unit price, total calculation
  - Add/remove items
- **Step 3: Details & Terms**
  - Quote number (auto-generated if empty)
  - Currency selection
  - Status and validity date
  - Terms & conditions
  - Internal notes

**Usage:**
```tsx
import { QuotationForm } from "@/components/forms"

<QuotationForm
  quotation={existingQuotation} // Optional
  onSubmit={async (data) => {
    // Handle submission
  }}
  leads={leads}
  companies={companies}
/>
```

### 4. Company Forms

#### `CompanyForm`
Form for creating and editing company/client records.

**Location:** `src/components/forms/company-form.tsx`

**Features:**
- Basic information (name, industry, size, revenue)
- Contact information (email, phone, website)
- Complete address fields
- Company description

**Usage:**
```tsx
import { CompanyForm } from "@/components/forms"

<CompanyForm
  company={existingCompany} // Optional
  onSubmit={async (data) => {
    // Handle submission
  }}
/>
```

### 5. Call Forms

#### `CallForm`
Form for logging call activities.

**Location:** `src/components/forms/call-form.tsx`

**Features:**
- Lead association
- Call type (inbound/outbound)
- Scheduled and completed timestamps
- Duration tracking
- Outcome notes
- Detailed notes

**Usage:**
```tsx
import { CallForm } from "@/components/forms"

<CallForm
  call={existingCall} // Optional
  onSubmit={async (data) => {
    // Handle submission
  }}
  leads={leads}
/>
```

### 6. Message Template Forms

#### `MessageTemplateForm`
Form for creating reusable message templates.

**Location:** `src/components/forms/message-template-form.tsx`

**Features:**
- Template name and category
- Message type (email, SMS, WhatsApp, letter)
- Subject line (for emails)
- Body with placeholder support (`{{name}}`, `{{company}}`)
- Public/private toggle

**Usage:**
```tsx
import { MessageTemplateForm } from "@/components/forms"

<MessageTemplateForm
  template={existingTemplate} // Optional
  onSubmit={async (data) => {
    // Handle submission
  }}
/>
```

### 7. User Profile Forms

#### `UserProfileForm`
Form for editing user profiles.

**Location:** `src/components/forms/user-profile-form.tsx`

**Features:**
- Full name and email
- Phone number
- Avatar URL
- Department assignment
- Profile picture preview

**Usage:**
```tsx
import { UserProfileForm } from "@/components/forms"

<UserProfileForm
  user={currentUser}
  onSubmit={async (data) => {
    // Update user profile
  }}
  departments={departments}
/>
```

## Multi-Step Form Component

### `MultiStepForm`

Reusable component for building multi-step forms.

**Location:** `src/components/forms/multi-step-form.tsx`

**Features:**
- Progress bar
- Step indicators
- Navigation controls (Previous/Next)
- Customizable steps
- Validation support

**Usage:**
```tsx
import { MultiStepForm, type Step } from "@/components/forms"

const steps: Step[] = [
  {
    id: "step1",
    title: "Step 1",
    description: "First step description",
    component: <YourStep1Component />
  },
  // ... more steps
]

<MultiStepForm
  steps={steps}
  currentStep={currentStep}
  onStepChange={setCurrentStep}
  onSubmit={handleSubmit}
/>
```

## Integration Examples

### Using Forms in Dialogs

```tsx
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LeadForm } from "@/components/forms"

export function CreateLeadDialog() {
  const [open, setOpen] = useState(false)

  const handleSubmit = async (data: any) => {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) throw new Error("Failed to create lead")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Lead</DialogTitle>
        </DialogHeader>
        <LeadForm onSubmit={handleSubmit} onCancel={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
```

### API Route Handler Example

```typescript
// app/api/leads/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { auth } from "@clerk/nextjs/server"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("leads")
      .insert({
        ...body,
        created_by: userId,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ lead: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
```

## Form Validation

All forms use Zod schemas for validation:

- **Required fields** are marked with `*` in the UI
- **Email validation** ensures proper email format
- **URL validation** for website/URL fields
- **Number validation** for numeric inputs
- **Array validation** for multi-select fields

## Styling

Forms use:
- **shadcn/ui components** for consistent styling
- **Tailwind CSS** for layout and spacing
- **Responsive design** with mobile-friendly layouts
- **Dark mode support** via theme provider

## Best Practices

1. **Always handle errors**: Wrap form submissions in try-catch blocks
2. **Show loading states**: Disable buttons during submission
3. **Provide feedback**: Use toast notifications for success/error
4. **Validate on blur**: Forms validate as users interact
5. **Accessible**: All forms follow WCAG guidelines via shadcn/ui

## Public Forms Security

Public forms (like `PublicLeadForm`) should:
- Have rate limiting
- Validate all inputs server-side
- Sanitize user input
- Use CSRF protection for authenticated operations

## Future Enhancements

- File upload support for product images
- Rich text editor for message templates
- Auto-save drafts
- Form analytics and conversion tracking
- Conditional field display based on selections


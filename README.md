# CRM Application

A modern, feature-rich Customer Relationship Management (CRM) system built with Next.js 15, TypeScript, Tailwind CSS, and Supabase. The application includes role-based access control, comprehensive dashboard analytics, task management, team collaboration, and a complete brand system.

## 🌟 Features

### Authentication & Authorization
- **Clerk Authentication**: Secure user authentication with Clerk
- **Role-Based Access Control (RBAC)**: Admin and Employee roles
- **Automatic Role-Based Redirects**: Users are automatically redirected based on their role
- **Protected Routes**: Server-side role validation for security

### Admin Features
- **Admin Dashboard**: Comprehensive analytics with interactive charts
- **Team Management**: 
  - Employee management
  - Department organization
  - Roles & Permissions
- **Task Management**: View and manage team tasks
- **Analytics & Reports**: Sales, performance, and analytics reports
- **Company Management**: Manage company profiles and settings
- **Settings**: General, integrations, and security configurations

### Employee Features
- **Employee Dashboard**: Personalized dashboard view
- **Task Management**: View and manage personal tasks
- **Calendar**: Schedule and event management
- **Messages**: Internal messaging system
- **Settings**: Profile and preferences management

### UI/UX Features
- **Dark Mode**: Complete dark mode support with theme toggle
- **Responsive Design**: Mobile-first, fully responsive layout
- **Modern Sidebar**: Collapsible sidebar with role-based navigation
- **Brand System**: Comprehensive design system with custom tokens
- **Interactive Charts**: Beautiful data visualization with Recharts
- **Drag & Drop**: Task management with drag-and-drop functionality
- **Form Validation**: React Hook Form with Zod validation

### Brand & Design System
- **Design Tokens**: Centralized design system using CSS variables
- **OKLCH Color Space**: Modern color management
- **Custom Theming**: Brand colors, gradients, shadows, and spacing
- **Component Library**: Built with shadcn/ui components
- **Brand Kit**: Visual brand system documentation page

## 🛠️ Tech Stack

### Core
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **React 19**: Latest React features
- **Tailwind CSS 4**: Utility-first CSS framework

### Authentication & Database
- **Clerk**: Authentication and user management
- **Supabase**: Backend as a Service (BaaS) with PostgreSQL

### UI Components
- **shadcn/ui**: High-quality React components
- **Radix UI**: Accessible component primitives
- **Lucide Icons**: Beautiful icon library
- **Tabler Icons**: Additional icon set

### Data & Forms
- **React Hook Form**: Performant forms
- **Zod**: Schema validation
- **TanStack Table**: Powerful table component
- **Recharts**: Chart library

### Additional Libraries
- **dnd-kit**: Drag and drop functionality
- **Framer Motion**: Animation library
- **next-themes**: Dark mode theme management
- **Zustand**: State management
- **Sonner**: Toast notifications
- **Resend**: Email service
- **Vaul**: Drawer component

## 📁 Project Structure

```
crm-app/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (dashboard)/       # Dashboard routes
│   │   ├── (marketing)/        # Marketing/public routes
│   │   ├── admin/              # Admin-only routes
│   │   │   ├── dashboard/      # Admin dashboard
│   │   │   ├── tasks/          # Admin task management
│   │   │   └── team/           # Team management
│   │   ├── employee/           # Employee-only routes
│   │   │   ├── dashboard/      # Employee dashboard
│   │   │   ├── tasks/          # Employee tasks
│   │   │   └── calendar/       # Employee calendar
│   │   ├── auth/               # Authentication pages
│   │   ├── brand-kit/          # Brand system documentation
│   │   └── marketing/          # Marketing/landing page
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── app-sidebar.tsx     # Main sidebar component
│   │   ├── data-table.tsx      # Data table component
│   │   └── chart-area-interactive.tsx  # Interactive charts
│   ├── lib/                    # Utility libraries
│   │   ├── clerk-auth.ts       # Clerk authentication helpers
│   │   ├── supabase/           # Supabase client setup
│   │   └── utils.ts            # General utilities
│   ├── constants/              # Application constants
│   │   └── brand.ts            # Brand design tokens
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript type definitions
│   ├── providers/              # React context providers
│   │   └── theme-provider.tsx  # Theme provider
│   └── styles/                 # Global styles
│       ├── tokens.css          # Design tokens
│       └── globals.css         # Global styles
├── docs/                       # Documentation
│   ├── architecture.md         # Architecture overview
│   ├── brand-system.md         # Brand system documentation
│   └── clerk-roles-setup.md    # Clerk roles setup guide
└── public/                     # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Clerk account (for authentication)
- Supabase account (for database)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd crm-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
   CLERK_SECRET_KEY=your-clerk-secret-key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Set up Clerk roles**
   
   Follow the guide in `docs/clerk-roles-setup.md` to configure admin and employee roles.

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 Design System

The application uses a comprehensive design system with:

- **Design Tokens**: Defined in `src/styles/tokens.css`
- **Brand Constants**: JavaScript/TypeScript access via `src/constants/brand.ts`
- **OKLCH Colors**: Modern color space for consistent theming
- **Dark Mode**: Automatic theme switching with `next-themes`

### Using Design Tokens

```tsx
// CSS
<div className="bg-[oklch(var(--bg))] text-[oklch(var(--fg))]" />

// TypeScript/JavaScript
import { colors, spacing, shadows } from '@/constants/brand'
```

## 🔐 Authentication & Roles

### Setting Up Roles

1. **Admin Role**: Set `role: "admin"` in Clerk user's public metadata
2. **Employee Role**: Default role, or set `role: "employee"` explicitly

See `docs/clerk-roles-setup.md` for detailed instructions.

### Protected Routes

- `/admin/*` - Admin-only routes (automatically protected)
- `/employee/*` - Employee-only routes (automatically protected)
- Role-based redirects on login ensure users go to the correct dashboard

## 🏗️ Architecture

### Key Conventions

- **Dark Mode**: Applied via `class` on `<html>` element
- **Design Tokens**: Always use global tokens from `tokens.css`
- **Import Order**: react/external → internal (`@/**`) → relative
- **Feature Documentation**: Each feature folder should include a README

### File Organization

- Components are organized by feature/module
- Shared UI components in `src/components/ui`
- Business logic in `src/lib`
- Types centralized in `src/types`
- Constants in `src/constants`

## 📚 Documentation

Additional documentation is available in the `docs/` folder:

- `architecture.md` - Architecture overview and conventions
- `brand-system.md` - Brand system and design tokens
- `clerk-roles-setup.md` - Detailed Clerk roles setup guide

## 🔄 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

The application is optimized for Vercel deployment with Next.js.

## 🛣️ Roadmap

- [ ] Advanced analytics and reporting
- [ ] Real-time notifications
- [ ] Advanced task workflows
- [ ] Email integrations
- [ ] Document management
- [ ] API integrations
- [ ] Mobile app

## 📄 License

Private project - All rights reserved

## 👥 Contributing

This is a private project. For questions or contributions, please contact the project maintainer.

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.

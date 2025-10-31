import { SignInButton, SignUpButton, SignedIn } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QuickLoginWidget } from "@/components/quick-login-widget"
import {
  BarChart3,
  Users,
  MessageSquare,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react"

export default function MarketingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Your All-In-One
            <span className="text-primary"> CRM Solution</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Manage leads, track sales, and grow your business with our powerful customer relationship management platform.
          </p>
          <div className="flex items-center justify-center gap-4 pt-6">
            <SignInButton mode="modal">
              <Button size="lg" className="text-base px-8">
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="lg" variant="outline" className="text-base px-8">
                Sign Up
              </Button>
            </SignUpButton>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Grow
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed to help you manage relationships and close more deals.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Lead Management</CardTitle>
                <CardDescription>
                  Track and manage your leads through the entire sales pipeline with intelligent categorization.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Team Collaboration</CardTitle>
                <CardDescription>
                  Work together seamlessly with shared contacts, tasks, and real-time updates.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Analytics & Reports</CardTitle>
                <CardDescription>
                  Get insights into your sales performance with comprehensive analytics and reporting.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <MessageSquare className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Communication Hub</CardTitle>
                <CardDescription>
                  Centralize all your customer communications with calls, messages, and email tracking.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Create quotes, send templates, and manage tasks with lightning-fast workflows.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Secure & Reliable</CardTitle>
                <CardDescription>
                  Enterprise-grade security with role-based access control for your team.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-2">Ready to Get Started?</CardTitle>
              <CardDescription className="text-lg">
                Join thousands of teams already using our CRM to grow their business.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center gap-4 pt-6">
              <SignUpButton mode="modal">
                <Button size="lg" className="text-base px-8">
                  Start Free Trial
                </Button>
              </SignUpButton>
              <SignInButton mode="modal">
                <Button size="lg" variant="outline" className="text-base px-8">
                  Sign In
                </Button>
              </SignInButton>
            </CardContent>
          </Card>

          {/* Quick Login Widget - Only shown when signed in */}
          <SignedIn>
            <QuickLoginWidget />
          </SignedIn>
        </div>
      </section>
    </main>
  )
}

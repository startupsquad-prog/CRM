"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Crown, Briefcase } from "lucide-react";
import { toast } from "sonner";

interface Role {
  name: string;
  display_name: string;
  description: string;
  level: number;
}

export function QuickLoginWidget() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);

  useEffect(() => {
    // Fetch available roles
    fetch("/api/public-roles")
      .then((res) => res.json())
      .then((data) => {
        if (data.roles) {
          setRoles(data.roles);
        }
      })
      .catch((err) => {
        console.error("Error fetching roles:", err);
      });
  }, []);

  const handleQuickLogin = async (role: string) => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }

    setSwitching(role);
    setLoading(true);

    try {
      const response = await fetch("/api/quick-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to switch role");
      }

      toast.success(`Switched to ${role} role`);
      
      // Redirect based on role
      setTimeout(() => {
        router.push(role === "admin" ? "/admin/dashboard" : "/employee/dashboard");
      }, 500);
    } catch (error: any) {
      console.error("Error switching role:", error);
      toast.error(error.message || "Failed to switch role");
    } finally {
      setLoading(false);
      setSwitching(null);
    }
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case "admin":
        return <Crown className="h-5 w-5" />;
      case "employee":
        return <Briefcase className="h-5 w-5" />;
      default:
        return <Sparkles className="h-5 w-5" />;
    }
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case "admin":
        return "bg-purple-500/10 text-purple-700 border-purple-200 dark:text-purple-300 dark:bg-purple-500/20 dark:border-purple-800";
      case "employee":
        return "bg-blue-500/10 text-blue-700 border-blue-200 dark:text-blue-300 dark:bg-blue-500/20 dark:border-blue-800";
      default:
        return "bg-primary/10";
    }
  };

  if (!isLoaded || !user) {
    return null;
  }

  return (
    <Card className="border-dashed border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">Quick Login</CardTitle>
          <Badge variant="outline" className="ml-auto">
            Development Tool
          </Badge>
        </div>
        <CardDescription>
          Switch between user roles instantly. Currently signed in as{" "}
          <span className="font-semibold text-foreground">
            {user.firstName || user.emailAddresses[0]?.emailAddress}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {roles.map((role) => (
            <Button
              key={role.name}
              variant="outline"
              className={`w-full justify-start gap-3 h-auto py-3 px-4 ${getRoleColor(role.name)} hover:scale-[1.02] transition-transform`}
              onClick={() => handleQuickLogin(role.name)}
              disabled={loading}
            >
              {switching === role.name ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                getRoleIcon(role.name)
              )}
              <div className="flex-1 text-left">
                <div className="font-semibold">{role.display_name}</div>
                <div className="text-xs opacity-70">{role.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


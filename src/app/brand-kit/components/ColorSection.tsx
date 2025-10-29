"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Palette } from "lucide-react";

interface ColorToken {
  name: string;
  variable: string;
  label: string;
}

const colorTokens: ColorToken[] = [
  // From tokens.css
  { name: "Brand 50", variable: "--brand-50", label: "Brand 50" },
  { name: "Brand 500", variable: "--brand-500", label: "Brand 500" },
  { name: "Brand 950", variable: "--brand-950", label: "Brand 950" },
  { name: "Bg", variable: "--bg", label: "Bg (tokens.css)" },
  { name: "Fg", variable: "--fg", label: "Fg (tokens.css)" },
  // From globals.css (ShadCN semantic)
  { name: "Primary", variable: "--primary", label: "Primary" },
  { name: "Secondary", variable: "--secondary", label: "Secondary" },
  { name: "Accent", variable: "--accent", label: "Accent" },
  { name: "Muted", variable: "--muted", label: "Muted" },
  { name: "Border", variable: "--border", label: "Border" },
  { name: "Background", variable: "--background", label: "Background" },
  { name: "Sidebar", variable: "--sidebar", label: "Sidebar" },
];

export function ColorSection() {
  const [colorValues, setColorValues] = React.useState<Record<string, string>>({});
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const getColorValue = (variable: string): string => {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(variable)
        .trim();
      
      if (!value) return `var(${variable})`;
      
      // If it's already a complete oklch() value, return as is
      if (value.startsWith("oklch(")) {
        return value;
      }
      
      // If it's just the OKLCH values (like from tokens.css), wrap them
      return `oklch(${value})`;
    };

    const values: Record<string, string> = {};
    colorTokens.forEach((token) => {
      values[token.variable] = getColorValue(token.variable);
    });
    setColorValues(values);
  }, []);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          <h2 className="text-2xl font-semibold">Colors</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {colorTokens.map((token) => {
            const value = mounted && colorValues[token.variable] ? colorValues[token.variable] : `var(${token.variable})`;
            // Use the formatted value for background, or fallback to CSS variable
            const bgColor = mounted && value.startsWith("oklch(") ? value : `oklch(var(${token.variable}))`;
            return (
              <Tooltip key={token.variable}>
                <TooltipTrigger asChild>
                  <Card className="cursor-pointer transition-all hover:shadow-md">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">{token.label}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div
                        className="h-16 w-full rounded-lg shadow-sm border border-border"
                        style={{ backgroundColor: bgColor }}
                      />
                      <div className="space-y-1">
                        <p className="text-xs font-mono text-muted-foreground">
                          {token.variable}
                        </p>
                        <p className="text-xs text-muted-foreground break-all">
                          {value}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-mono text-xs">
                    {token.variable}: {value}
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}


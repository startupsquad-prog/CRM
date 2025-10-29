"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Square } from "lucide-react";

interface RadiusToken {
  name: string;
  variable: string;
  label: string;
}

const radiusTokens: RadiusToken[] = [
  // From tokens.css
  { name: "Small", variable: "--radius-sm", label: "Radius Small" },
  { name: "Medium", variable: "--radius-md", label: "Radius Medium" },
  { name: "Large", variable: "--radius-lg", label: "Radius Large" },
  // From globals.css
  { name: "Base", variable: "--radius", label: "Radius Base" },
  { name: "Extra Large", variable: "--radius-xl", label: "Radius XL" },
];

export function RadiusSection() {
  const [radiusValues, setRadiusValues] = React.useState<Record<string, string>>({});
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const getRadiusValue = (variable: string): string => {
      return (
        getComputedStyle(document.documentElement)
          .getPropertyValue(variable)
          .trim() || `var(${variable})`
      );
    };

    const values: Record<string, string> = {};
    radiusTokens.forEach((token) => {
      values[token.variable] = getRadiusValue(token.variable);
    });
    setRadiusValues(values);
  }, []);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Square className="h-5 w-5" />
          <h2 className="text-2xl font-semibold">Border Radius</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {radiusTokens.map((token) => {
            const value = mounted && radiusValues[token.variable] ? radiusValues[token.variable] : `var(${token.variable})`;
            return (
              <Tooltip key={token.variable}>
                <TooltipTrigger asChild>
                  <Card className="cursor-pointer transition-all hover:shadow-md">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">{token.label}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div
                        className="w-24 h-24 bg-primary border border-border mx-auto"
                        style={{
                          borderRadius: value.includes("px") || value.includes("rem") || value.includes("calc") 
                            ? value 
                            : `var(${token.variable})`,
                        }}
                      />
                      <div className="pt-2 border-t border-border">
                        <p className="text-xs font-mono text-muted-foreground">
                          {token.variable}
                        </p>
                        <p className="text-xs text-muted-foreground break-all mt-1">
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


"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LayoutGrid } from "lucide-react";

interface SpacingToken {
  name: string;
  variable: string;
  label: string;
}

const spacingTokens: SpacingToken[] = [
  { name: "Space 1", variable: "--space-1", label: "Spacing 1" },
  { name: "Space 2", variable: "--space-2", label: "Spacing 2" },
  { name: "Space 3", variable: "--space-3", label: "Spacing 3" },
  { name: "Space 4", variable: "--space-4", label: "Spacing 4" },
];

export function SpacingSection() {
  const [spacingValues, setSpacingValues] = React.useState<Record<string, string>>({});
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const getSpacingValue = (variable: string): string => {
      return (
        getComputedStyle(document.documentElement)
          .getPropertyValue(variable)
          .trim() || `var(${variable})`
      );
    };

    const values: Record<string, string> = {};
    spacingTokens.forEach((token) => {
      values[token.variable] = getSpacingValue(token.variable);
    });
    setSpacingValues(values);
  }, []);

  const convertToPx = (value: string): string => {
    if (value.includes("rem")) {
      const remValue = parseFloat(value);
      return `${remValue * 16}px`;
    }
    return value;
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5" />
          <h2 className="text-2xl font-semibold">Spacing</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {spacingTokens.map((token) => {
            const value = mounted && spacingValues[token.variable] ? spacingValues[token.variable] : `var(${token.variable})`;
            const pxValue = mounted ? convertToPx(value) : value;
            return (
              <Tooltip key={token.variable}>
                <TooltipTrigger asChild>
                  <Card className="cursor-pointer transition-all hover:shadow-md">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">{token.label}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="w-full h-12 bg-muted rounded-md flex items-center justify-start">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: value.includes("rem") || value.includes("px") || value.includes("calc")
                              ? value
                              : `var(${token.variable})`,
                            minWidth: "4px",
                          }}
                        />
                      </div>
                      <div className="pt-2 border-t border-border">
                        <p className="text-xs font-mono text-muted-foreground">
                          {token.variable}
                        </p>
                        <p className="text-xs text-muted-foreground break-all mt-1">
                          {value} ({pxValue})
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-mono text-xs">
                    {token.variable}: {value} ({pxValue})
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


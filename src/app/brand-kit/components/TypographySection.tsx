"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Type } from "lucide-react";

interface FontToken {
  name: string;
  variable: string;
  label: string;
}

const fontTokens: FontToken[] = [
  { name: "Sans", variable: "--font-sans", label: "Font Sans" },
  { name: "Geist Sans", variable: "--font-geist-sans", label: "Geist Sans" },
  { name: "Mono", variable: "--font-mono", label: "Font Mono" },
  { name: "Geist Mono", variable: "--font-geist-mono", label: "Geist Mono" },
  { name: "Display", variable: "--font-display", label: "Font Display" },
];

export function TypographySection() {
  const [fontValues, setFontValues] = React.useState<Record<string, string>>({});
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const getFontValue = (variable: string): string => {
      return (
        getComputedStyle(document.documentElement)
          .getPropertyValue(variable)
          .trim() || `var(${variable})`
      );
    };

    const values: Record<string, string> = {};
    fontTokens.forEach((token) => {
      values[token.variable] = getFontValue(token.variable);
    });
    setFontValues(values);
  }, []);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Type className="h-5 w-5" />
          <h2 className="text-2xl font-semibold">Typography</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fontTokens.map((token) => {
            const value = mounted && fontValues[token.variable] ? fontValues[token.variable] : `var(${token.variable})`;
            return (
              <Tooltip key={token.variable}>
                <TooltipTrigger asChild>
                  <Card className="cursor-pointer transition-all hover:shadow-md">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">{token.label}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div style={{ fontFamily: `var(${token.variable})` }}>
                        <h3 className="text-lg font-semibold mb-2">
                          The quick brown fox jumps over the lazy dog
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                          eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        </p>
                      </div>
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


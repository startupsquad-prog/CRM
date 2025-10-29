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
import { motion } from "framer-motion";

interface ShadowToken {
  name: string;
  variable: string;
  label: string;
  className?: string;
}

const shadowTokens: ShadowToken[] = [
  { name: "Small", variable: "--shadow-sm", label: "Shadow Small", className: "shadow-sm" },
  { name: "Medium", variable: "--shadow-md", label: "Shadow Medium", className: "shadow-md" },
  { name: "Large", variable: "--shadow-lg", label: "Shadow Large", className: "shadow-lg" },
];

export function ShadowSection() {
  const [shadowValues, setShadowValues] = React.useState<Record<string, string>>({});
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const getShadowValue = (variable: string): string => {
      return (
        getComputedStyle(document.documentElement)
          .getPropertyValue(variable)
          .trim() || `var(${variable})`
      );
    };

    const values: Record<string, string> = {};
    shadowTokens.forEach((token) => {
      values[token.variable] = getShadowValue(token.variable);
    });
    setShadowValues(values);
  }, []);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Square className="h-5 w-5" />
          <h2 className="text-2xl font-semibold">Shadows</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shadowTokens.map((token) => {
            const value = mounted && shadowValues[token.variable] ? shadowValues[token.variable] : `var(${token.variable})`;
            return (
              <Tooltip key={token.variable}>
                <TooltipTrigger asChild>
                  <Card className="cursor-pointer transition-all hover:shadow-md">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">{token.label}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <motion.div
                        whileHover={{ scale: 1.05, opacity: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="w-full h-24 rounded-lg bg-card border border-border flex items-center justify-center"
                        style={
                          mounted && value !== `var(${token.variable})`
                            ? { boxShadow: value }
                            : undefined
                        }
                      >
                        <div className="text-xs text-muted-foreground font-mono">
                          Preview
                        </div>
                      </motion.div>
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


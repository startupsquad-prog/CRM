"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ColorSection } from "./components/ColorSection";
import { TypographySection } from "./components/TypographySection";
import { ShadowSection } from "./components/ShadowSection";
import { RadiusSection } from "./components/RadiusSection";
import { SpacingSection } from "./components/SpacingSection";

export default function BrandKitPage() {
  return (
    <main className="container mx-auto max-w-6xl px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">🎨 Brand Kit</h1>
        <ThemeToggle />
      </div>

      <Separator className="mb-6" />

      {/* Tabs */}
      <Tabs defaultValue="colors" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="shadows">Shadows</TabsTrigger>
          <TabsTrigger value="radius">Radius</TabsTrigger>
          <TabsTrigger value="spacing">Spacing</TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="mt-6">
          <ColorSection />
        </TabsContent>

        <TabsContent value="typography" className="mt-6">
          <TypographySection />
        </TabsContent>

        <TabsContent value="shadows" className="mt-6">
          <ShadowSection />
        </TabsContent>

        <TabsContent value="radius" className="mt-6">
          <RadiusSection />
        </TabsContent>

        <TabsContent value="spacing" className="mt-6">
          <SpacingSection />
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <Separator className="mt-12 mb-6" />
      <footer className="text-center text-sm text-muted-foreground pb-8">
        Brand system powered by global tokens. Updated automatically as tokens.css evolves.
      </footer>
    </main>
  );
}


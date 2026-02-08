import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "gap-2 group/tabs flex data-horizontal:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
    "inline-flex min-h-11 items-center gap-1 rounded-xl bg-secondary/10 px-2 py-1 text-muted-foreground border border-primary/20 dark:border-primary/30 backdrop-blur-sm animate-in fade-in-0 duration-300 transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-lg px-4 py-1.5 text-xs md:text-sm font-light md:font-medium",
      "ring-offset-background transition-all duration-300 ease-in-out",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      "hover:bg-slate-500/30 hover:scale-[1]",
      "data-[state=active]:bg-slate-700 data-[state=active]:text-primary-foreground",
      "data-[state=active]:scale-[0.95] data-[state=active]:font-medium",
      "data-[state=active]:before:absolute data-[state=active]:before:inset-0",
      "data-[state=active]:before:rounded-lg data-[state=active]:before:bg-linear-to-br",
      "data-[state=active]:before:from-primary/20 data-[state=active]:before:to-primary/0",
      "data-[state=active]:before:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn( "mt-3 ring-offset-background",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "animate-in fade-in-0 slide-in-from-bottom-2 zoom-in-95 duration-300",
      "transition-all duration-300", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }

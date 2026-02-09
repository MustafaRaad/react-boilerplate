import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { ScrollArea } from "./scroll-area"
import { useDirection } from "@/shared/hooks/useDirection"
import { RiCloseLine } from "@remixicon/react"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/40 backdrop-blur-sm",
        className
      )}
      {...props}
    />
  )
}

type DialogContentProps = React.ComponentProps<
  typeof DialogPrimitive.Content
> & {
  showCloseButton?: boolean
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  onInteractOutside,
  ...props
}: DialogContentProps) {
  const { dir } = useDirection()

  const handleInteractOutside = React.useCallback(
    (
      event: Parameters<NonNullable<DialogContentProps["onInteractOutside"]>>[0]
    ) => {
      // Prevent closing dialog on outside click
      event.preventDefault()
      onInteractOutside?.(event)
    },
    [onInteractOutside]
  )

  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        onInteractOutside={handleInteractOutside}
        onEscapeKeyDown={(event) => {
          // Prevent closing dialog on Escape key
          event.preventDefault()
        }}
        className={cn(
          "bg-card/95 backdrop-blur-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] max-h-[calc(100dvh-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-3xl border border-border/50 shadow-2xl duration-300 ease-out overflow-hidden sm:max-w-lg",
          className
        )}
        {...props}
      >
        <ScrollArea
          className="max-h-[calc(100dvh-2rem)] overflow-hidden"
          dir={dir}
        >
          <div className="p-8">{children}</div>
        </ScrollArea>
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="ring-offset-background absolute top-5 ltr:right-5 rtl:left-5 z-10 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 p-1.5 opacity-70 transition-all duration-200 hover:opacity-100 hover:bg-background/90 hover:scale-110 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <RiCloseLine className="rtl:-scale-x-100" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "relative flex flex-col gap-2 mb-4 pb-2 -mx-8 -mt-8 px-6 pt-6 bg-linear-to-br from-primary/10 via-primary/5 to-transparent border-b text-center sm:ltr:text-left sm:rtl:text-right",
        className
      )}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-3 sm:flex-row sm:justify-end",
        "mt-6 pt-4 -mb-8 -mx-8 px-6 pb-6",
        // Enhanced button styling context
        "[&_button]:min-w-[100px]",
        "[&_button]:h-10",
        "[&_button]:transition-all",
        "[&_button]:duration-200",
        "[&_button[type='submit']]:flex-1",
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "text-2xl leading-tight font-semibold tracking-tight mb-2",
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm leading-relaxed", className)}
      {...props}
    />
  )
}

function DialogBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-body"
      className={cn("min-h-0", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}

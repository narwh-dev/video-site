import type React from "react"
import { cn } from "@/lib/utils"

export function Empty({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center text-balance",
        className,
      )}
      data-slot="empty"
      {...props}
    />
  )
}

export function EmptyHeader({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      className={cn("flex max-w-sm flex-col items-center gap-2 text-center", className)}
      data-slot="empty-header"
      {...props}
    />
  )
}

export function EmptyMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & {
  variant?: "default" | "icon"
}): React.ReactElement {
  return (
    <div
      className={cn(
        "mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
        variant === "icon" &&
          "size-10 rounded-[10px] border border-border bg-card text-muted-foreground [&_svg:not([class*='size-'])]:size-5",
        className,
      )}
      data-slot="empty-media"
      data-variant={variant}
      {...props}
    />
  )
}

export function EmptyTitle({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      className={cn("font-semibold text-base", className)}
      data-slot="empty-title"
      {...props}
    />
  )
}

export function EmptyDescription({
  className,
  ...props
}: React.ComponentProps<"p">): React.ReactElement {
  return (
    <div
      className={cn("text-muted-foreground text-sm", className)}
      data-slot="empty-description"
      {...props}
    />
  )
}

export function EmptyContent({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      className={cn(
        "flex w-full min-w-0 max-w-sm flex-col items-center gap-3 text-sm",
        className,
      )}
      data-slot="empty-content"
      {...props}
    />
  )
}

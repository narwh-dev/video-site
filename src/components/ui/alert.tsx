import type * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "@/components/ui/cva"

const alertVariants = cva(
  "relative grid w-full items-start gap-x-2 gap-y-0.5 rounded-[14px] border px-3.5 py-3 text-sm has-[>svg]:grid-cols-[1rem_1fr] has-[>svg]:gap-x-2 [&>svg]:size-4 [&>svg]:translate-y-0.5",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "border-border bg-card text-card-foreground [&>svg]:text-foreground",
        info: "border-border bg-muted/40 text-foreground [&>svg]:text-primary",
        success:
          "border-success/30 bg-success/10 text-success-foreground [&>svg]:text-success",
        warning:
          "border-warning/30 bg-warning/10 text-warning-foreground [&>svg]:text-warning",
        destructive:
          "border-destructive/30 bg-destructive/10 text-destructive-foreground [&>svg]:text-destructive",
        error:
          "border-destructive/30 bg-destructive/10 text-destructive-foreground [&>svg]:text-destructive",
      },
    },
  },
)

export function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof alertVariants>): React.ReactElement {
  return (
    <div
      className={cn(alertVariants({ variant }), className)}
      data-slot="alert"
      role="alert"
      {...props}
    />
  )
}

export function AlertTitle({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      className={cn("font-medium [svg~&]:col-start-2", className)}
      data-slot="alert-title"
      {...props}
    />
  )
}

export function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 text-muted-foreground text-[13px] [svg~&]:col-start-2",
        className,
      )}
      data-slot="alert-description"
      {...props}
    />
  )
}

export function AlertAction({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      className={cn(
        "flex gap-1 max-sm:col-start-2 max-sm:mt-2 sm:row-span-2 sm:self-center",
        className,
      )}
      data-slot="alert-action"
      {...props}
    />
  )
}

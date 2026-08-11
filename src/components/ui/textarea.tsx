import type * as React from "react"
import { cn } from "@/lib/utils"

export type TextareaProps = React.ComponentProps<"textarea"> & {
  size?: "sm" | "default" | "lg"
  unstyled?: boolean
}

export function Textarea({
  className,
  size = "default",
  unstyled = false,
  ...props
}: TextareaProps): React.ReactElement {
  if (unstyled) {
    return (
      <textarea
        className={cn(
          "field-sizing-content min-h-20 w-full bg-transparent px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          size === "sm" && "min-h-16 px-2.5 py-1.5 text-[13px]",
          size === "lg" && "min-h-24 py-2.5",
          className,
        )}
        data-slot="textarea"
        {...props}
      />
    )
  }

  return (
    <textarea
      className={cn(
        "field-sizing-content min-h-20 w-full rounded-[10px] border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors duration-[120ms] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
        size === "sm" && "min-h-16 rounded-md px-2.5 py-1.5 text-[13px]",
        size === "lg" && "min-h-24 py-2.5",
        className,
      )}
      data-slot="textarea"
      {...props}
    />
  )
}

import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import type * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "@/components/ui/cva"
import { Spinner } from "@/components/ui/spinner"

export const buttonVariants = cva(
  "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap border font-medium outline-none transition-colors duration-[120ms] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-loading:select-none data-loading:text-transparent [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-10 rounded-[10px] px-4 text-sm",
        sm: "h-8 gap-1.5 rounded-md px-3 text-[13px]",
        lg: "h-11 rounded-[10px] px-5 text-sm",
        xs: "h-7 gap-1 rounded-[6px] px-2.5 text-xs",
        icon: "size-10 rounded-[10px]",
        "icon-sm": "size-8 rounded-md",
        "icon-xs": "size-7 rounded-[6px] [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-11 rounded-[10px]",
        "icon-xl": "size-12 rounded-[10px] [&_svg:not([class*='size-'])]:size-5",
        xl: "h-12 rounded-[10px] px-6 text-base",
      },
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/90 data-pressed:bg-primary/90 *:data-[slot=button-loading-indicator]:text-primary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/90 data-pressed:bg-secondary/90 *:data-[slot=button-loading-indicator]:text-secondary-foreground",
        outline:
          "border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground data-pressed:bg-accent *:data-[slot=button-loading-indicator]:text-foreground",
        ghost:
          "border-transparent text-foreground hover:bg-accent hover:text-accent-foreground data-pressed:bg-accent *:data-[slot=button-loading-indicator]:text-foreground",
        destructive:
          "border-transparent bg-destructive text-primary-foreground hover:bg-destructive/90 data-pressed:bg-destructive/90 *:data-[slot=button-loading-indicator]:text-primary-foreground",
        "destructive-outline":
          "border border-destructive/40 bg-transparent text-destructive-foreground hover:bg-destructive/10 data-pressed:bg-destructive/10 *:data-[slot=button-loading-indicator]:text-destructive-foreground",
        link: "border-transparent text-primary underline-offset-4 hover:underline data-pressed:underline *:data-[slot=button-loading-indicator]:text-primary",
      },
    },
  },
)

export interface ButtonProps extends useRender.ComponentProps<"button"> {
  variant?: VariantProps<typeof buttonVariants>["variant"]
  size?: VariantProps<typeof buttonVariants>["size"]
  loading?: boolean
}

export function Button({
  className,
  variant,
  size,
  render,
  children,
  loading = false,
  disabled: disabledProp,
  ...props
}: ButtonProps): React.ReactElement {
  const isDisabled = Boolean(loading || disabledProp)
  const typeValue: React.ButtonHTMLAttributes<HTMLButtonElement>["type"] =
    render ? undefined : "button"

  const defaultProps = {
    children: (
      <>
        {children}
        {loading ? (
          <Spinner
            className="pointer-events-none absolute"
            data-slot="button-loading-indicator"
          />
        ) : null}
      </>
    ),
    className: cn(buttonVariants({ className, size, variant })),
    "aria-disabled": loading || undefined,
    "data-loading": loading ? "" : undefined,
    "data-slot": "button",
    disabled: isDisabled,
    type: typeValue,
  }

  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(defaultProps, props),
    render,
  })
}

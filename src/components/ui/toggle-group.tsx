import type { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group"
import * as React from "react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import {
  Toggle as ToggleComponent,
  toggleVariants,
} from "@/components/ui/toggle"
import type { VariantProps } from "@/components/ui/cva"

type ToggleVariantProps = VariantProps<typeof toggleVariants>

export const ToggleGroupContext: React.Context<ToggleVariantProps> =
  React.createContext<ToggleVariantProps>({
    size: "default",
    variant: "default",
  })

export function ToggleGroup({
  className,
  variant = "default",
  size = "default",
  orientation = "horizontal",
  children,
  ...props
}: ToggleGroupPrimitive.Props & ToggleVariantProps): React.ReactElement {
  return (
    <ToggleGroupPrimitive
      className={cn(
        "flex w-fit items-center rounded-[10px]",
        variant === "default" ? "gap-0.5" : "overflow-hidden border border-border",
        orientation === "vertical" && "flex-col",
        className,
      )}
      data-size={size}
      data-slot="toggle-group"
      data-variant={variant}
      orientation={orientation}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ size, variant }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  )
}

export function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: TogglePrimitive.Props & ToggleVariantProps): React.ReactElement {
  const context = React.useContext(ToggleGroupContext)
  const resolvedVariant = context.variant || variant
  const resolvedSize = context.size || size

  return (
    <ToggleComponent
      className={cn(
        resolvedVariant === "outline" && "rounded-none border-0",
        className,
      )}
      data-size={resolvedSize}
      data-variant={resolvedVariant}
      size={resolvedSize}
      variant={resolvedVariant}
      {...props}
    >
      {children}
    </ToggleComponent>
  )
}

export function ToggleGroupSeparator({
  className,
  orientation = "vertical",
  ...props
}: {
  className?: string
} & React.ComponentProps<typeof Separator>): React.ReactElement {
  return (
    <Separator
      className={cn("bg-border", className)}
      orientation={orientation}
      {...props}
    />
  )
}

export { ToggleGroupPrimitive }

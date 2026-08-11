import { OTPField as OTPFieldPrimitive } from "@base-ui/react/otp-field"
import type * as React from "react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

export type OTPFieldProps = React.ComponentProps<
  typeof OTPFieldPrimitive.Root
> & {
  size?: "default" | "lg"
  onComplete?: (value: string) => void
}

export function OTPField({
  className,
  size = "default",
  length = 6,
  onComplete,
  onValueComplete,
  validationType = "numeric",
  ...props
}: OTPFieldProps): React.ReactElement {
  return (
    <OTPFieldPrimitive.Root
      className={cn(
        "flex items-center gap-2 has-disabled:opacity-50",
        className,
      )}
      data-size={size}
      data-slot="otp-field"
      length={length}
      onValueComplete={(value, eventDetails) => {
        onValueComplete?.(value, eventDetails)
        onComplete?.(value)
      }}
      validationType={validationType}
      {...props}
    />
  )
}

export function OTPFieldInput({
  className,
  ...props
}: React.ComponentProps<typeof OTPFieldPrimitive.Input>): React.ReactElement {
  return (
    <OTPFieldPrimitive.Input
      className={cn(
        "relative size-11 min-w-0 rounded-md border border-input bg-background text-center font-mono text-sm text-foreground outline-none transition-colors duration-[120ms] focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-invalid:border-destructive data-filled:border-primary disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      data-slot="otp-field-input"
      spellCheck={false}
      {...props}
    />
  )
}

export function OTPFieldSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>): React.ReactElement {
  return (
    <OTPFieldPrimitive.Separator
      render={
        <Separator
          className={cn(
            "rounded-full bg-input data-[orientation=horizontal]:h-0.5 data-[orientation=horizontal]:w-3",
            className,
          )}
          orientation="horizontal"
          {...props}
        />
      }
    />
  )
}

export { OTPFieldPrimitive }

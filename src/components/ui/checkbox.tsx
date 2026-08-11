import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import type React from "react"
import { cn } from "@/lib/utils"

export function Checkbox({
  className,
  ...props
}: CheckboxPrimitive.Root.Props): React.ReactElement {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "relative inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input bg-background outline-none transition-colors duration-[120ms] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-invalid:border-destructive data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      data-slot="checkbox"
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className="flex items-center justify-center text-current data-unchecked:hidden"
        data-slot="checkbox-indicator"
        render={(
          indicatorProps: React.ComponentProps<"span">,
          state: CheckboxPrimitive.Indicator.State,
        ) => (
          <span {...indicatorProps}>
            {state.indeterminate ? (
              <svg
                aria-hidden="true"
                className="size-3"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <path d="M5 12h14" />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                className="size-3"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <path d="M5 12.7 10.2 18.63 18.748 5.37" />
              </svg>
            )}
          </span>
        )}
      />
    </CheckboxPrimitive.Root>
  )
}

export { CheckboxPrimitive }

import { Input as InputPrimitive } from "@base-ui/react/input"
import type * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = Omit<
  InputPrimitive.Props & React.RefAttributes<HTMLInputElement>,
  "size"
> & {
  size?: "sm" | "default" | "lg" | number
  unstyled?: boolean
  nativeInput?: boolean
}

export function Input({
  className,
  size = "default",
  unstyled = false,
  nativeInput = false,
  style,
  ...props
}: InputProps): React.ReactElement {
  const inputClassName = cn(
    "h-full w-full min-w-0 rounded-[inherit] bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
    size === "sm" && "px-2.5 text-[13px]",
    size === "lg" && "px-3.5",
    props.type === "search" &&
      "[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none",
    props.type === "file" &&
      "text-muted-foreground file:me-3 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm",
  )

  return (
    <span
      className={
        cn(
          !unstyled &&
            "relative inline-flex h-10 w-full rounded-[10px] border border-input bg-background text-sm transition-colors duration-[120ms] focus-within:border-ring focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background has-disabled:pointer-events-none has-disabled:opacity-50 has-[[aria-invalid]]:border-destructive has-[[aria-invalid]]:focus-within:ring-destructive/30",
          size === "sm" && !unstyled && "h-8 rounded-md",
          size === "lg" && !unstyled && "h-11",
          className,
        ) || undefined
      }
      data-size={typeof size === "string" ? size : undefined}
      data-slot="input-control"
    >
      {nativeInput ? (
        <input
          className={inputClassName}
          data-slot="input"
          size={typeof size === "number" ? size : undefined}
          style={typeof style === "function" ? undefined : style}
          {...props}
        />
      ) : (
        <InputPrimitive
          className={inputClassName}
          data-slot="input"
          size={typeof size === "number" ? size : undefined}
          style={style}
          {...props}
        />
      )}
    </span>
  )
}

export { InputPrimitive }

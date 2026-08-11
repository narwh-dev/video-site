import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import * as React from "react"
import { cn } from "@/lib/utils"

export function Slider({
  className,
  children,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: SliderPrimitive.Root.Props): React.ReactElement {
  const values = React.useMemo(() => {
    if (value !== undefined) {
      return Array.isArray(value) ? value : [value]
    }
    if (defaultValue !== undefined) {
      return Array.isArray(defaultValue) ? defaultValue : [defaultValue]
    }
    return [min]
  }, [value, defaultValue, min])

  return (
    <SliderPrimitive.Root
      className={cn("data-[orientation=horizontal]:w-full", className)}
      defaultValue={defaultValue}
      max={max}
      min={min}
      thumbAlignment="edge"
      value={value}
      {...props}
    >
      {children}
      <SliderPrimitive.Control
        className="flex touch-none select-none data-disabled:pointer-events-none data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=horizontal]:w-full data-[orientation=horizontal]:min-w-44 data-[orientation=vertical]:flex-col data-disabled:opacity-50"
        data-slot="slider-control"
      >
        <SliderPrimitive.Track
          className="relative grow select-none rounded-full bg-muted data-[orientation=horizontal]:h-1.5 data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-1.5"
          data-slot="slider-track"
        >
          <SliderPrimitive.Indicator
            className="absolute rounded-full bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
            data-slot="slider-indicator"
          />
          {Array.from({ length: values.length }, (_, index) => (
            <SliderPrimitive.Thumb
              className="block size-4 shrink-0 select-none rounded-full border border-border bg-background outline-none transition-colors duration-[120ms] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              data-slot="slider-thumb"
              index={index}
              key={String(index)}
            />
          ))}
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export function SliderValue({
  className,
  ...props
}: SliderPrimitive.Value.Props): React.ReactElement {
  return (
    <SliderPrimitive.Value
      className={cn("flex justify-end font-mono text-sm tabular-nums", className)}
      data-slot="slider-value"
      {...props}
    />
  )
}

export { SliderPrimitive }

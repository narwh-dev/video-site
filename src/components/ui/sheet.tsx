import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { XIcon } from "lucide-react"
import type React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export const Sheet: typeof SheetPrimitive.Root = SheetPrimitive.Root

export const SheetPortal: typeof SheetPrimitive.Portal = SheetPrimitive.Portal

export function SheetTrigger(
  props: SheetPrimitive.Trigger.Props,
): React.ReactElement {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

export function SheetClose(
  props: SheetPrimitive.Close.Props,
): React.ReactElement {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

export function SheetBackdrop({
  className,
  ...props
}: SheetPrimitive.Backdrop.Props): React.ReactElement {
  return (
    <SheetPrimitive.Backdrop
      className={cn(
        "fixed inset-0 z-50 bg-black/40 transition-opacity duration-[120ms] data-ending-style:opacity-0 data-starting-style:opacity-0",
        className,
      )}
      data-slot="sheet-backdrop"
      {...props}
    />
  )
}

export function SheetViewport({
  className,
  side,
  variant = "default",
  ...props
}: SheetPrimitive.Viewport.Props & {
  side?: "right" | "left" | "top" | "bottom"
  variant?: "default" | "inset"
}): React.ReactElement {
  return (
    <SheetPrimitive.Viewport
      className={cn(
        "fixed inset-0 z-50 grid",
        side === "bottom" && "grid grid-rows-[1fr_auto] pt-12",
        side === "top" && "grid grid-rows-[auto_1fr] pb-12",
        side === "left" && "flex justify-start",
        side === "right" && "flex justify-end",
        variant === "inset" && "sm:p-4",
        className,
      )}
      data-slot="sheet-viewport"
      {...props}
    />
  )
}

export function SheetPopup({
  className,
  children,
  showCloseButton = true,
  side = "right",
  variant = "default",
  closeProps,
  portalProps,
  ...props
}: SheetPrimitive.Popup.Props & {
  showCloseButton?: boolean
  side?: "right" | "left" | "top" | "bottom"
  variant?: "default" | "inset"
  closeProps?: SheetPrimitive.Close.Props
  portalProps?: SheetPrimitive.Portal.Props
}): React.ReactElement {
  return (
    <SheetPortal {...portalProps}>
      <SheetBackdrop />
      <SheetViewport side={side} variant={variant}>
        <SheetPrimitive.Popup
          className={cn(
            "relative flex max-h-full min-h-0 w-full min-w-0 flex-col border-border bg-popover text-popover-foreground shadow-lg outline-none transition-[opacity,translate] duration-[160ms] ease-out data-ending-style:opacity-0 data-starting-style:opacity-0",
            side === "bottom" &&
              "row-start-2 rounded-t-[18px] border-t data-ending-style:translate-y-full data-starting-style:translate-y-full",
            side === "top" &&
              "rounded-b-[18px] border-b data-ending-style:-translate-y-full data-starting-style:-translate-y-full",
            side === "left" &&
              "h-full w-[min(100%,276px)] max-w-md rounded-r-[18px] border-e data-ending-style:-translate-x-full data-starting-style:-translate-x-full",
            side === "right" &&
              "col-start-2 h-full w-[min(100%,276px)] max-w-md rounded-l-[18px] border-s data-ending-style:translate-x-full data-starting-style:translate-x-full",
            variant === "inset" && "sm:rounded-[18px] sm:border",
            className,
          )}
          data-slot="sheet-popup"
          {...props}
        >
          {children}
          {showCloseButton ? (
            <SheetPrimitive.Close
              aria-label="关闭"
              className="absolute end-2 top-2"
              render={<Button size="icon-sm" variant="ghost" />}
              {...closeProps}
            >
              <XIcon />
            </SheetPrimitive.Close>
          ) : null}
        </SheetPrimitive.Popup>
      </SheetViewport>
    </SheetPortal>
  )
}

export function SheetHeader({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">): React.ReactElement {
  const defaultProps = {
    className: cn("flex flex-col gap-2 p-6 pb-3", className),
    "data-slot": "sheet-header",
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  })
}

export function SheetFooter({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"div"> & {
  variant?: "default" | "bare"
}): React.ReactElement {
  const defaultProps = {
    className: cn(
      "flex flex-col-reverse gap-2 px-6 sm:flex-row sm:justify-end",
      variant === "default" && "border-t border-border bg-muted/40 py-4",
      variant === "bare" && "pt-3 pb-6",
      className,
    ),
    "data-slot": "sheet-footer",
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  })
}

export function SheetTitle({
  className,
  ...props
}: SheetPrimitive.Title.Props): React.ReactElement {
  return (
    <SheetPrimitive.Title
      className={cn("font-semibold text-base leading-none", className)}
      data-slot="sheet-title"
      {...props}
    />
  )
}

export function SheetDescription({
  className,
  ...props
}: SheetPrimitive.Description.Props): React.ReactElement {
  return (
    <SheetPrimitive.Description
      className={cn("text-muted-foreground text-sm", className)}
      data-slot="sheet-description"
      {...props}
    />
  )
}

export function SheetPanel({
  className,
  scrollFade = true,
  render,
  ...props
}: useRender.ComponentProps<"div"> & {
  scrollFade?: boolean
}): React.ReactElement {
  const defaultProps = {
    className: cn("p-6 pt-1", className),
    "data-slot": "sheet-panel",
  }

  return (
    <ScrollArea overscrollContain scrollFade={scrollFade}>
      {useRender({
        defaultTagName: "div",
        props: mergeProps<"div">(defaultProps, props),
        render,
      })}
    </ScrollArea>
  )
}

export {
  SheetPrimitive,
  SheetBackdrop as SheetOverlay,
  SheetPopup as SheetContent,
}

import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { XIcon } from "lucide-react"
import type React from "react"
import { createContext, useContext } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

type DrawerPosition = "right" | "left" | "top" | "bottom"

const DrawerContext: React.Context<{ position: DrawerPosition }> =
  createContext<{ position: DrawerPosition }>({
    position: "bottom",
  })

const directionMap: Record<
  DrawerPosition,
  DrawerPrimitive.Root.Props["swipeDirection"]
> = {
  bottom: "down",
  left: "left",
  right: "right",
  top: "up",
}

export const DrawerCreateHandle: typeof DrawerPrimitive.createHandle =
  DrawerPrimitive.createHandle

export function Drawer({
  swipeDirection,
  position = "bottom",
  ...props
}: DrawerPrimitive.Root.Props & {
  position?: DrawerPosition
}): React.ReactElement {
  return (
    <DrawerContext.Provider value={{ position }}>
      <DrawerPrimitive.Root
        swipeDirection={swipeDirection ?? directionMap[position]}
        {...props}
      />
    </DrawerContext.Provider>
  )
}

export const DrawerPortal: typeof DrawerPrimitive.Portal =
  DrawerPrimitive.Portal

export function DrawerTrigger(
  props: DrawerPrimitive.Trigger.Props,
): React.ReactElement {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

export function DrawerClose(
  props: DrawerPrimitive.Close.Props,
): React.ReactElement {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}

export function DrawerSwipeArea({
  className,
  position: positionProp,
  ...props
}: DrawerPrimitive.SwipeArea.Props & {
  position?: DrawerPosition
}): React.ReactElement {
  const { position: contextPosition } = useContext(DrawerContext)
  const position = positionProp ?? contextPosition

  return (
    <DrawerPrimitive.SwipeArea
      className={cn(
        "fixed z-50 touch-none",
        position === "bottom" && "inset-x-0 bottom-0 h-8",
        position === "top" && "inset-x-0 top-0 h-8",
        position === "left" && "inset-y-0 left-0 w-8",
        position === "right" && "inset-y-0 right-0 w-8",
        className,
      )}
      data-slot="drawer-swipe-area"
      {...props}
    />
  )
}

export function DrawerBackdrop({
  className,
  ...props
}: DrawerPrimitive.Backdrop.Props): React.ReactElement {
  return (
    <DrawerPrimitive.Backdrop
      className={cn(
        "fixed inset-0 z-50 bg-black/40 transition-opacity duration-[160ms] data-ending-style:opacity-0 data-starting-style:opacity-0",
        className,
      )}
      data-slot="drawer-backdrop"
      {...props}
    />
  )
}

export function DrawerViewport({
  className,
  position,
  variant = "default",
  ...props
}: DrawerPrimitive.Viewport.Props & {
  position?: DrawerPosition
  variant?: "default" | "straight" | "inset"
}): React.ReactElement {
  return (
    <DrawerPrimitive.Viewport
      className={cn(
        "fixed inset-0 z-50",
        position === "bottom" && "grid grid-rows-[1fr_auto] pt-12",
        position === "top" && "grid grid-rows-[auto_1fr] pb-12",
        position === "left" && "flex justify-start",
        position === "right" && "flex justify-end",
        variant === "inset" && "sm:p-4",
        className,
      )}
      data-slot="drawer-viewport"
      {...props}
    />
  )
}

export function DrawerPopup({
  className,
  children,
  showCloseButton = false,
  position: positionProp,
  variant = "default",
  showBar = true,
  portalProps,
  ...props
}: DrawerPrimitive.Popup.Props & {
  showCloseButton?: boolean
  position?: DrawerPosition
  variant?: "default" | "straight" | "inset"
  showBar?: boolean
  portalProps?: DrawerPrimitive.Portal.Props
}): React.ReactElement {
  const { position: contextPosition } = useContext(DrawerContext)
  const position = positionProp ?? contextPosition

  return (
    <DrawerPortal {...portalProps}>
      <DrawerBackdrop />
      <DrawerViewport position={position} variant={variant}>
        <DrawerPrimitive.Popup
          className={cn(
            "relative flex max-h-full min-h-0 w-full min-w-0 flex-col border-border bg-popover text-popover-foreground shadow-lg outline-none transition-transform duration-[160ms] ease-out",
            position === "bottom" &&
              "row-start-2 border-t data-ending-style:translate-y-full data-starting-style:translate-y-full",
            position === "top" &&
              "border-b data-ending-style:-translate-y-full data-starting-style:-translate-y-full",
            position === "left" &&
              "h-full w-[min(100%,24rem)] max-w-md border-e data-ending-style:-translate-x-full data-starting-style:-translate-x-full",
            position === "right" &&
              "col-start-2 h-full w-[min(100%,24rem)] max-w-md border-s data-ending-style:translate-x-full data-starting-style:translate-x-full",
            variant !== "straight" &&
              cn(
                position === "bottom" && "rounded-t-[18px]",
                position === "top" && "rounded-b-[18px]",
                position === "left" && "rounded-e-[18px]",
                position === "right" && "rounded-s-[18px]",
              ),
            variant === "inset" && "sm:rounded-[18px] sm:border",
            className,
          )}
          data-slot="drawer-popup"
          {...props}
        >
          {showBar && position === "bottom" ? <DrawerBar /> : null}
          {children}
          {showCloseButton ? (
            <DrawerPrimitive.Close
              aria-label="关闭"
              className="absolute end-2 top-2"
              render={<Button size="icon-sm" variant="ghost" />}
            >
              <XIcon />
            </DrawerPrimitive.Close>
          ) : null}
        </DrawerPrimitive.Popup>
      </DrawerViewport>
    </DrawerPortal>
  )
}

export function DrawerHeader({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">): React.ReactElement {
  const defaultProps = {
    className: cn("flex flex-col gap-2 p-6 pb-3", className),
    "data-slot": "drawer-header",
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  })
}

export function DrawerFooter({
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
    "data-slot": "drawer-footer",
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  })
}

export function DrawerTitle({
  className,
  ...props
}: DrawerPrimitive.Title.Props): React.ReactElement {
  return (
    <DrawerPrimitive.Title
      className={cn("font-semibold text-base leading-none", className)}
      data-slot="drawer-title"
      {...props}
    />
  )
}

export function DrawerDescription({
  className,
  ...props
}: DrawerPrimitive.Description.Props): React.ReactElement {
  return (
    <DrawerPrimitive.Description
      className={cn("text-muted-foreground text-sm", className)}
      data-slot="drawer-description"
      {...props}
    />
  )
}

export function DrawerPanel({
  className,
  scrollFade = true,
  render,
  ...props
}: useRender.ComponentProps<"div"> & {
  scrollFade?: boolean
}): React.ReactElement {
  const defaultProps = {
    className: cn("p-6 pt-1", className),
    "data-slot": "drawer-panel",
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

export function DrawerBar({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      className={cn("flex justify-center py-2", className)}
      data-slot="drawer-bar"
      {...props}
    >
      <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
    </div>
  )
}

export const DrawerContent: typeof DrawerPrimitive.Content =
  DrawerPrimitive.Content

export {
  DrawerPrimitive,
  DrawerPopup as DrawerContentPopup,
  DrawerBackdrop as DrawerOverlay,
}

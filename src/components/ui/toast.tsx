import { Toast } from "@base-ui/react/toast"
import {
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  LoaderCircleIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

const TOAST_ICONS = {
  error: CircleAlertIcon,
  destructive: CircleAlertIcon,
  info: InfoIcon,
  loading: LoaderCircleIcon,
  success: CircleCheckIcon,
  warning: TriangleAlertIcon,
  default: InfoIcon,
} as const

type ToastVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "destructive"
  | "info"
  | "loading"

type ToastData = {
  variant?: ToastVariant
  action?: {
    label: string
    onSelect: () => void
  }
}

type SwipeDirection = "up" | "down" | "left" | "right"

function getSwipeDirection(position: ToastPosition): SwipeDirection[] {
  const verticalDirection: SwipeDirection = position.startsWith("top")
    ? "up"
    : "down"
  if (position.includes("center")) return [verticalDirection]
  if (position.includes("left")) return ["left", verticalDirection]
  return ["right", verticalDirection]
}

function Toasts({
  position,
  portalProps,
}: {
  position: ToastPosition
  portalProps?: React.ComponentProps<typeof Toast.Portal>
}): React.ReactElement {
  const { toasts } = Toast.useToastManager()
  const swipeDirection = getSwipeDirection(position)

  return (
    <Toast.Portal data-slot="toast-portal" {...portalProps}>
      <Toast.Viewport
        className={cn(
          "fixed z-[60] mx-auto flex w-[calc(100%-2rem)] max-w-sm outline-none",
          "data-[position*=top]:top-4",
          "data-[position*=bottom]:bottom-4",
          "data-[position*=left]:left-4",
          "data-[position*=right]:right-4",
          "data-[position*=center]:left-1/2 data-[position*=center]:-translate-x-1/2",
          "max-sm:data-[position*=right]:left-1/2 max-sm:data-[position*=right]:right-auto max-sm:data-[position*=right]:-translate-x-1/2",
          "max-sm:data-[position*=left]:left-1/2 max-sm:data-[position*=left]:-translate-x-1/2",
        )}
        data-position={position}
        data-slot="toast-viewport"
      >
        {toasts.map((toast) => {
          const data = toast.data as ToastData | undefined
          const variant =
            data?.variant ??
            (toast.type as ToastVariant | undefined) ??
            "default"
          const Icon =
            TOAST_ICONS[variant as keyof typeof TOAST_ICONS] ?? TOAST_ICONS.default
          const isError = variant === "error" || variant === "destructive"
          const action = data?.action ?? (toast.actionProps
            ? {
                label: String(toast.actionProps.children ?? ""),
                onSelect: () => {
                  const handler = toast.actionProps?.onClick
                  if (typeof handler === "function") {
                    handler({} as React.MouseEvent<HTMLButtonElement>)
                  }
                },
              }
            : undefined)

          return (
            <Toast.Root
              key={toast.id}
              className={cn(
                "absolute z-[calc(9999-var(--toast-index))] w-full select-none rounded-xl border border-border bg-popover text-popover-foreground shadow-lg outline-none transition-[transform,opacity] duration-[120ms]",
                "data-[position*=right]:right-0",
                "data-[position*=left]:left-0",
                "data-[position*=center]:left-0 data-[position*=center]:right-0",
                "data-[position*=top]:top-0",
                "data-[position*=bottom]:bottom-0",
                "data-limited:opacity-0",
                "data-ending-style:opacity-0",
                "data-[position*=bottom]:data-starting-style:translate-y-2",
                "data-[position*=top]:data-starting-style:-translate-y-2",
              )}
              data-position={position}
              data-type={variant}
              swipeDirection={swipeDirection}
              toast={toast}
            >
              <Toast.Content
                aria-live={isError ? "assertive" : "polite"}
                className="pointer-events-auto flex items-start gap-3 overflow-hidden px-3.5 py-3 text-sm"
                role={isError ? "alert" : "status"}
              >
                <div
                  className="mt-0.5 [&_svg]:size-4 [&_svg]:shrink-0"
                  data-slot="toast-icon"
                >
                  <Icon
                    className={cn(
                      variant === "loading" && "animate-spin opacity-80",
                      variant === "error" && "text-destructive",
                      variant === "destructive" && "text-destructive",
                      variant === "success" && "text-success",
                      variant === "warning" && "text-warning",
                      variant === "info" && "text-primary",
                    )}
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <Toast.Title
                    className="font-medium text-sm"
                    data-slot="toast-title"
                  />
                  <Toast.Description
                    className="text-muted-foreground text-[13px]"
                    data-slot="toast-description"
                  />
                  {action ? (
                    <button
                      className={cn(
                        buttonVariants({ size: "xs", variant: "ghost" }),
                        "mt-1 h-7 self-start px-2",
                      )}
                      data-slot="toast-action"
                      onClick={() => {
                        action.onSelect()
                        toastManager.close(toast.id)
                      }}
                      type="button"
                    >
                      {action.label}
                    </button>
                  ) : null}
                </div>
                <Toast.Close
                  aria-label="关闭"
                  className={cn(
                    buttonVariants({ size: "icon-xs", variant: "ghost" }),
                    "shrink-0",
                  )}
                  data-slot="toast-close"
                >
                  <XIcon />
                </Toast.Close>
              </Toast.Content>
            </Toast.Root>
          )
        })}
      </Toast.Viewport>
    </Toast.Portal>
  )
}

export const toastManager: ReturnType<typeof Toast.createToastManager> =
  Toast.createToastManager()

export const anchoredToastManager: ReturnType<typeof Toast.createToastManager> =
  Toast.createToastManager()

export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"

export interface ToastProviderProps extends Toast.Provider.Props {
  position?: ToastPosition
  portalProps?: React.ComponentProps<typeof Toast.Portal>
}

export function ToastProvider({
  children,
  position = "bottom-right",
  portalProps,
  timeout = 5000,
  ...props
}: ToastProviderProps): React.ReactElement {
  return (
    <Toast.Provider
      timeout={timeout}
      toastManager={toastManager}
      {...props}
    >
      {children}
      <Toasts portalProps={portalProps} position={position} />
    </Toast.Provider>
  )
}

export function Toaster({
  position = "bottom-right",
  ...props
}: Omit<ToastProviderProps, "children"> & {
  children?: React.ReactNode
}): React.ReactElement {
  return (
    <ToastProvider position={position} {...props}>
      {props.children}
    </ToastProvider>
  )
}

export interface ToastOptions {
  title: React.ReactNode
  description?: React.ReactNode
  variant?: ToastVariant
  action?: {
    label: string
    onSelect: () => void
  }
  duration?: number
  id?: string
}

export function useToast(): {
  toast: (options: ToastOptions) => string
  dismiss: (id?: string) => void
} {
  const manager = Toast.useToastManager()

  const toast = React.useCallback(
    (options: ToastOptions) => {
      const variant = options.variant ?? "default"
      const isError = variant === "error" || variant === "destructive"
      return manager.add({
        id: options.id,
        title: options.title,
        description: options.description,
        type: variant,
        timeout: options.duration ?? 5000,
        priority: isError ? "high" : "low",
        data: {
          variant,
          action: options.action,
        } satisfies ToastData,
        actionProps: options.action
          ? {
              children: options.action.label,
              onClick: () => options.action?.onSelect(),
            }
          : undefined,
      })
    },
    [manager],
  )

  const dismiss = React.useCallback(
    (id?: string) => {
      manager.close(id)
    },
    [manager],
  )

  return { toast, dismiss }
}

export function toast(options: ToastOptions): string {
  const variant = options.variant ?? "default"
  const isError = variant === "error" || variant === "destructive"
  return toastManager.add({
    id: options.id,
    title: options.title,
    description: options.description,
    type: variant,
    timeout: options.duration ?? 5000,
    priority: isError ? "high" : "low",
    data: {
      variant,
      action: options.action,
    } satisfies ToastData,
    actionProps: options.action
      ? {
          children: options.action.label,
          onClick: () => options.action?.onSelect(),
        }
      : undefined,
  })
}

export { Toast as ToastPrimitive }

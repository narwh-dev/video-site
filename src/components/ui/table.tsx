import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import type React from "react"
import { cn } from "@/lib/utils"

export type TableProps = React.ComponentProps<"table"> & {
  render?: useRender.ComponentProps<"div">["render"]
}

export function Table({
  className,
  render,
  ...props
}: TableProps): React.ReactElement {
  const defaultProps = {
    children: (
      <table
        className={cn("w-full caption-bottom text-sm", className)}
        data-slot="table"
        {...props}
      />
    ),
    className: "relative w-full overflow-x-auto",
    "data-slot": "table-container",
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, {}),
    render,
  })
}

export function TableHeader({
  className,
  ...props
}: React.ComponentProps<"thead">): React.ReactElement {
  return (
    <thead
      className={cn(
        "[&_tr]:border-b sticky top-0 z-10 bg-background [&_th]:bg-background",
        className,
      )}
      data-slot="table-header"
      {...props}
    />
  )
}

export function TableBody({
  className,
  ...props
}: React.ComponentProps<"tbody">): React.ReactElement {
  return (
    <tbody
      className={cn("[&_tr:last-child]:border-0", className)}
      data-slot="table-body"
      {...props}
    />
  )
}

export function TableFooter({
  className,
  ...props
}: React.ComponentProps<"tfoot">): React.ReactElement {
  return (
    <tfoot
      className={cn(
        "border-t bg-muted/40 font-medium [&>tr]:last:border-b-0",
        className,
      )}
      data-slot="table-footer"
      {...props}
    />
  )
}

export function TableRow({
  className,
  ...props
}: React.ComponentProps<"tr">): React.ReactElement {
  return (
    <tr
      className={cn(
        "h-[52px] border-b border-border transition-colors duration-[120ms] hover:bg-muted/40 data-[state=selected]:bg-muted",
        className,
      )}
      data-slot="table-row"
      {...props}
    />
  )
}

export function TableHead({
  className,
  ...props
}: React.ComponentProps<"th">): React.ReactElement {
  return (
    <th
      className={cn(
        "h-[52px] whitespace-nowrap px-3 text-left align-middle font-medium text-muted-foreground text-[13px] [&:has([role=checkbox])]:pr-0",
        className,
      )}
      data-slot="table-head"
      {...props}
    />
  )
}

export function TableCell({
  className,
  ...props
}: React.ComponentProps<"td">): React.ReactElement {
  return (
    <td
      className={cn(
        "whitespace-nowrap px-3 py-2 align-middle text-sm [&:has([role=checkbox])]:pr-0",
        className,
      )}
      data-slot="table-cell"
      {...props}
    />
  )
}

export function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">): React.ReactElement {
  return (
    <caption
      className={cn("mt-4 text-muted-foreground text-[13px]", className)}
      data-slot="table-caption"
      {...props}
    />
  )
}

export function tableNumericClassName(className?: string): string {
  return cn("text-right font-mono tabular-nums", className)
}

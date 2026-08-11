type ClassValue = string | false | null | undefined

export type VariantProps<T extends (...args: never[]) => unknown> = T extends (
  props?: infer P,
) => unknown
  ? Omit<NonNullable<P>, "className">
  : never

export function cva<
  V extends Record<string, Record<string, string>> = Record<
    string,
    Record<string, string>
  >,
>(
  base: string,
  config?: {
    variants?: V
    defaultVariants?: { [K in keyof V]?: keyof V[K] & string }
  },
): (props?: {
  [K in keyof V]?: (keyof V[K] & string) | null | undefined
} & {
  className?: ClassValue
}) => string {
  const variants = config?.variants
  const defaults = config?.defaultVariants

  return (props = {}) => {
    const classes: string[] = [base]
    const { className, ...rest } = props as Record<string, ClassValue>

    if (variants) {
      for (const key of Object.keys(variants) as (keyof V & string)[]) {
        const selected =
          (rest[key] as string | null | undefined) ??
          (defaults?.[key] as string | undefined)
        if (selected != null) {
          const value = variants[key]?.[selected]
          if (value) classes.push(value)
        }
      }
    }

    if (typeof className === "string" && className) {
      classes.push(className)
    }

    return classes.filter(Boolean).join(" ")
  }
}

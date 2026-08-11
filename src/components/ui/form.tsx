import { Form as FormPrimitive } from "@base-ui/react/form"
import type React from "react"
import { cn } from "@/lib/utils"

export function Form({
  className,
  ...props
}: FormPrimitive.Props): React.ReactElement {
  return (
    <FormPrimitive
      className={cn(className)}
      data-slot="form"
      noValidate
      {...props}
    />
  )
}

export type FormSubmit = React.ComponentProps<"button"> & {
  formAction?: string | ((formData: FormData) => void | Promise<void>)
}

export { FormPrimitive }


import { Check } from "lucide-react"
import * as React from "react"

import { cn } from "zadm/pkg/utils/ui"

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "checked" | "onChange"> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
    return (
      <label
        data-slot="checkbox"
        className={cn(
          "group inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input bg-background",
          "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2",
          "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
          checked && "border-primary bg-primary text-primary-foreground",
          className,
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        {checked && <Check className="size-3" />}
      </label>
    )
  },
)
Checkbox.displayName = "Checkbox"

export { Checkbox }

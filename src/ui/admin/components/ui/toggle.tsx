
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@zbeaver/beaver/pkg/utils/ui"

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-sm text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-8 px-2.5 min-w-8",
        sm: "h-7 px-2 min-w-7",
        lg: "h-9 px-3 min-w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ToggleProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof toggleVariants> {
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
}

function Toggle({
  className,
  variant,
  size,
  pressed,
  onPressedChange,
  onClick,
  ...props
}: ToggleProps) {
  return (
    <button
      type="button"
      role="button"
      aria-pressed={pressed}
      data-state={pressed ? "on" : "off"}
      className={cn(toggleVariants({ variant, size, className }))}
      onClick={(e) => {
        onPressedChange?.(!pressed)
        onClick?.(e)
      }}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }

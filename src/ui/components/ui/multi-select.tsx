import { ChevronDown } from "lucide-react"

import { Badge } from "@zbeaver/beaver/ui/components/ui/badge"
import { Button } from "@zbeaver/beaver/ui/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@zbeaver/beaver/ui/components/ui/dropdown-menu"
import { cn } from "@zbeaver/beaver/pkg/utils/ui"

interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select...",
  className,
}: MultiSelectProps) {
  function toggleValue(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((currentValue) => currentValue !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const selectedLabels = options
    .filter((option) => selected.includes(option.value))
    .map((option) => option.label)

  return (
    <div className={cn("relative", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="outline"
              aria-label={placeholder}
              className={cn(
                "min-h-10 w-full justify-between gap-2 px-3 py-2",
                selectedLabels.length === 0 && "text-muted-foreground"
              )}
            />
          }
        >
          {selectedLabels.length > 0 ? (
            <span className="flex min-w-0 flex-1 flex-wrap gap-1 text-left">
              {selectedLabels.slice(0, 3).map((label) => (
                <Badge
                  key={label}
                  variant="secondary"
                  className="max-w-full px-1.5 py-0 text-xs font-normal"
                >
                  <span className="truncate">{label}</span>
                </Badge>
              ))}
              {selectedLabels.length > 3 && (
                <Badge
                  variant="secondary"
                  className="px-1.5 py-0 text-xs font-normal"
                >
                  +{selectedLabels.length - 3}
                </Badge>
              )}
            </span>
          ) : (
            <span className="flex-1 text-left">{placeholder}</span>
          )}
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-(--anchor-width) min-w-48"
        >
          {options.length === 0 ? (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">
              No options available.
            </p>
          ) : (
            options.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={selected.includes(option.value)}
                onCheckedChange={() => toggleValue(option.value)}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap no-underline hover:no-underline transition-all outline-none cursor-pointer border-0 font-sans disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 hover:-translate-y-0.5",
  {
    variants: {
      variant: {
        default: "!text-white bg-[var(--green)] hover:bg-[var(--green-hover)] hover:shadow-md",
        solid: "!text-white bg-[var(--green)] hover:bg-[var(--green-hover)] hover:shadow-md",
        ghost: "!text-white border border-white/45 bg-transparent hover:bg-white hover:!text-[var(--forest)]",
        dark: "!text-white bg-[var(--forest)] hover:bg-[var(--forest-3)]",
        line: "border border-[rgba(15,26,19,0.2)] bg-transparent !text-[var(--ink)] hover:bg-[var(--forest)] hover:!text-white hover:border-[var(--forest)]",
        destructive: "!text-white bg-destructive hover:bg-destructive/90",
        outline: "border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        link: "text-primary underline-offset-4 hover:underline hover:translate-y-0",
      },
      size: {
        default: "h-9 px-4 py-2 text-sm",
        sm: "h-8 px-3 text-xs",
        xs: "h-6 gap-1 rounded-sm px-2 text-xs",
        lg: "h-10 px-6 text-sm sm:text-base",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

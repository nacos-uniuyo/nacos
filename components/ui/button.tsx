import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-all outline-none cursor-pointer border-0 font-sans disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 hover:-translate-y-0.5",
  {
    variants: {
      variant: {
        default: "bg-[var(--green)] text-white hover:bg-[var(--green-hover)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)]",
        solid: "bg-[var(--green)] text-white hover:bg-[var(--green-hover)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)]",
        ghost: "border border-white/45 bg-transparent text-white hover:bg-white hover:text-[var(--forest)]",
        dark: "bg-[var(--forest)] text-white hover:bg-[var(--forest-3)]",
        line: "border border-[rgba(15,26,19,0.2)] bg-transparent text-[var(--ink)] hover:bg-[var(--forest)] hover:text-white hover:border-[var(--forest)]",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline: "border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        link: "text-primary underline-offset-4 hover:underline hover:translate-y-0",
      },
      size: {
        default: "min-h-12 px-6.5 text-[15px]",
        sm: "min-h-11 px-5.5 text-sm",
        xs: "h-6 gap-1 rounded-md px-2 text-xs",
        lg: "min-h-14 px-8 text-base",
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

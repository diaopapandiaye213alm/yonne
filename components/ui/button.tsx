import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] min-h-[44px] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // shadcn originals (kept for backward compat)
        default:     "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:     "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:   "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 border border-neutral-200",
        ghost:       "text-neutral-700 hover:bg-neutral-100",
        link:        "text-primary underline-offset-4 hover:underline",
        // YONNE design-system variants
        primary:     "bg-neutral-900 text-white hover:bg-neutral-800 shadow-sm",
        danger:      "bg-red-600 text-white hover:bg-red-700 shadow-sm",
        "ghost-ink": "bg-transparent text-ink-700 hover:bg-cream-100 border border-cream-200",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm:      "h-9 rounded-lg px-3 text-xs gap-1.5",
        md:      "h-11 px-4 py-2.5",
        lg:      "h-12 px-6 text-base gap-2",
        icon:    "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  icon?: LucideIcon
  iconPosition?: "left" | "right"
  loading?: boolean
  fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, icon: Icon, iconPosition = "left", loading, fullWidth, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), fullWidth && "w-full")}
        ref={ref}
        disabled={loading || disabled}
        {...props}
      >
        {loading
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : Icon && iconPosition === "left" && <Icon className="w-4 h-4 shrink-0" />}
        {children}
        {!loading && Icon && iconPosition === "right" && <Icon className="w-4 h-4 shrink-0" />}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

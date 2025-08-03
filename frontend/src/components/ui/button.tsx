import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden border-glow hover-lift",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary text-primary-foreground glow-effect hover:shadow-glow-hover",
        secondary: "bg-gradient-secondary text-secondary-foreground glow-effect hover:shadow-glow-hover",
        accent: "bg-accent text-accent-foreground hover:bg-accent-glow",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-2 border-primary bg-transparent text-primary hover:bg-primary/10 hover:border-primary-glow",
        ghost: "bg-transparent text-foreground hover:bg-primary/10 hover:text-primary",
        futuristic: "bg-card-gradient border border-primary/30 text-foreground hover:border-primary hover:shadow-glow backdrop-blur-sm",
        success: "bg-success text-white hover:bg-success/90",
        warning: "bg-warning text-white hover:bg-warning/90",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 px-4 py-2",
        lg: "h-14 px-8 py-4 text-base",
        xl: "h-16 px-10 py-5 text-lg",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Sound effects
const playClickSound = () => {
  const audio = new Audio('/click-sound.mp3');
  audio.volume = 0.3;
  audio.play().catch(() => {}); // Ignore errors if sound file doesn't exist
};

const playHoverSound = () => {
  const audio = new Audio('/hover-sound.mp3');
  audio.volume = 0.1;
  audio.play().catch(() => {}); // Ignore errors if sound file doesn't exist
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  soundEnabled?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, soundEnabled = true, onClick, onMouseEnter, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (soundEnabled) playClickSound();
      onClick?.(e);
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (soundEnabled) playHoverSound();
      onMouseEnter?.(e);
    };

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

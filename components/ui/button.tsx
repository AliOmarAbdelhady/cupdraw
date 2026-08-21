import { cva, type VariantProps } from "class-variance-authority";
import { cx } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-foreground shadow-lg shadow-accent/25 hover:brightness-110",
        secondary: "border border-border bg-card hover:border-accent/40 hover:bg-muted/60",
        ghost: "hover:bg-muted/70",
        gold: "bg-gold text-gold-foreground shadow-lg shadow-gold/25 hover:brightness-105",
        danger: "border border-red-500/40 text-red-500 hover:bg-red-500/10",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-base",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cx(buttonVariants({ variant, size }), className)} {...props} />;
}

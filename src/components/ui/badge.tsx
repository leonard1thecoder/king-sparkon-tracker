import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold", {
  variants: {
    variant: {
      default: "bg-[#e9f5ef] text-[#237a5b]",
      warning: "bg-[#fff8e8] text-[#6f5620]",
      destructive: "bg-[#fff1ec] text-[#8b2d1f]",
      outline: "border border-[#d9d5c8] bg-white text-[#123c33]",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export { Badge, badgeVariants };

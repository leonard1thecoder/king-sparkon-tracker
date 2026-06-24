import type * as React from "react";
import { cn } from "@/lib/utils";

function Alert({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="status"
      data-slot="alert"
      className={cn("rounded-xl border border-[#e6dcc0] bg-[#fff8e8] px-4 py-3 text-sm leading-6 text-[#6f5620]", className)}
      {...props}
    />
  );
}

export { Alert };

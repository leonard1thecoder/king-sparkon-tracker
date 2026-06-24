import type * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full rounded-md border border-[#d3c9b9] bg-white px-3 text-sm text-[#10201d] shadow-sm shadow-[#10201d]/5 outline-none transition placeholder:text-[#8d9793] hover:border-[#9eb6aa] hover:bg-[#f9fbfa] hover:text-[#10201d] focus:border-[#237a5b] focus:bg-white focus:text-[#10201d] focus:ring-4 focus:ring-[#237a5b]/15 disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

export { Input };

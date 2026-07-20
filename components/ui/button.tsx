import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn("inline-flex min-h-10 items-center justify-center rounded-lg bg-[#3157d5] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2444b4] active:bg-[#1d378f] disabled:cursor-not-allowed disabled:opacity-55", className)} {...props} />;
}

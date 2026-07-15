"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectFieldProps = {
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
};

export function SelectField({
  name,
  value,
  defaultValue,
  onValueChange,
  options,
  placeholder = "Choose an option",
  ariaLabel,
  className,
  disabled,
}: SelectFieldProps) {
  return (
    <SelectPrimitive.Root
      name={name}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        aria-label={ariaLabel}
        className={cn(
          "group inline-flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 shadow-sm shadow-slate-950/[0.03] transition hover:border-indigo-300 hover:bg-indigo-50/30 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 data-[placeholder]:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-data-[state=open]:rotate-180 group-data-[state=open]:text-indigo-600" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className="select-popover z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl shadow-slate-950/15"
        >
          <SelectPrimitive.Viewport>
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="relative flex cursor-default select-none items-center rounded-lg py-2.5 pl-9 pr-3 text-sm font-medium text-slate-700 outline-none transition data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[highlighted]:bg-indigo-50 data-[highlighted]:text-indigo-700"
              >
                <span className="absolute left-3 flex h-4 w-4 items-center justify-center text-indigo-600">
                  <SelectPrimitive.ItemIndicator>
                    <Check className="h-4 w-4" />
                  </SelectPrimitive.ItemIndicator>
                </span>
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

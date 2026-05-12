import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const CheckBengal = (str)=>/[\u0980-\u09FF]/.test(str || "");

const envBoolean = (value?: string): boolean => value === "true";

export const isCommercial: boolean = envBoolean(process.env.NEXT_PUBLIC_IS_COMMERCIAL) || false;
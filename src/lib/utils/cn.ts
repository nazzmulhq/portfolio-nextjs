import clsx from "clsx";
import { twMerge } from "tailwind-merge";

type ClassValue = string | undefined | null | boolean;

function cn(...classes: ClassValue[]): string {
    return twMerge(clsx(...classes));
}

export default cn;
